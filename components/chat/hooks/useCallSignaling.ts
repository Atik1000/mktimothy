"use client";

import type { MutableRefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRealtime, joinRoom } from "@/lib/realtime/socket";

// ICE servers — STUN only (pure peer-to-peer, no relay).
// Note: ~15-20% of users behind symmetric/strict NATs (some mobile carriers,
// hotel/enterprise WiFi) cannot connect P2P with STUN alone. There is no
// software workaround for this without a TURN relay — it's a network-level
// restriction. STUN is kept simple by design per the project requirement of
// pure P2P (server never relays media).
const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

// Dedicated TURN relay — required on strict NATs (4G/cellular, some
// corporate/home routers) where direct STUN connections fail. Configure in
// .env / Vercel (comma-separated URLs are fine):
//   NEXT_PUBLIC_TURN_URL, NEXT_PUBLIC_TURN_USERNAME, NEXT_PUBLIC_TURN_CREDENTIAL
// Without these we fall back to STUN-only (works on open networks / same LAN).
if (process.env.NEXT_PUBLIC_TURN_URL) {
  ICE_SERVERS.push({
    urls: process.env.NEXT_PUBLIC_TURN_URL
      .split(",")
      .map((u) => u.trim())
      .filter(Boolean),
    username: process.env.NEXT_PUBLIC_TURN_USERNAME || "",
    credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL || "",
  });
}

// One-shot diagnostic on load: instantly shows whether the TURN env loaded.
// "2 servers (STUN only)" after an .env change = the dev server was not
// restarted / Vercel was not redeployed — calls will fail on strict NATs.
console.log(
  `[useCallSignaling] ICE servers configured: ${ICE_SERVERS.length}` +
    (process.env.NEXT_PUBLIC_TURN_URL ? " (incl. TURN relay)" : " (STUN only — TURN env missing!)")
);

export type PeerRole = "caller" | "callee" | "monitor" | "guest";

export interface CallSignalingOptions {
  sessionId: string;
  myId: string;
  myRole: PeerRole;
  /** IDs of the other participants to connect to (caller, callee, [+admin]).
   *  May GROW at runtime (e.g. a guest discovering another late joiner) —
   *  newly appearing ids get a peer connection on the next init pass. */
  remotePeerIds: string[];
  /** The SCHEDULE originals only (caller/callee) — used by the initiator
   *  rule, unlike remotePeerIds which may include discovered guests.
   *  Defaults to the first snapshot of remotePeerIds. */
  originalPeerIds?: string[];
  /** Local media stream (mic +/- camera). */
  localStream: MediaStream | null;
  /** "AUDIO" or "VIDEO". For video calls, the admin monitor adds a recvonly
   *  video transceiver so it can RECEIVE participant video (admin sends audio
   *  only, but must still have a video m-line in its offer for participant
   *  video to flow back). */
  callType?: "AUDIO" | "VIDEO";
  /** Called when a remote track arrives — includes the source peerId so the
   *  UI can decide what to display (e.g. hide the admin monitor's stream). */
  onRemoteTrack?: (
    track: MediaStreamTrack,
    stream: MediaStream,
    peerId: string
  ) => void;
  /** Called when the remote peer ends the call. */
  onEnded?: (reason?: string) => void;
}

interface RemotePeer {
  id: string;
  pc: RTCPeerConnection;
  stream: MediaStream;
}

/**
 * useCallSignaling — manages the WebRTC peer connections for a call session.
 *
 * Signaling transport: realtime gateway Socket.IO (read) + HTTP POST (write)
 * against /api/calls/sessions/[id]/signal. The API relays each posted signal
 * to the target user's personal channel (`user:<id>`) as `webrtc:*` events
 * with payload { callId, fromId, data, sigId? }.
 *
 * Topology: full mesh. Each remote participant gets its own RTCPeerConnection.
 *
 * Initiator rule: the participant whose id sorts *lowest* in each pair creates
 * the initial offer. This avoids a "glare" (both sides offering at once) and
 * guarantees exactly one peer initiates each link.
 */
export function useCallSignaling({
  sessionId,
  myId,
  myRole,
  remotePeerIds,
  originalPeerIds,
  localStream,
  callType = "AUDIO",
  onRemoteTrack,
  onEnded,
}: CallSignalingOptions) {
  const [remotePeers, setRemotePeers] = useState<Map<string, RemotePeer>>(
    new Map()
  );
  const [connectionState, setConnectionState] = useState<
    "new" | "connecting" | "connected" | "failed" | "closed"
  >("new");
  // Per-peer connection state, so the UI can show "Reconnecting..." on
  // individual tiles when one peer drops without affecting the others.
  const [peerConnectionStates, setPeerConnectionStates] = useState<
    Map<string, string>
  >(new Map());

  const peersRef = useRef<Map<string, RemotePeer>>(new Map());
  const socket = useRealtime();
  const makingOfferRef = useRef<Set<string>>(new Set());
  const localStreamRef = useRef<MediaStream | null>(localStream);
  const initiatedRef = useRef<Set<string>>(new Set());
  // Tracks which peers this client is the initiator toward (for ICE restart).
  const amInitiatorRef = useRef<Set<string>>(new Set());
  // The SCHEDULE originals — snapshot of originalPeerIds (or remotePeerIds if
  // not given). Everyone NOT in this set is a late joiner (admin monitor or
  // share-link guest) for the initiator rule below.
  const originalPeerIdsRef = useRef<Set<string>>(
    new Set(originalPeerIds ?? remotePeerIds)
  );
  // Signals we've already processed — prevents duplicate handling if the
  // same signal is re-delivered (e.g. SSE reconnect, DB race on deliveredAt).
  const processedSignalIdsRef = useRef<Set<string>>(new Set());
  const onRemoteTrackRef = useRef(onRemoteTrack);
  const onEndedRef = useRef(onEnded);

  // Buffer for incoming signals that arrive BEFORE local media is ready.
  // Without this, the callee's socket listener opens first, the caller's
  // OFFER arrives while localStream is still null, a PC gets created with no
  // local tracks, and the connection never completes. We hold signals until
  // localStream is set, then flush them in order.
  // IMPORTANT: we use a REF (not state) for mediaReady so the socket listener
  // can read it without causing the listener effect to re-attach mid-session.
  const signalBufferRef = useRef<any[]>([]);
  const mediaReadyRef = useRef(false);

  // Trickle-ICE candidate buffer, per peer. ICE candidates often arrive via
  // SSE BEFORE the OFFER/ANSWER has been applied (remoteDescription === null),
  // especially on renegotiation/restart. Without buffering they're dropped
  // ("The remote description was null") and the connection never completes.
  // We hold them per-peer and flush once setRemoteDescription succeeds.
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(
    new Map()
  );

  useEffect(() => {
    localStreamRef.current = localStream;
    if (localStream) {
      mediaReadyRef.current = true;
    }
  }, [localStream]);
  useEffect(() => {
    onRemoteTrackRef.current = onRemoteTrack;
  }, [onRemoteTrack]);
  useEffect(() => {
    onEndedRef.current = onEnded;
  }, [onEnded]);

  /** Create (or fetch) an RTCPeerConnection for a given remote peer id. */
  const getOrCreatePeer = useCallback(
    (peerId: string): RTCPeerConnection => {
      const existing = peersRef.current.get(peerId);
      if (existing) return existing.pc;

      console.log(
        `[useCallSignaling] createPeer peer=${peerId} myRole=${myRole} myId=${myId} known=${originalPeerIdsRef.current.has(peerId)}`
      );

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      const remoteStream = new MediaStream();

      // Add local tracks to this PC.
      const ls = localStreamRef.current;
      if (ls) {
        for (const track of ls.getTracks()) {
          pc.addTrack(track, ls);
        }
      }

      // Admin monitor in a VIDEO call: admin sends audio only (no camera), but
      // MUST still advertise a video m-line in its offer so participants can
      // send their video back. Without this, the admin's offer has only an
      // audio m-line, and WebRTC rules forbid the answer from adding new
      // m-lines — so participant video never reaches admin. A recvonly video
      // transceiver reserves the video m-line without sending any video.
      if (myRole === "monitor" && callType === "VIDEO") {
        pc.addTransceiver("video", { direction: "recvonly" });
        console.log(`[useCallSignaling] peer=${peerId} added recvonly video transceiver`);
      }

      pc.ontrack = (ev) => {
        console.log(
          `[useCallSignaling] peer=${peerId} TRACK received kind=${ev.track.kind} streams=${ev.streams.length}`
        );
        remoteStream.addTrack(ev.track);
        onRemoteTrackRef.current?.(ev.track, remoteStream, peerId);
      };

      pc.onicecandidate = (ev) => {
        if (ev.candidate) {
          // Log candidate type — "relay" means TURN is working.
          const c: any = ev.candidate.toJSON?.() ?? ev.candidate;
          console.log(
            `[useCallSignaling] peer=${peerId} ICE candidate type=${c?.candidate?.split(" ")[7] ?? "?"} proto=${c?.protocol ?? "?"}`
          );
          void postSignal(sessionId, {
            type: "ICE",
            targetId: peerId,
            payload: { candidate: ev.candidate.toJSON() },
          });
        }
      };

      // Perfect-negotiation initiator rule. MUST be exclusive (exactly one
      // side of each pair offers) to avoid offer/offer glare deadlock.
      //
      // - Admin monitor / share-link guest → ALWAYS initiates toward the
      //   schedule originals, and toward another late joiner only when its
      //   own id sorts HIGHER (so exactly one of two guests offers).
      // - Participant (caller/callee) → initiates toward the other original
      //   if its id sorts lower, and NEVER toward a late joiner (the late
      //   joiner always initiates toward the originals).
      // - Complementarity check — every pair resolves to exactly one offerer:
      //   original↔original (lower id), guest↔original (guest),
      //   guest↔guest (higher id).
      const peerIsKnownParticipant = originalPeerIdsRef.current.has(peerId);
      const amInitiator =
        myRole === "monitor" || myRole === "guest"
          ? peerIsKnownParticipant || myId > peerId
          : peerIsKnownParticipant && myId < peerId;
      pc.onnegotiationneeded = async () => {
        if (!amInitiator) return; // polite side doesn't proactively offer
        try {
          makingOfferRef.current.add(peerId);
          // Explicit createOffer + setLocalDescription. Avoids the implicit
          // setLocalDescription() shorthand which Edge/older browsers reject.
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          console.log(`[useCallSignaling] peer=${peerId} OFFER sent`);
          await postSignal(sessionId, {
            type: "OFFER",
            targetId: peerId,
            payload: { description: pc.localDescription?.toJSON() },
          });
        } catch (err) {
          console.warn("[useCallSignaling] offer error:", err);
        } finally {
          makingOfferRef.current.delete(peerId);
        }
      };

      // Track the last ICE restart time per peer to throttle restart attempts.
      // Without throttling, failed → restart → failed loops infinitely, each
      // cycle generating new OFFER/ANSWER signals that flood the server.
      const lastRestartRef = { current: 0 };

      pc.onconnectionstatechange = () => {
        const st = pc.connectionState;
        console.log(
          `[useCallSignaling] peer=${peerId} connectionState=${st}`
        );
        // Update per-peer state for the UI.
        setPeerConnectionStates((prev) => {
          const next = new Map(prev);
          next.set(peerId, st);
          return next;
        });
        if (st === "connected") setConnectionState("connected");
        if (st === "failed") {
          setConnectionState("failed");
          // ICE restart with throttling: max one attempt every 10s per peer.
          // STUN-only ICE gathering produces the same candidates each time, so
          // rapid retries can't help — they just flood the signaling server.
          const now = Date.now();
          if (now - lastRestartRef.current < 10_000) {
            console.log(
              `[useCallSignaling] peer=${peerId} ICE restart throttled (last attempt <10s ago)`
            );
            return;
          }
          lastRestartRef.current = now;
          // Only the initiator restarts to avoid glare.
          if (amInitiatorRef.current.has(peerId)) {
            console.log(`[useCallSignaling] peer=${peerId} attempting ICE restart`);
            (async () => {
              try {
                makingOfferRef.current.add(peerId);
                const restartOffer = await pc.createOffer({
                  iceRestart: true,
                });
                await pc.setLocalDescription(restartOffer);
                await postSignal(sessionId, {
                  type: "OFFER",
                  targetId: peerId,
                  payload: { description: pc.localDescription?.toJSON() },
                });
                console.log(`[useCallSignaling] peer=${peerId} restart OFFER sent`);
              } catch (err) {
                console.warn(`[useCallSignaling] peer=${peerId} ICE restart failed:`, err);
              } finally {
                makingOfferRef.current.delete(peerId);
              }
            })();
          }
        }
        if (st === "closed") setConnectionState("closed");
      };

      pc.oniceconnectionstatechange = () => {
        console.log(
          `[useCallSignaling] peer=${peerId} iceConnectionState=${pc.iceConnectionState}`
        );
        if (pc.iceConnectionState === "connected") setConnectionState("connected");
        if (pc.iceConnectionState === "failed") setConnectionState("failed");
      };

      // Log ICE gathering progress so we can see whether relay (typ relay)
      // candidates are being gathered — if not, TURN isn't being reached.
      pc.onicegatheringstatechange = () => {
        console.log(
          `[useCallSignaling] peer=${peerId} iceGatheringState=${pc.iceGatheringState}`
        );
      };

      const entry: RemotePeer = { id: peerId, pc, stream: remoteStream };
      peersRef.current.set(peerId, entry);
      setRemotePeers(new Map(peersRef.current));

      return pc;
    },
    [sessionId, myId]
  );

  /** Handle an incoming signaling message from the SSE stream. */
  const handleSignal = useCallback(
    async (msg: any) => {
      if (!msg || msg.fromId === myId) return;

      const peerId = msg.fromId;
      // Skip already-processed signals. Without this, a re-delivered OFFER
      // causes the participant to re-answer hundreds of times, flooding the
      // admin with duplicate ANSWERs ("ANSWER dropped — wrong state stable").
      if (
        msg.id &&
        processedSignalIdsRef.current.has(String(msg.id))
      ) {
        return;
      }
      // If local media isn't ready yet, buffer the signal and stop.
      // The useEffect below will flush the buffer sequentially once localStream is set.
      if (!mediaReadyRef.current) {
        signalBufferRef.current.push(msg);
        console.log(`[useCallSignaling] buffered signal ${msg.type} from ${peerId} (media not ready)`);
        return;
      }

      if (msg.id) processedSignalIdsRef.current.add(String(msg.id));

      const pc = getOrCreatePeer(peerId);
      const { type, payload } = msg;
      // Must use the SAME initiator rule as getOrCreatePeer, otherwise glare
      // decisions are inconsistent and one side ignores an offer it shouldn't.
      const peerIsKnownParticipant = originalPeerIdsRef.current.has(peerId);
      const amInitiator =
        myRole === "monitor" || myRole === "guest"
          ? peerIsKnownParticipant || myId > peerId
          : peerIsKnownParticipant && myId < peerId;
      if (amInitiator) amInitiatorRef.current.add(peerId);

      try {
        if (type === "OFFER" || type === "RENEGOTIATE") {
          const description =
            typeof payload?.description === "string"
              ? JSON.parse(payload.description)
              : payload?.description;
          console.log(
            `[useCallSignaling] peer=${peerId} OFFER received, signalingState=${pc.signalingState}`
          );

          const offerCollision =
            makingOfferRef.current.has(peerId) ||
            pc.signalingState !== "stable";

          if (offerCollision) {
            if (amInitiator) {
              // Impolite: ignore the incoming offer, keep ours.
              console.log(`[useCallSignaling] peer=${peerId} glare — impolite ignore`);
              return;
            } else {
              // Polite: yield — roll back and accept theirs.
              console.log(`[useCallSignaling] peer=${peerId} glare — polite rollback`);
              await pc.setLocalDescription({ type: "rollback" });
            }
          }

          await pc.setRemoteDescription(description);
          console.log(`[useCallSignaling] peer=${peerId} OFFER applied, creating ANSWER`);
          // Flush any ICE candidates that were buffered before this offer arrived.
          flushPendingCandidates(peerId, pc, pendingCandidatesRef);
          // Explicit createAnswer + setLocalDescription. The implicit
          // setLocalDescription({type:"answer"}) shorthand is rejected by
          // Edge/older browsers ("Expect line: v="), so the answer was never
          // created and never sent — leaving the initiator waiting forever.
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log(`[useCallSignaling] peer=${peerId} ANSWER sent`);
          await postSignal(sessionId, {
            type: "ANSWER",
            targetId: peerId,
            payload: { description: pc.localDescription?.toJSON() },
          });
          setConnectionState("connecting");
        } else if (type === "ANSWER") {
          const description =
            typeof payload?.description === "string"
              ? JSON.parse(payload.description)
              : payload?.description;
          console.log(
            `[useCallSignaling] peer=${peerId} ANSWER received, signalingState=${pc.signalingState}`
          );
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(description);
            console.log(`[useCallSignaling] peer=${peerId} ANSWER applied`);
            // Flush any ICE candidates that were buffered before this answer arrived.
            flushPendingCandidates(peerId, pc, pendingCandidatesRef);
            setConnectionState("connecting");
          } else if (type !== "ANSWER") {
            // Only warn for non-ANSWER types. Duplicate ANSWERs are expected
            // during renegotiation/ICE restart and would spam the console.
          }
        } else if (type === "ICE") {
          const candidate =
            typeof payload?.candidate === "string"
              ? JSON.parse(payload.candidate)
              : payload?.candidate;
          // Buffer candidates that arrive before a remote description is set
          // (common during renegotiation/restart). Flushed in flushPendingCandidates.
          if (!pc.remoteDescription || !pc.currentRemoteDescription) {
            const buf = pendingCandidatesRef.current.get(peerId) ?? [];
            buf.push(candidate);
            pendingCandidatesRef.current.set(peerId, buf);
            console.log(
              `[useCallSignaling] peer=${peerId} ICE candidate buffered (no remote desc yet, queue=${buf.length})`
            );
          } else {
            try {
              await pc.addIceCandidate(candidate);
            } catch (err) {
              console.warn("[useCallSignaling] ICE add error:", err);
            }
          }
        } else if (type === "MEDIA_STATE") {
          window.dispatchEvent(
            new CustomEvent("call-media-state", {
              detail: { peerId, ...payload },
            })
          );
        } else if (type === "END") {
          onEndedRef.current?.(payload?.reason);
        }
      } catch (err) {
        // Common non-fatal WebRTC errors:
        //  - "m-lines doesn't match" → stale renegotiation offer; the initial
        //    exchange already established media, so this is safe to skip.
        //  - "remote description was null" → candidate arrived before offer,
        //    already buffered elsewhere.
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("m-lines") || msg.includes("m=")) {
          console.warn(
            `[useCallSignaling] peer=${peerId} m-line order mismatch (stale renegotiation), skipping`
          );
        } else {
          console.error("[useCallSignaling] handleSignal error:", err);
        }
      }
    },
    [getOrCreatePeer, myId, sessionId]
  );

  // Flush buffered signals once local media becomes available.
  // Runs after handleSignal is defined. Processes sequentially so ICE
  // candidates don't race ahead of the OFFER they belong to.
  // (DB catch-up fetch lives in the mailbox-polling effect below.)
  useEffect(() => {
    if (!localStream) return;
    const buffered = signalBufferRef.current;

    (async () => {
      // Process locally buffered signals
      if (buffered.length > 0) {
        signalBufferRef.current = [];
        for (const msg of buffered) {
          await handleSignal(msg);
        }
      }
    })();
  }, [localStream, handleSignal, sessionId]);

  // DB mailbox polling — the delivery safety net. The gateway is the fast
  // path, but a single missed emit (socket not connected on one deployment,
  // listener mounted late, momentary disconnect) deadlocks the call: the
  // offerer waits in have-local-offer forever while the answer sits
  // undelivered in the CallSignal table. Real-world case this fixes: one
  // participant on a deployment without the REALTIME_*/GATEWAY_JWT_SECRET
  // env vars — its socket never connects and its emits silently no-op.
  // We poll the mailbox every 3s until connected, then every 10s to still
  // catch END/mute signals the gateway leg may drop. Deduped by sigId.
  useEffect(() => {
    if (!localStream) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    const pollMissed = async () => {
      if (stopped) return;
      // Poll fast while any peer is not yet connected, slow once they all are.
      const entries = Array.from(peersRef.current.values());
      const allConnected =
        entries.length > 0 &&
        entries.every((e) => e.pc.connectionState === "connected");
      try {
        const res = await fetch(
          `/api/calls/sessions/${sessionId}/signal?mode=rest`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.signals)) {
            for (const row of data.signals) {
              await handleSignal(row);
            }
          }
        }
      } catch {
        // transient network error — retried on the next tick
      }
      if (!stopped) {
        timer = setTimeout(() => void pollMissed(), allConnected ? 10_000 : 3_000);
      }
    };

    void pollMissed();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [localStream, handleSignal, sessionId]);


  // Realtime signaling stream (Socket.IO). Events arrive on the user's
  // personal channel with payload { callId, fromId, data, sigId? }; the
  // listener reads mediaReadyRef to decide buffer vs process (same rule the
  // old SSE stream used — signals arriving before local media are buffered).
  useEffect(() => {
    if (!socket) return;

    const dispatch = (msg: any) => {
      if (!mediaReadyRef.current) {
        signalBufferRef.current.push(msg);
      } else {
        void handleSignal(msg);
      }
    };

    if (socket) {
      joinRoom(`user:${myId}`);
    }

    const forThisCall = (p: any) =>
      !p?.callId || p.callId === sessionId;

    const onOffer = (p: any) => {
      if (!forThisCall(p) || !p?.fromId) return;
      dispatch({
        id: p.sigId,
        fromId: p.fromId,
        type: "OFFER",
        payload: p.data,
      });
    };
    const onAnswer = (p: any) => {
      if (!forThisCall(p) || !p?.fromId) return;
      dispatch({
        id: p.sigId,
        fromId: p.fromId,
        type: "ANSWER",
        payload: p.data,
      });
    };
    const onIce = (p: any) => {
      if (!forThisCall(p) || !p?.fromId) return;
      dispatch({
        id: p.sigId,
        fromId: p.fromId,
        type: "ICE",
        payload: p.data,
      });
    };
    const onMediaState = (p: any) => {
      if (!forThisCall(p) || !p?.fromId) return;
      window.dispatchEvent(
        new CustomEvent("call-media-state", {
          detail: { peerId: p.fromId, ...(p.data ?? {}) },
        })
      );
    };
    const onEnd = (p: any) => {
      if (!forThisCall(p)) return;
      onEndedRef.current?.(p?.data?.reason || "ended");
    };

    socket.on("webrtc:offer", onOffer);
    socket.on("webrtc:answer", onAnswer);
    socket.on("webrtc:ice", onIce);
    socket.on("webrtc:media-state", onMediaState);
    socket.on("webrtc:end", onEnd);

    return () => {
      socket.off("webrtc:offer", onOffer);
      socket.off("webrtc:answer", onAnswer);
      socket.off("webrtc:ice", onIce);
      socket.off("webrtc:media-state", onMediaState);
      socket.off("webrtc:end", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, sessionId]);

  /**
   * Proactively initiate peer connections once local media is ready.
   * The initiator (lower id) adds tracks → onnegotiationneeded fires → offer sent.
   * The non-initiator creates the PC so it's ready to receive the offer.
   */
  useEffect(() => {
    if (!localStream) return;
    console.log(
      `[useCallSignaling] proactive init remotePeerIds=[${remotePeerIds.join(",")}] myRole=${myRole}`
    );
    for (const peerId of remotePeerIds) {
      if (peerId === myId) continue;
      if (initiatedRef.current.has(peerId)) continue;
      initiatedRef.current.add(peerId);
      // Creating the PC adds local tracks; if we're the initiator,
      // onnegotiationneeded fires automatically and sends the offer.
      getOrCreatePeer(peerId);
    }
  }, [localStream, remotePeerIds, myId, getOrCreatePeer]);

  /** Update local tracks on every peer (e.g. after mute/unmute). */
  const replaceLocalStream = useCallback((stream: MediaStream) => {
    localStreamRef.current = stream;
    peersRef.current.forEach((entry) => {
      const senders = entry.pc.getSenders();
      const tracks = stream.getTracks();
      for (const sender of senders) {
        const newTrack = tracks.find((t) => t.kind === sender.track?.kind);
        if (newTrack && sender.track !== newTrack) {
          void sender.replaceTrack(newTrack);
        }
      }
    });
  }, []);

  /** Broadcast a media-state change (mute/cam-off, or a guest leaving) to
   *  all peers in the call. */
  const broadcastMediaState = useCallback(
    (state: { audio?: boolean; video?: boolean; left?: boolean }) => {
      void postSignal(sessionId, { type: "MEDIA_STATE", payload: state });
    },
    [sessionId]
  );

  /** Close all peer connections. */
  const closeAll = useCallback(() => {
    peersRef.current.forEach((entry) => {
      try {
        entry.pc.close();
      } catch {}
    });
    peersRef.current.clear();
    initiatedRef.current.clear();
    amInitiatorRef.current.clear();
    pendingCandidatesRef.current.clear();
    setRemotePeers(new Map());
  }, []);

  /** Close ONE peer connection — used when a share-link guest leaves the
   *  call: their tile disappears and the originals keep talking. */
  const closePeer = useCallback((peerId: string) => {
    const entry = peersRef.current.get(peerId);
    if (entry) {
      try {
        entry.pc.close();
      } catch {}
      peersRef.current.delete(peerId);
      setRemotePeers(new Map(peersRef.current));
    }
    initiatedRef.current.delete(peerId);
    amInitiatorRef.current.delete(peerId);
    pendingCandidatesRef.current.delete(peerId);
    setPeerConnectionStates((prev) => {
      if (!prev.has(peerId)) return prev;
      const next = new Map(prev);
      next.delete(peerId);
      return next;
    });
  }, []);

  /** All combined remote audio tracks (for recording). */
  const getCombinedRemoteAudio = useCallback((): MediaStream => {
    const combined = new MediaStream();
    peersRef.current.forEach((entry) => {
      entry.stream.getAudioTracks().forEach((track) => {
        combined.addTrack(track);
      });
    });
    return combined;
  }, []);

  return {
    remotePeers,
    connectionState,
    peerConnectionStates,
    replaceLocalStream,
    broadcastMediaState,
    closeAll,
    closePeer,
    getCombinedRemoteAudio,
  };
}

/** Flush any buffered ICE candidates for a peer after setRemoteDescription. */
function flushPendingCandidates(
  peerId: string,
  pc: RTCPeerConnection,
  bufferRef: MutableRefObject<Map<string, RTCIceCandidateInit[]>>
) {
  const buffered = bufferRef.current.get(peerId);
  if (!buffered || buffered.length === 0) return;
  bufferRef.current.delete(peerId);
  (async () => {
    for (const candidate of buffered) {
      try {
        await pc.addIceCandidate(candidate);
      } catch (err) {
        console.warn(
          `[useCallSignaling] peer=${peerId} flush ICE add error:`,
          err
        );
      }
    }
    console.log(
      `[useCallSignaling] peer=${peerId} flushed ${buffered.length} buffered candidate(s)`
    );
  })();
}

/** POST a signaling message. */
async function postSignal(
  sessionId: string,
  body: { type: string; payload?: any; targetId?: string }
) {
  try {
    await fetch(`/api/calls/sessions/${sessionId}/signal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("[useCallSignaling] postSignal error:", err);
  }
}
