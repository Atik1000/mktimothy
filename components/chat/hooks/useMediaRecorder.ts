"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseMediaRecorderOptions {
  /** Audio sources to record (local mic + remote peer audio mixed). */
  getStream: () => MediaStream;
  /** Mime type for the recording. Defaults to audio/webm (Opus). */
  mimeType?: string;
}

// Cached lamejs module loaded from the local public folder. The CDN version
// is blocked by Edge Tracking Prevention, so we self-host the script.
let lamejsModule: any = null;
let lamejsPromise: Promise<any> | null = null;

async function loadLamejs(): Promise<any> {
  if (lamejsModule) return lamejsModule;
  if (lamejsPromise) return lamejsPromise;
  lamejsPromise = new Promise((resolve, reject) => {
    // Check if already loaded on window.
    const w = window as any;
    if (w.lamejs) {
      lamejsModule = w.lamejs;
      resolve(w.lamejs);
      return;
    }
    const script = document.createElement("script");
    script.src = "/lib/lame.min.js";
    script.async = true;
    script.onload = () => {
      const mod = (window as any).lamejs;
      if (!mod) {
        reject(new Error("lamejs failed to initialize"));
        return;
      }
      lamejsModule = mod;
      resolve(mod);
    };
    script.onerror = () => reject(new Error("Failed to load lamejs"));
    document.head.appendChild(script);
  });
  return lamejsPromise;
}

/**
 * Encode a Float32 PCM buffer to an MP3 Blob using lamejs (128 kbps mono).
 */
function encodePcmToMp3(
  lamejs: any,
  samples: Float32Array,
  sampleRate: number
): Blob {
  const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
  // Convert float32 [-1,1] to 16-bit PCM.
  const int16 = new Int16Array(samples.length);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const blockSize = 1152;
  const data: number[] = [];
  for (let i = 0; i < int16.length; i += blockSize) {
    const chunk = int16.subarray(i, i + blockSize);
    const mp3buf = mp3encoder.encodeBuffer(chunk);
    if (mp3buf.length > 0) data.push(...mp3buf);
  }
  const end = mp3encoder.flush();
  if (end.length > 0) data.push(...end);
  return new Blob([new Uint8Array(data)], { type: "audio/mpeg" });
}

/**
 * Decode a recorded Blob (webm/Opus) to mono PCM via the Web Audio API, then
 * re-encode to a genuine MP3 file. Returns null if decoding isn't supported.
 */
async function blobToMp3(blob: Blob): Promise<Blob | null> {
  try {
    const lamejs = await loadLamejs();
    const arrayBuffer = await blob.arrayBuffer();
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AC();
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    ctx.close();
    // Mix down to mono.
    const ch0 = audioBuffer.getChannelData(0);
    const ch1 =
      audioBuffer.numberOfChannels > 1
        ? audioBuffer.getChannelData(1)
        : ch0;
    const mono = new Float32Array(ch0.length);
    for (let i = 0; i < ch0.length; i++) {
      mono[i] = (ch0[i] + ch1[i]) / 2;
    }
    return encodePcmToMp3(lamejs, mono, audioBuffer.sampleRate);
  } catch (err) {
    console.error("[useMediaRecorder] mp3 conversion failed:", err);
    return null;
  }
}

/**
 * useMediaRecorder — records an audio-only stream (the user's mic plus remote
 * peer audio, mixed together) using MediaRecorder. On stop, the recording is
 * converted to a genuine MP3 file (via lamejs) for download. Recording is
 * always audio-only even for video calls, per the admin requirement.
 */
export function useMediaRecorder({
  getStream,
  mimeType = "audio/webm",
}: UseMediaRecorderOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [lastBlob, setLastBlob] = useState<{
    blob: Blob;
    url: string;
    durationSec: number;
  } | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (recorderRef.current) return;
    const stream = getStream();
    if (!stream || stream.getTracks().length === 0) return;

    // Preload lamejs so it's ready by the time recording stops. Without this,
    // the MP3 conversion races the async script load and falls back to webm.
    loadLamejs().catch(() => {});

    // Pick a supported mime type.
    const candidates = [
      mimeType,
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
    ];
    const type = candidates.find(
      (t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)
    );

    try {
      const recorder = new MediaRecorder(
        stream,
        type ? { mimeType: type } : undefined
      );
      chunksRef.current = [];
      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };
      recorder.onstop = async () => {
        const webmBlob = new Blob(chunksRef.current, {
          type: type || "audio/webm",
        });
        const duration = Math.round(
          (Date.now() - startTimeRef.current) / 1000
        );
        chunksRef.current = [];
        // Convert to a genuine MP3 file. If conversion fails (rare), fall
        // back to the original webm so the recording isn't lost.
        const mp3Blob = await blobToMp3(webmBlob);
        const finalBlob = mp3Blob ?? webmBlob;
        const url = URL.createObjectURL(finalBlob);
        setLastBlob({ blob: finalBlob, url, durationSec: duration });
      };
      recorder.start(1000); // collect data every second
      recorderRef.current = recorder;
      startTimeRef.current = Date.now();
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setDurationSec(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } catch (err) {
      console.error("[useMediaRecorder] start error:", err);
    }
  }, [getStream, mimeType]);

  const stop = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    recorderRef.current = null;
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      if (recorderRef.current && recorderRef.current.state !== "inactive") {
        recorderRef.current.stop();
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (lastBlob?.url) URL.revokeObjectURL(lastBlob.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Download the last recording to the admin's local machine as MP3. */
  const downloadLast = useCallback(
    (filename?: string) => {
      if (!lastBlob) return;
      const a = document.createElement("a");
      a.href = lastBlob.url;
      a.download = filename || `call-recording-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    [lastBlob]
  );

  return {
    isRecording,
    durationSec,
    lastBlob,
    start,
    stop,
    downloadLast,
  };
}
