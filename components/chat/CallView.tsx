"use client";

import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Circle,
  Square,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Phone,
  WifiOff,
  Share2,
  Check,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  useCallSignaling,
  type PeerRole,
} from "./hooks/useCallSignaling";
import { useMediaRecorder } from "./hooks/useMediaRecorder";
import { useCallRecorder } from "./hooks/useCallRecorder";
import { useRealtime } from "@/lib/realtime/socket";

interface CallParticipant {
  id: string;
  role?: string;
  name?: string;
  avatar?: string | null;
  guest?: boolean;
  joinedAt?: string;
}

interface CallSession {
  id: string;
  status: string;
  schedule: {
    callType: "AUDIO" | "VIDEO";
    caller: { id: string; firstName: string; lastName: string; avatar?: string | null; role: string };
    callee: { id: string; firstName: string; lastName: string; avatar?: string | null; role: string };
  };
  /** Extra joiners via the share link — maintained server-side by the join
   *  API (POST action:"join" appends { id, name, avatar, guest: true }). */
  participants?: CallParticipant[] | null;
}

interface Props {
  session: CallSession;
  myId: string;
  myRole: PeerRole;
  onClose: () => void;
}

export function CallView({ session, myId, myRole, onClose }: Props) {
  const isAdmin = myRole === "monitor";
  const isVideo = session.schedule.callType === "VIDEO";

  // Gateway socket status — null means THIS deployment can't reach the
  // realtime gateway (missing NEXT_PUBLIC_REALTIME_URL or the token mint
  // failed, e.g. GATEWAY_JWT_SECRET not set on Vercel). Signaling then
  // limps along on the DB-mailbox polling fallback (3-10s latency), so we
  // surface it instead of letting it look like a random connection failure.
  const realtimeSocket = useRealtime();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<
    Map<string, MediaStream>
  >(new Map());
  // Admin joins muted by default so a stray noise before they hit unmute can't
  // reach the participants. Participants start unmuted.
  const [micOn, setMicOn] = useState(!isAdmin);
  const [camOn, setCamOn] = useState(isVideo && !isAdmin);
  const [callEnded, setCallEnded] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [mediaError, setMediaError] = useState<string | null>(null);
  // Video couldn't be acquired (e.g. camera held by another app/browser) but
  // the call continues audio-only. Drives the camera-button toast + hides the
  // local PiP preview.
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const [connecting, setConnecting] = useState(true);
  const [connectionFailed, setConnectionFailed] = useState(false);
  // Bump to force re-acquisition of local media (used by the Retry button).
  const [mediaAttempt, setMediaAttempt] = useState(0);

  // Share-link guests in this call, from session.participants (written by the
  // join API with the guest's REAL id/name/avatar). The session prop is a
  // snapshot, so we refresh whenever an unknown peer's stream arrives (and,
  // for guests, on a light poll — a guest can't learn about another late
  // joiner any other way, since nobody signals a guest first).
  const [guests, setGuests] = useState<CallParticipant[]>(() =>
    (session.participants ?? []).filter((p) => p?.guest && p?.id)
  );
  const guestIdSet = useMemo(
    () => new Set(guests.map((g) => g.id)),
    [guests]
  );
  const refreshGuests = useCallback(async () => {
    try {
      const res = await fetch(`/api/calls/sessions/${session.id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success && Array.isArray(data.session?.participants)) {
        setGuests(
          (data.session.participants as CallParticipant[]).filter(
            (p) => p?.guest && p?.id
          )
        );
      }
    } catch {
      /* non-fatal — tiles fall back to "Guest" */
    }
  }, [session.id]);

  const remoteVideoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const startTimeRef = useRef<number>(0);

  const { caller, callee } = session.schedule;

  // Acquire local media. Re-runs when mediaAttempt changes (Retry button).
  //
  // Graceful degradation: if the FULL request fails (e.g. the camera is held
  // exclusively by another app/browser window — NotReadableError, common when
  // testing two browsers on one machine), we retry audio-only and keep the
  // call alive with the camera off. The error screen only appears when the
  // MICROPHONE can't be acquired at all.
  useEffect(() => {
    let mounted = true;
    (async () => {
      setVideoUnavailable(false);
      // Admin monitors send audio only; participants send video if it's a
      // video call.
      const wantVideo = !isAdmin && isVideo;
      let stream: MediaStream | null = null;
      let videoErr: any = null;

      if (wantVideo) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
          });
        } catch (err: any) {
          videoErr = err;
          console.warn(
            `[CallView] full media failed (${err?.name}), retrying audio-only`
          );
        }
      }
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err: any) {
          if (!mounted) return;
          setMediaError(
            err?.name === "NotAllowedError" || err?.name === "SecurityError"
              ? "Microphone/camera permission denied. Allow access in your browser settings and try again."
              : `Could not access microphone (${err?.name ?? "UnknownError"}).`
          );
          toast.error("Microphone access failed");
          return;
        }
      }

      if (!mounted) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      setLocalStream(stream);
      // Admin starts muted — disable the audio track immediately so no audio
      // leaks before they press unmute.
      if (isAdmin) {
        stream.getAudioTracks().forEach((t) => (t.enabled = false));
      }
      // Video was requested but the fallback stream has none → continue
      // audio-only instead of killing the call.
      if (wantVideo && stream.getVideoTracks().length === 0) {
        setCamOn(false);
        setVideoUnavailable(true);
        toast.error(
          `Camera unavailable (${
            videoErr?.name === "NotReadableError"
              ? "in use by another app or browser window"
              : videoErr?.name ?? "unknown error"
          }) — continuing with audio only`,
          { duration: 6000 }
        );
      }
      // For a callee, mark the session answered now.
      if (myRole === "callee") {
        fetch(`/api/calls/sessions/${session.id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "answer" }),
        }).catch(() => {});
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaAttempt]);

  // Callback ref for the local preview <video>. Fires the instant React
  // mounts the element AND whenever localStream changes. This is the ONLY
  // reliable way to attach the stream when the <video> is rendered
  // conditionally inside a grid that itself appears later — the effect-based
  // approach ran before the element existed, leaving an empty gray box.
  const localVideoCallbackRef = useCallback(
    (el: HTMLVideoElement | null) => {
      if (el && localStream) {
        el.srcObject = localStream;
      }
    },
    [localStream]
  );

  // WebRTC signaling. Keys remote streams by peer id so we can filter which
  // peers to display. For a participant, the admin monitor's stream arrives
  // here too but must NOT be shown (it would split the screen into halves).
  // Only the actual other participant is rendered for non-admin users.
  const handleRemoteTrack = useCallback(
    (_track: MediaStreamTrack, stream: MediaStream, peerId: string) => {
      setRemoteStreams((prev) => {
        const next = new Map(prev);
        next.set(peerId, stream);
        return next;
      });
      setConnecting(false);
      // A peer that is neither schedule participant nor known guest just
      // joined via the share link — pull the participant list so their tile
      // gets a real name instead of showing nothing.
      if (
        peerId !== caller.id &&
        peerId !== callee.id &&
        !guestIdSet.has(peerId)
      ) {
        void refreshGuests();
      }
    },
    [caller.id, callee.id, guestIdSet, refreshGuests]
  );

  const handleEnded = useCallback(
    (reason?: string) => {
      setCallEnded(true);
      if (reason === "ADMIN_INTERRUPTED") {
        toast.error("The admin has interrupted this call.", { duration: 6000 });
      } else if (reason === "DECLINED") {
        toast.error("The other user declined this call.", { duration: 4000 });
      } else if (reason === "FAILED") {
        toast.error("Call failed.", { duration: 4000 });
      }
      setTimeout(() => endCall(reason, true), 800);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Determine the remote peer id(s) to connect to. For a 2-person call the
  // remote is the *other* participant; for the admin monitor, both caller and
  // callee are remotes. A share-link guest meshes with BOTH originals (plus
  // any other guest already discovered) — the signaling layer's initiator
  // rule makes the guest the offerer on every one of those links.
  const remotePeerIds = useMemo(() => {
    const { caller, callee } = session.schedule;
    if (isAdmin) {
      return [caller.id, callee.id].filter((id) => id !== myId);
    }
    if (myRole === "guest") {
      return [caller.id, callee.id, ...guests.map((g) => g.id)].filter(
        (id) => id !== myId
      );
    }
    // Caller connects to callee; callee connects to caller.
    return myId === caller.id ? [callee.id] : [caller.id];
  }, [session.schedule, isAdmin, myId, myRole, guests]);

  const signaling = useCallSignaling({
    sessionId: session.id,
    myId,
    myRole,
    remotePeerIds,
    // Guests discovered later must NOT become "originals" in the initiator
    // rule, so the schedule participants are passed explicitly.
    originalPeerIds: [session.schedule.caller.id, session.schedule.callee.id],
    localStream,
    callType: session.schedule.callType,
    onRemoteTrack: handleRemoteTrack,
    onEnded: handleEnded,
  });

  // Guest-only discovery poll: nobody ever signals a guest first, so a guest
  // cannot learn that another guest joined except by asking the server.
  // (Originals discover guests instantly via handleRemoteTrack instead.)
  useEffect(() => {
    if (myRole !== "guest") return;
    const id = setInterval(() => void refreshGuests(), 8000);
    return () => clearInterval(id);
  }, [myRole, refreshGuests]);

  // A share-link guest announced they left (broadcast MEDIA_STATE { left }).
  // Drop their tile + peer connection right away — otherwise the stale
  // connection lingers as a "Poor network connection" tile until it times
  // out. (closePeer is a stable useCallback, so this listener doesn't
  // re-subscribe on every render.)
  const { closePeer } = signaling;
  useEffect(() => {
    const onMediaState = (ev: Event) => {
      const d = (ev as CustomEvent).detail ?? {};
      if (d?.left && d?.peerId && d.peerId !== myId) {
        setRemoteStreams((prev) => {
          if (!prev.has(d.peerId)) return prev;
          const next = new Map(prev);
          next.delete(d.peerId);
          return next;
        });
        closePeer(d.peerId);
        void refreshGuests();
      }
    };
    window.addEventListener("call-media-state", onMediaState);
    return () => window.removeEventListener("call-media-state", onMediaState);
  }, [myId, closePeer, refreshGuests]);

  // ── Auto-recording (server-stored, no admin needed) ─────────────────
  // Exactly ONE recorder per call: the caller. Starts by itself once media
  // is flowing, stops + uploads to MinIO automatically when the call ends.
  // Upload failures only log — they never disturb the call itself.
  useCallRecorder({
    sessionId: session.id,
    callType: session.schedule.callType,
    enabled: myRole === "caller",
    localStream,
    getRemoteStreams: () =>
      Array.from(signaling.remotePeers.values())
        .map((p) => p.stream)
        .filter(Boolean),
  });

  // Recording (admin only — records combined audio of all peers + own mic).
  // Uses the Web Audio API to MIX all audio sources (admin mic + both
  // participants) into a single track. MediaRecorder with multiple tracks
  // only records the first one — so we must mix them into one stream.
  const recordingContextRef = useRef<AudioContext | null>(null);
  const getRecordingStream = useCallback(() => {
    const remote = signaling.getCombinedRemoteAudio();
    const local = localStream;

    // Collect all audio tracks: remote peers + local mic.
    const allAudioTracks: MediaStreamTrack[] = [];
    for (const t of remote.getAudioTracks()) allAudioTracks.push(t);
    if (local) {
      for (const t of local.getAudioTracks()) allAudioTracks.push(t);
    }
    if (allAudioTracks.length === 0) return new MediaStream();

    // If only one track, just use it directly (no mixing needed).
    if (allAudioTracks.length === 1) {
      return new MediaStream([allAudioTracks[0]]);
    }

    // Mix multiple tracks via Web Audio API into a single destination stream.
    try {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const ctx = new AC();
      recordingContextRef.current = ctx;
      const dest = ctx.createMediaStreamDestination();
      for (const track of allAudioTracks) {
        try {
          const src = ctx.createMediaStreamSource(new MediaStream([track.clone()]));
          src.connect(dest);
        } catch {}
      }
      return dest.stream;
    } catch {
      // Fallback: just use remote audio.
      return remote;
    }
  }, [signaling, localStream]);

  const recorder = useMediaRecorder({ getStream: getRecordingStream });

  // React to the signaling hook's connection state. "failed" → show failed UI.
  useEffect(() => {
    if (signaling.connectionState === "failed") {
      setConnectionFailed(true);
      setConnecting(false);
    } else if (signaling.connectionState === "connected") {
      setConnectionFailed(false);
      setConnecting(false);
    }
  }, [signaling.connectionState]);

  // Safety timeout: if we're still "connecting" after 35s with no remote
  // stream, surface a failure UI instead of hanging forever. TURN may still
  // complete after this — the retry button re-acquires media and re-arms.
  useEffect(() => {
    if (!connecting || remoteStreams.size > 0 || connectionFailed) return;
    const id = setTimeout(() => {
      setConnecting(false);
      setConnectionFailed(true);
      console.warn("[CallView] connection timeout after 35s");
    }, 35000);
    return () => clearTimeout(id);
  }, [connecting, remoteStreams.size, connectionFailed]);

  // Call timer.
  useEffect(() => {
    if (callEnded || connecting) return;
    startTimeRef.current = Date.now();
    const id = setInterval(() => {
      setElapsed(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [callEnded, connecting]);

  // Attach remote streams to their video elements. Keyed by peerId now.
  useEffect(() => {
    remoteStreams.forEach((stream, peerId) => {
      const el = remoteVideoRefs.current.get(peerId);
      if (el && el.srcObject !== stream) el.srcObject = stream;
    });
  }, [remoteStreams]);

  // Share join link (translator / extra participant invitation).
  const [linkCopied, setLinkCopied] = useState(false);
  const shareCallLink = async () => {
    const link = `${window.location.origin}/calls/join/${session.id}`;
    try {
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      toast.success("Join link copied — send it to anyone");
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      window.prompt("Copy this call join link:", link);
    }
  };

  const toggleMic = () => {
    if (!localStream) return;
    const next = !micOn;
    localStream.getAudioTracks().forEach((t) => (t.enabled = next));
    setMicOn(next);
    signaling.broadcastMediaState({ audio: next });
  };

  const toggleCam = () => {
    if (!localStream) return;
    // Audio-only fallback stream has no video track to toggle — the call
    // stays audio-only (joining video mid-call would need renegotiation the
    // signaling layer can't reliably do for the non-initiating side).
    if (localStream.getVideoTracks().length === 0) {
      toast.error(
        "Camera unavailable for this call — it may be in use by another app or browser window. The call continues with audio."
      , { duration: 5000 });
      return;
    }
    const next = !camOn;
    localStream.getVideoTracks().forEach((t) => (t.enabled = next));
    setCamOn(next);
    signaling.broadcastMediaState({ video: next });
  };

  // End the call for everyone (participant red button). For participants this
  // sends the END signal which tears down the session. Admin never uses this —
  // admin uses leaveCall (just exits the monitor) or interruptCall (ends all).
  const endCall = async (reason?: string, fromRemote = false) => {
    if (!fromRemote) {
      await fetch(`/api/calls/sessions/${session.id}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason || "NORMAL" }),
      }).catch(() => {});
    }
    if (recorder.isRecording) recorder.stop();
    signaling.closeAll();
    localStream?.getTracks().forEach((t) => t.stop());
    setCallEnded(true);
    onClose();
  };

  // Admin: leave the call WITHOUT ending it for the participants. Only closes
  // the admin's own peer connections + media. The participants keep talking.
  const leaveCall = async () => {
    if (recorder.isRecording) recorder.stop();
    signaling.closeAll();
    localStream?.getTracks().forEach((t) => t.stop());
    setCallEnded(true);
    onClose();
  };

  // Guest: leave WITHOUT ending the call for anyone. Announce the departure
  // (broadcast MEDIA_STATE { left }) so the others drop the tile promptly
  // instead of watching it decay into "Poor network connection", and strip
  // ourselves from the server's participant list so the "+N guests" count
  // and rejoin semantics stay clean.
  const guestLeave = async () => {
    signaling.broadcastMediaState({ left: true });
    await fetch(`/api/calls/sessions/${session.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "leave" }),
    }).catch(() => {});
    signaling.closeAll();
    localStream?.getTracks().forEach((t) => t.stop());
    setCallEnded(true);
    onClose();
  };

  // Admin: interrupt = end the call for everyone immediately.
  const interruptCall = async () => {
    if (!isAdmin) return;
    if (!confirm("Interrupt this call? It will end immediately for everyone.")) return;
    await fetch(`/api/calls/sessions/${session.id}/end?interrupt=1`, {
      method: "POST",
    }).catch(() => {});
    if (recorder.isRecording) recorder.stop();
    signaling.closeAll();
    localStream?.getTracks().forEach((t) => t.stop());
    setCallEnded(true);
    onClose();
  };

  // Retry connection: tear down peers + local media, reset state, re-acquire.
  // Used when the "Connection failed" screen appears. Bumps mediaAttempt to
  // re-run the getUserMedia effect; the signaling hook's initiate effect will
  // rebuild PCs against the new localStream.
  const retryConnection = () => {
    signaling.closeAll();
    localStream?.getTracks().forEach((t) => t.stop());
    setRemoteStreams(new Map());
    setConnecting(true);
    setConnectionFailed(false);
    setMediaAttempt((n) => n + 1);
  };

  const fmtTime = (s: number) =>
    `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  // Which remote streams to display:
  // - Admin (monitor): shows BOTH participants + every guest.
  // - Participant: shows the other participant + every guest. The admin
  //   monitor also connects P2P to listen/record, but its stream must stay
  //   hidden so the call UI never changes when the admin joins — the admin
  //   never calls the join API, so it's absent from participants and falls
  //   through to the hidden list below.
  // - Guest: shows both originals + the other guests.
  const displayablePeerIds = useMemo(() => {
    const guestIds = guests.map((g) => g.id);
    const all = [caller.id, callee.id, ...guestIds];
    if (isAdmin || myRole === "guest") {
      return new Set(all.filter((id) => id !== myId));
    }
    const otherId = myId === caller.id ? callee.id : caller.id;
    return new Set([otherId, ...guestIds]);
  }, [isAdmin, myRole, caller.id, callee.id, myId, guests]);

  // Resolve a displayed peer to a real identity. Guests come from
  // session.participants (their TRUE name, recorded by the join API) —
  // previously any unknown peer fell through to "callee", which is why a
  // share-link joiner showed up under the callee's name.
  const peerIdentity = useCallback(
    (peerId: string): { firstName: string; lastName: string } => {
      if (peerId === caller.id) return caller;
      if (peerId === callee.id) return callee;
      const g = guests.find((p) => p.id === peerId);
      if (g?.name) {
        const [firstName, ...rest] = g.name.split(" ");
        return { firstName, lastName: rest.join(" ") };
      }
      return { firstName: "Guest", lastName: "" };
    },
    [caller, callee, guests]
  );

  const remoteStreamList = useMemo(
    () =>
      Array.from(remoteStreams.entries())
        .filter(([peerId]) => displayablePeerIds.has(peerId))
        .map(([peerId, stream]) => ({ peerId, stream })),
    [remoteStreams, displayablePeerIds]
  );

  // Hidden streams: received but NOT displayed. For a participant this is the
  // admin monitor's audio — it must still play through a (hidden) <audio>
  // element so the participant can HEAR the admin speak. Without this, the
  // stream is received but never routed to the speakers.
  const hiddenStreamList = useMemo(
    () =>
      Array.from(remoteStreams.entries())
        .filter(([peerId]) => !displayablePeerIds.has(peerId))
        .map(([peerId, stream]) => ({ peerId, stream })),
    [remoteStreams, displayablePeerIds]
  );

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col">
      {/* Hidden audio elements for non-displayed streams (the admin monitor's
          audio on the participant side). They must exist in the DOM for the
          received audio to actually play through the speakers. */}
      {hiddenStreamList.map(({ peerId, stream }) => (
        <HiddenAudio key={peerId} stream={stream} />
      ))}
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Phone size={18} className="text-emerald-500" />
          <div>
            <p className="text-white font-medium text-sm">
              {session.schedule.caller.firstName} {session.schedule.caller.lastName}
              {" ↔ "}
              {session.schedule.callee.firstName} {session.schedule.callee.lastName}
              {guests.filter((g) => g.id !== myId).length > 0 && (
                <span className="text-zinc-500">
                  {" "}
                  +{guests.filter((g) => g.id !== myId).length} guest
                  {guests.filter((g) => g.id !== myId).length > 1 ? "s" : ""}
                </span>
              )}
            </p>
            <p className="text-xs text-zinc-400">
              {isVideo ? "Video call" : "Audio call"} ·{" "}
              {connecting ? "connecting..." : fmtTime(elapsed)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold">
              <ShieldCheck size={12} /> Monitor
            </span>
          )}
          {recorder.isRecording && (
            <span className="flex items-center gap-1.5 text-rose-400 text-xs font-medium">
              <Circle size={8} className="fill-rose-500 animate-pulse" />
              REC {fmtTime(recorder.durationSec)}
            </span>
          )}
        </div>
      </div>

      {/* Gateway health warning — shown when the realtime socket isn't
          connected. Signaling still works via the DB polling fallback, but
          with multi-second latency; the real fix is the deployment's env
          vars (NEXT_PUBLIC_REALTIME_URL / GATEWAY_JWT_SECRET). */}
      {!realtimeSocket && (
        <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-amber-500/15 border-b border-amber-500/20 text-amber-300 text-[11px] sm:text-xs">
          <WifiOff size={12} />
          <span>
            Realtime gateway not connected — call setup is on a slower
            fallback. Check NEXT_PUBLIC_REALTIME_URL / GATEWAY_JWT_SECRET on
            this deployment.
          </span>
        </div>
      )}

      {/* Stage — fixed to the viewport between header and controls so a
          portrait (mobile) remote video can't expand the container and cause
          the page to scroll. Videos use object-contain to fit entirely. */}
      <div className="flex-1 relative flex items-center justify-center p-4 sm:p-6 min-h-0 overflow-hidden">
        {mediaError ? (
          <div className="text-center">
            <AlertTriangle className="text-rose-400 mx-auto mb-3" size={40} />
            <p className="text-white font-medium">{mediaError}</p>
            <button
              onClick={() => endCall()}
              className="mt-4 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-sm font-medium"
            >
              Leave call
            </button>
          </div>
        ) : connectionFailed && remoteStreamList.length === 0 ? (
          <div className="text-center text-zinc-300">
            <AlertTriangle className="text-amber-400 mx-auto mb-3" size={36} />
            <p className="text-white font-medium text-base">
              Connection failed
            </p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              The peer-to-peer link couldn't be established — usually a strict
              network (firewall/NAT) on one side. Retrying reattempts the
              connection via a relay server.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={retryConnection}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium"
              >
                Retry connection
              </button>
              <button
                onClick={() => endCall()}
                className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium"
              >
                Leave call
              </button>
            </div>
          </div>
        ) : connecting && remoteStreamList.length === 0 ? (
          <div className="text-center text-zinc-400">
            <Loader2 className="animate-spin mx-auto mb-3" size={32} />
            <p className="text-sm">Connecting peer-to-peer...</p>
            <p className="text-xs text-zinc-600 mt-1">
              Negotiating connection via STUN/TURN relay.
            </p>
          </div>
        ) : (
          <div
            className="w-full h-full grid gap-3 sm:gap-4 min-h-0"
            style={{
              gridTemplateColumns:
                remoteStreamList.length > 1 ? "1fr 1fr" : "1fr",
            }}
          >
            {/* Remote video(s) — only displayable peers (admin's stream is
                excluded for participants so the call UI never changes when
                the admin joins). */}
            {remoteStreamList.map(({ peerId, stream }) => {
              const peer = peerIdentity(peerId);
              const peerState = signaling.peerConnectionStates.get(peerId);
              const peerFailed =
                peerState === "failed" || peerState === "disconnected";
              return (
                <div
                  key={peerId}
                  className="relative bg-zinc-900 rounded-2xl overflow-hidden flex items-center justify-center min-h-0"
                >
                  <video
                    ref={(el) => {
                      if (el) remoteVideoRefs.current.set(peerId, el);
                    }}
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                  {/* Per-tile connection status overlay. Shows the honest
                      state of this specific peer's network connection instead
                      of an empty black box. */}
                  {peerFailed && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 px-4 text-center">
                      <WifiOff className="text-zinc-500 mb-3" size={28} />
                      <p className="text-zinc-300 text-sm font-medium">
                        Poor network connection
                      </p>
                      <p className="text-zinc-500 text-xs mt-1 max-w-[200px]">
                        {peer.firstName}'s device or yours is behind a strict
                        network (NAT/firewall) that blocks direct peer-to-peer.
                        Retrying automatically...
                      </p>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2.5 py-1 bg-black/60 rounded-lg">
                    {!isVideo && (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center text-emerald-300 text-xs font-bold">
                        {peer.firstName[0]}
                      </div>
                    )}
                    <span className="text-white text-xs font-medium">
                      {peer.firstName} {peer.lastName}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Local preview (picture-in-picture) — hidden on the audio-only
                fallback (no video track to show). */}
            {isVideo && localStream && !isAdmin && !videoUnavailable && (
              <div className="absolute bottom-24 right-4 sm:right-10 w-28 h-40 sm:w-44 sm:h-[165px] bg-zinc-800 rounded-xl overflow-hidden border-2 border-white/10 shadow-xl">
                <video
                  ref={localVideoCallbackRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover -scale-x-100"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 px-6 py-6 bg-black/40 backdrop-blur-sm">
        {!isAdmin && (
          <>
            <button
              onClick={toggleMic}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors ${
                micOn
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-white text-black"
              }`}
              title={micOn ? "Mute" : "Unmute"}
            >
              {micOn ? <Mic size={22} /> : <MicOff size={22} />}
            </button>
            {isVideo && (
              <button
                onClick={toggleCam}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors ${
                  camOn
                    ? "bg-white/10 hover:bg-white/20 text-white"
                    : "bg-white text-black"
                }`}
                title={camOn ? "Stop video" : "Start video"}
              >
                {camOn ? <VideoIcon size={22} /> : <VideoOff size={22} />}
              </button>
            )}
          </>
        )}

        {isAdmin && (
          <>
            <button
              onClick={toggleMic}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors ${
                micOn
                  ? "bg-white/10 hover:bg-white/20 text-white"
                  : "bg-white text-black"
              }`}
              title={micOn ? "Mute" : "Unmute"}
            >
              {micOn ? <Mic size={22} /> : <MicOff size={22} />}
            </button>
            <button
              onClick={() =>
                recorder.isRecording ? recorder.stop() : recorder.start()
              }
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors ${
                recorder.isRecording
                  ? "bg-rose-600 hover:bg-rose-500 text-white"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
              title={recorder.isRecording ? "Stop recording" : "Record audio"}
            >
              {recorder.isRecording ? <Square size={20} /> : <Circle size={22} className="fill-current" />}
            </button>
            <button
              onClick={interruptCall}
              className="px-4 h-12 sm:h-14 rounded-full flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white text-sm font-semibold transition-colors"
              title="End the call for everyone immediately"
            >
              <AlertTriangle size={18} /> Interrupt
            </button>
          </>
        )}

        {/* Share join link — anyone in the call can invite a translator /
            another participant. Copies a guest-join URL to the clipboard. */}
        <button
          onClick={shareCallLink}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-colors ${
            linkCopied
              ? "bg-emerald-600 text-white"
              : "bg-white/10 hover:bg-white/20 text-white"
          }`}
          title="Copy call join link"
        >
          {linkCopied ? <Check size={22} /> : <Share2 size={22} />}
        </button>

        {/* For participants: red = end call for everyone.
            For admin / share-link guests: red = leave only (call continues). */}
        <button
          onClick={() =>
            isAdmin ? leaveCall() : myRole === "guest" ? guestLeave() : endCall()
          }
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-rose-600 hover:bg-rose-500 text-white transition-colors"
          title={
            isAdmin || myRole === "guest"
              ? "Leave call (call continues for others)"
              : "End call"
          }
        >
          <PhoneOff size={22} />
        </button>
      </div>

      {/* Recording save prompt (admin, after recording stops) */}
      {isAdmin && recorder.lastBlob && !recorder.isRecording && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-[#121214] border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl">
          <span className="text-xs text-zinc-300">
            Recording ready ({fmtTime(recorder.lastBlob.durationSec)})
          </span>
          <button
            onClick={() => recorder.downloadLast(`call-${session.id}.mp3`)}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-semibold"
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Invisible <audio> element that plays a received MediaStream. Used for
 * non-displayed streams (e.g. the admin monitor's audio on the participant
 * side) so the audio still reaches the speakers even though there's no video
 * tile for it. Uses a callback ref so the stream attaches the instant the
 * element mounts — avoids the empty-box timing problem.
 */
function HiddenAudio({ stream }: { stream: MediaStream }) {
  const ref = useCallback((el: HTMLAudioElement | null) => {
    if (el) el.srcObject = stream;
  }, [stream]);
  return <audio ref={ref} autoPlay className="hidden" />;
}
