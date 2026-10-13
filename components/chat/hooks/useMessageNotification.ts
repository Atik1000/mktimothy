"use client";

import { useEffect, useRef, useState } from "react";
import { playNotificationChime } from "@/lib/utils/sounds";
import { useRealtime, joinRoom } from "@/lib/realtime/socket";

/**
 * useMessageNotification — realtime (Socket.IO) unread badge + chime.
 *
 * The API pushes `unread:updated` ({ count }) to the user's personal channel
 * (`user:<id>`) whenever a message lands in one of their rooms. We seed the
 * badge with one fetch on mount (and on socket reconnect / tab focus — the DB
 * is the source of truth) and otherwise rely entirely on pushed events.
 *
 * The chime only fires when the tab is visible and the count increases;
 * the initial seed never chimes.
 */
export function useMessageNotification(
  userId: string | null | undefined,
  options: { enabled?: boolean } = {}
) {
  const enabled = options.enabled !== false;
  const [unreadCount, setUnreadCount] = useState(0);
  const prevCountRef = useRef<number | null>(null);
  // Skip the first seed so we don't chime for messages that were already
  // unread when the page loaded.
  const isFirstSeedRef = useRef(true);
  const socket = useRealtime(!!userId && enabled);

  useEffect(() => {
    if (!userId || !enabled) return;

    let cancelled = false;

    async function seed() {
      try {
        const res = await fetch("/api/chat/rooms");
        const data = await res.json();
        if (cancelled || !data.success) return;

        const rooms = data.rooms ?? [];
        const total = rooms.reduce(
          (sum: number, r: any) => sum + (r.unreadCount ?? 0),
          0
        );
        applyCount(total);
      } catch {
        /* swallow */
      }
    }

    function applyCount(total: number) {
      if (
        !isFirstSeedRef.current &&
        prevCountRef.current !== null &&
        total > prevCountRef.current &&
        document.visibilityState === "visible"
      ) {
        playNotificationChime();
      }
      isFirstSeedRef.current = false;
      prevCountRef.current = total;
      setUnreadCount(total);
    }

    seed();

    let cleanupSocket = () => {};
    if (socket) {
      joinRoom(`user:${userId}`);
      const onUnread = (p: { count?: number }) => {
        if (typeof p?.count === "number") applyCount(p.count);
      };
      const onConnect = () => void seed();
      socket.on("unread:updated", onUnread);
      socket.on("connect", onConnect);
      cleanupSocket = () => {
        socket.off("unread:updated", onUnread);
        socket.off("connect", onConnect);
      };
    }

    // Re-seed when the tab regains focus (covers anything missed while the
    // OS suspended the tab).
    const onVisible = () => {
      if (document.visibilityState === "visible") seed();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      cleanupSocket();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, enabled, socket]);

  return { unreadCount };
}
