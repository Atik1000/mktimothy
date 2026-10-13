"use client";

import { useEffect, useRef, useState } from "react";
import { useRealtime, joinRoom } from "@/lib/realtime/socket";

interface IncomingSession {
  id: string;
  status: string;
  schedule: {
    id: string;
    callType: "AUDIO" | "VIDEO";
    caller: { id: string; firstName: string; lastName: string; avatar?: string | null };
  };
}

/**
 * useIncomingCall — realtime (Socket.IO) incoming-call detection.
 *
 * The API pushes `call:incoming` to the user's personal channel
 * (`user:<id>`) the moment a RINGING session is created for them. The event
 * is a doorbell: on arrival (and once on mount / socket reconnect for
 * refresh-mid-call recovery) we hydrate the full session objects from the
 * API — the DB stays the source of truth.
 *
 * While a ring is active, a light 10s re-check clears stale rings (e.g. the
 * caller cancelled before we received a `webrtc:end`).
 */
export function useIncomingCall(
  userId: string | null | undefined,
  options: { enabled?: boolean } = {}
) {
  const enabled = options.enabled !== false;
  const [incoming, setIncoming] = useState<IncomingSession | null>(null);
  const [activeSession, setActiveSession] = useState<IncomingSession | null>(
    null
  );
  const socket = useRealtime(!!userId && enabled);
  const hasRingRef = useRef(false);

  useEffect(() => {
    if (!userId || !enabled) return;

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/calls/sessions?status=RINGING");
        const data = await res.json();
        if (cancelled || !data.success) return;

        // A RINGING session where the current user is part of the schedule
        // but has NOT joined the session yet (the OTHER person started it).
        const ring = data.sessions.find(
          (s: any) => {
            const isParticipant = Array.isArray(s.participants) && s.participants.some((p: any) => p?.id === userId);
            const isTarget = s.schedule?.calleeId === userId || s.schedule?.callerId === userId;
            return !isParticipant && isTarget;
          }
        ) as IncomingSession | undefined;
        setIncoming(ring || null);
        hasRingRef.current = !!ring;

        // Also surface ACTIVE sessions the user is part of (in case they
        // refreshed mid-call).
        const res2 = await fetch("/api/calls/sessions?status=ACTIVE");
        const data2 = await res2.json();
        if (cancelled || !data2.success) return;
        const active = data2.sessions.find(
          (s: any) =>
            s.schedule?.callerId === userId ||
            s.schedule?.calleeId === userId
        ) as IncomingSession | undefined;
        setActiveSession(active || null);
      } catch {
        /* swallow */
      }
    }

    check();

    let cleanupSocket = () => {};
    if (socket) {
      // Explicitly join the personal room just in case the gateway auto-join
      // is misconfigured or fails, ensuring we get call:incoming events.
      joinRoom(`user:${userId}`);
      const onIncoming = () => void check();
      socket.on("call:incoming", onIncoming);
      // Re-hydrate after every reconnect (missed doorbells while offline).
      socket.on("connect", onIncoming);
      // Remote ended the call before/while ringing → clear the ring.
      const onEnd = () => {
        setIncoming(null);
        hasRingRef.current = false;
      };
      socket.on("webrtc:end", onEnd);
      cleanupSocket = () => {
        socket.off("call:incoming", onIncoming);
        socket.off("connect", onIncoming);
        socket.off("webrtc:end", onEnd);
      };
    }

    // While a ring is showing, re-check every 10s so cancelled/answered
    // elsewhere rings don't stick forever. Near-zero cost when idle.
    const id = setInterval(() => {
      if (hasRingRef.current && document.visibilityState === "visible") {
        check();
      }
    }, 10_000);
    const onVisible = () => {
      if (document.visibilityState === "visible" && hasRingRef.current) check();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      cleanupSocket();
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, enabled, socket]);

  return { incoming, activeSession, setActiveSession, setIncoming };
}
