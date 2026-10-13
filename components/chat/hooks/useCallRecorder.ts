"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Options {
  sessionId: string;
  callType: "AUDIO" | "VIDEO";
  /** Whether THIS client should record (the caller — exactly one recorder). */
  enabled: boolean;
  localStream: MediaStream | null;
  getRemoteStreams: () => MediaStream[];
}

/**
 * useCallRecorder — automatic server-side-stored call recording.
 *
 * - Starts by itself as soon as there is media; no admin joins, no manual
 *   start/stop, nothing saved locally.
 * - VIDEO calls: canvas compositor tiles the remote videos (1 = fullscreen,
 *   2 = side-by-side, 3+ = grid) + local PiP, mixed with ALL audio
 *   (local + every remote) → compressed webm (~1.2 Mbps VP8 + 64 kbps Opus).
 * - AUDIO calls: mixed audio only (webm/opus).
 * - On stop: presigned PUT straight to MinIO (never through Vercel), then a
 *   CallRecording row is created → the recording shows up in /calls/recordings
 *   with view + download.
 * - Failure of any upload step only logs — it NEVER disturbs the call.
 */
export function useCallRecorder({
  sessionId,
  callType,
  enabled,
  localStream,
  getRemoteStreams,
}: Options) {
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const startedAtRef = useRef<number | null>(null);
  const stateRef = useRef({ sessionId, callType, enabled });
  stateRef.current = { sessionId, callType, enabled };
  const [status, setStatus] = useState<
    "idle" | "recording" | "uploading" | "saved" | "failed"
  >("idle");
  const localRef = useRef(localStream);
  localRef.current = localStream;
  const remoteGetterRef = useRef(getRemoteStreams);
  remoteGetterRef.current = getRemoteStreams;

  const upload = useCallback(async (blob: Blob, durationSec: number) => {
    const { sessionId: sid, callType: ct } = stateRef.current;
    try {
      setStatus("uploading");
      const presign = await fetch("/api/calls/recordings/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sid,
          callType: ct,
          mimeType: blob.type,
          sizeBytes: blob.size,
        }),
      }).then((r) => r.json());
      if (!presign?.success) throw new Error("presign failed");

      // Large recordings come back as multipart (Cloudflare caps a single
      // proxied PUT at 100MB): slice the blob into parts, PUT each, then
      // complete stitches them server-side. Small ones are one PUT.
      if (presign.mode === "multipart" && Array.isArray(presign.urls)) {
        const partSize = Number(presign.partSize);
        const parts: { part: number; etag?: string }[] = [];
        for (let i = 0; i < presign.urls.length; i++) {
          const start = i * partSize;
          const chunk = blob.slice(
            start,
            Math.min(start + partSize, blob.size),
            blob.type
          );
          const put = await fetch(presign.urls[i], {
            method: "PUT",
            body: chunk,
          });
          if (!put.ok) {
            // Best-effort abort so uploaded parts don't linger on disk.
            void fetch("/api/calls/recordings/abort", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sessionId: sid,
                key: presign.key,
                uploadId: presign.uploadId,
              }),
            }).catch(() => {});
            throw new Error(`part ${i + 1}/${presign.urls.length} failed: ${put.status}`);
          }
          parts.push({ part: i + 1, etag: put.headers.get("ETag") ?? undefined });
        }
        const complete = await fetch("/api/calls/recordings/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sid,
            key: presign.key,
            uploadId: presign.uploadId,
            parts,
            callType: ct,
            mimeType: blob.type,
            durationSec,
            sizeBytes: blob.size,
          }),
        }).then((r) => r.json());
        if (!complete?.success) throw new Error("complete failed");
      } else {
        const put = await fetch(presign.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": blob.type },
          body: blob,
        });
        if (!put.ok) throw new Error(`upload failed: ${put.status}`);

        const complete = await fetch("/api/calls/recordings/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: sid,
            key: presign.key,
            callType: ct,
            mimeType: blob.type,
            durationSec,
            sizeBytes: blob.size,
          }),
        }).then((r) => r.json());
        if (!complete?.success) throw new Error("complete failed");
      }
      setStatus("saved");
      console.log("[recorder] saved", presign.key, `${(blob.size / 1e6).toFixed(1)}MB`);
    } catch (e) {
      setStatus("failed");
      console.error("[recorder] upload failed:", e);
    }
  }, []);

  const stop = useCallback(() => {
    const rec = recorderRef.current;
    if (rec && rec.state !== "inactive") {
      rec.stop(); // onstop handler builds the blob + uploads
    }
  }, []);

  // Auto-start when enabled + media present.
  useEffect(() => {
    if (!enabled || recorderRef.current || !localStream) return;
    try {
      const tracks: MediaStreamTrack[] = [];
      let videoTrack: MediaStreamTrack | null = null;

      // ── Mix ALL audio (local + remotes) ──
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const dest = ctx.createMediaStreamDestination();
      const connect = (s: MediaStream | null | undefined) => {
        if (!s) return;
        s.getAudioTracks().forEach((track) => {
          try {
            ctx.createMediaStreamSource(new MediaStream([track.clone()])).connect(dest);
          } catch { /* ignore */ }
        });
      };
      connect(localStream);
      remoteGetterRef.current().forEach(connect);
      tracks.push(...dest.stream.getAudioTracks());

      // ── Video calls: canvas compositor ──
      if (callType === "VIDEO") {
        const canvas = document.createElement("canvas");
        canvas.width = 1280;
        canvas.height = 720;
        canvasRef.current = canvas;
        const c2d = canvas.getContext("2d");
        
        // Cache video elements so we don't create them every frame
        const videoEls = new Map<string, HTMLVideoElement>();
        const getCachedVideo = (stream: MediaStream) => {
          if (videoEls.has(stream.id)) return videoEls.get(stream.id)!;
          const el = document.createElement("video");
          el.srcObject = stream;
          el.muted = true;
          el.playsInline = true;
          void el.play().catch(() => {});
          videoEls.set(stream.id, el);
          return el;
        };

        const draw = () => {
          if (!c2d) return;
          const remotes = remoteGetterRef.current();
          const vids = remotes
            .map((s) => s.getVideoTracks()[0])
            .filter(Boolean) as MediaStreamTrack[];
          c2d.fillStyle = "#111b21";
          c2d.fillRect(0, 0, canvas.width, canvas.height);
          const n = Math.max(vids.length, 1);
          const cols = n <= 1 ? 1 : 2;
          const rows = Math.ceil(n / cols);
          const w = canvas.width / cols;
          const h = canvas.height / rows;
          vids.forEach((t, i) => {
            const stream = remotes.find((s) => s.getVideoTracks()[0] === t)!;
            const el = getCachedVideo(stream);
            const x = (i % cols) * w;
            const y = Math.floor(i / cols) * h;
            try {
              // CONTAIN (letterbox): scale the whole frame to FIT inside the
              // cell, centered on the dark background — same visual as the
              // live call's object-contain. (The previous ratio-branch math
              // was inverted: portrait videos scaled to COVER the cell and
              // overflowed the canvas — a phone guest filled the recording.)
              const vw = el.videoWidth;
              const vh = el.videoHeight;
              if (!vw || !vh) return; // frame not ready yet
              const scale = Math.min(w / vw, h / vh);
              const dw = vw * scale;
              const dh = vh * scale;
              c2d.drawImage(el, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
            } catch { /* frame not ready */ }
          });
          // Local PiP (bottom-right, mirrored feel skipped)
          const lt = localRef.current?.getVideoTracks()[0];
          if (lt && localRef.current) {
            const el = getCachedVideo(localRef.current);
            try {
              c2d.drawImage(el, canvas.width - 202, canvas.height - 152, 180, 135);
            } catch { /* not ready */ }
          }
          rafRef.current = requestAnimationFrame(draw);
        };
        draw();
        videoTrack = (canvas as any).captureStream(24).getVideoTracks()[0];
        if (videoTrack) tracks.unshift(videoTrack);
      }

      const mixed = new MediaStream(tracks);
      const mimeType =
        callType === "VIDEO"
          ? MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
            ? "video/webm;codecs=vp8,opus"
            : "video/webm"
          : MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : "audio/webm";
      const rec = new MediaRecorder(mixed, {
        mimeType,
        videoBitsPerSecond: 1_200_000, // compression for storage
        audioBitsPerSecond: 64_000,
      });
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = async () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        const dur = startedAtRef.current
          ? Math.round((Date.now() - startedAtRef.current) / 1000)
          : 0;
        const blob = new Blob(chunksRef.current, { type: mimeType.split(";")[0] });
        chunksRef.current = [];
        audioCtxRef.current?.close().catch(() => {});
        if (blob.size < 1024) return; // empty/nonsense recording
        await upload(blob, dur);
      };
      rec.start(5000); // 5s chunks → onstop has everything
      startedAtRef.current = Date.now();
      recorderRef.current = rec;
      setStatus("recording");
      console.log("[recorder] auto-recording started", callType);
    } catch (e) {
      console.error("[recorder] failed to start:", e);
      setStatus("failed");
    }
  }, [enabled, localStream, callType, upload]);

  // Auto-stop + cleanup on unmount (call ended).
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { status, stop };
}
