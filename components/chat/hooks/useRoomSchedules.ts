"use client";

import { useEffect, useState } from "react";

export interface RoomSchedule {
  id: string;
  callType: "AUDIO" | "VIDEO";
  status: string;
  startDateTime: string;
  endDateTime: string;
  callerId: string;
  calleeId: string;
}

/**
 * useRoomSchedules — fetches call schedules where the current user is caller
 * or callee. The parent filters to the active room's participants.
 */
export function useRoomSchedules(
  userId: string | null | undefined,
  options: { enabled?: boolean } = {}
) {
  const enabled = options.enabled !== false;
  const [schedules, setSchedules] = useState<RoomSchedule[]>([]);

  useEffect(() => {
    if (!userId || !enabled) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/calls/schedules");
        const data = await res.json();
        if (!cancelled && data.success) {
          setSchedules(data.schedules);
        }
      } catch {
        /* swallow */
      }
    }

    load();
    // Poll for schedule updates, but only while the tab is visible. Avoids
    // ERR_NETWORK_CHANGED errors when the OS suspends a backgrounded tab.
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 20_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") load();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [userId, enabled]);

  return { schedules };
}
