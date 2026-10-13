"use client";

/**
 * Realtime gateway client (Socket.IO → https://relay.quickwebs.site).
 *
 * One socket per browser session, shared by every hook/component:
 *
 *   const socket = useRealtime();           // Socket | null (null until connected)
 *   socket.on("message:new", handler);      // receive-only — sends go via the REST API
 *   joinRoom(`room:${roomId}`);             // tracked; auto re-joined on reconnect
 *
 * Auth: on first connect we fetch a short-lived gateway token from
 * /api/realtime/token (signed with GATEWAY_JWT_SECRET, `sub` = user id).
 * On token expiry mid-session the gateway refuses with connect_error
 * "unauthorized" — we mint a fresh token and socket.io reconnects with it.
 *
 * The gateway auto-joins every socket to `user:<id>` (personal channel);
 * clients never join another user's channel.
 */

import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

const REALTIME_URL = process.env.NEXT_PUBLIC_REALTIME_URL || "";

let socket: Socket | null = null;
let connecting = false;
let status = "idle"; // idle | connecting | connected | disconnected | unauthorized | error

const statusListeners = new Set<(s: string) => void>();
/** Rooms to re-join after every (re)connect — the gateway forgets joins on disconnect. */
const joinedRooms = new Set<string>();

function setStatus(next: string) {
  status = next;
  statusListeners.forEach((l) => l(next));
}

async function fetchGatewayToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/realtime/token");
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.token === "string" ? data.token : null;
  } catch {
    return null;
  }
}

async function connect(): Promise<void> {
  if (!REALTIME_URL || socket || connecting) return;
  connecting = true;

  const token = await fetchGatewayToken();
  if (!token) {
    connecting = false;
    setStatus("unauthorized");
    return;
  }

  const { io } = await import("socket.io-client");
  const s = io(REALTIME_URL, {
    auth: { token },
    transports: ["websocket"],
    withCredentials: true,
  });
  socket = s;
  connecting = false;
  setStatus("connecting");

  s.on("connect", () => {
    setStatus("connected");
    // Re-join tracked rooms after every (re)connect.
    joinedRooms.forEach((room) => s.emit("room:join", room));
  });

  s.on("disconnect", () => setStatus("disconnected"));

  s.on("connect_error", async (err: Error) => {
    setStatus(err.message === "unauthorized" ? "unauthorized" : "error");
    if (err.message === "unauthorized") {
      // Token expired mid-session: mint a fresh one; socket.io keeps retrying
      // with the updated auth payload.
      const fresh = await fetchGatewayToken();
      if (fresh) s.auth = { token: fresh };
    }
  });
}

/** The shared socket, if already connected (non-React contexts). */
export function getRealtimeSocket(): Socket | null {
  return socket && socket.connected ? socket : null;
}

export function getRealtimeStatus(): string {
  return status;
}

/** Join a room (idempotent, tracked for auto re-join on reconnect).
 *  Uses the ack form so failures surface in the console. */
export function joinRoom(roomId: string): void {
  joinedRooms.add(roomId);
  socket?.emit("room:join", roomId, (res: { ok?: boolean; error?: string }) => {
    if (!res?.ok) {
      console.error("[realtime] room:join failed:", roomId, res?.error);
    }
  });
}

/** Leave a room and stop tracking it. */
export function leaveRoom(roomId: string): void {
  joinedRooms.delete(roomId);
  socket?.emit("room:leave", roomId);
}

/** Explicitly disconnect (e.g. on logout). A later useRealtime() reconnects. */
export function disconnectRealtime(): void {
  socket?.disconnect();
  socket = null;
  joinedRooms.clear();
  setStatus("idle");
}

/**
 * useRealtime — React binding for the shared socket.
 * Returns the Socket once connected (null before that). Components re-render
 * when the connection comes up so they can attach listeners + join rooms.
 * Falls back to null forever when the gateway isn't configured — callers
 * must treat that as "no realtime" (their one-shot REST hydration still runs).
 */
export function useRealtime(enabled = true): Socket | null {
  const [sock, setSock] = useState<Socket | null>(
    socket && socket.connected ? socket : null
  );

  useEffect(() => {
    if (!enabled) return;

    const onStatus = (s: string) => {
      if (s === "connected" && socket) setSock(socket);
    };
    statusListeners.add(onStatus);

    if (socket && socket.connected) {
      setSock(socket);
    } else {
      void connect();
    }

    return () => {
      statusListeners.delete(onStatus);
    };
  }, [enabled]);

  return sock;
}
