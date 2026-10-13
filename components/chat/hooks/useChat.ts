"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  joinRoom,
  leaveRoom,
  useRealtime,
} from "@/lib/realtime/socket";

export interface ChatParticipant {
  id: string;
  role: string;
  name: string;
  avatar?: string | null;
}

export interface ChatRoom {
  id: string;
  type: string;
  name?: string | null;
  participants: ChatParticipant[];
  lastMessageAt: string | null;
  lastMessageContent: string | null;
  lastMessageSenderId: string | null;
  lastMessageStatus?: string | null;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  content: string;
  type: string;
  status: string;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  senderId: string;
  roomId: string;
  createdAt: string;
  updatedAt: string;
  isEdited?: boolean;
  isDeletedForEveryone?: boolean;
  replyTo?: {
    id: string;
    content: string;
    type: string;
    sender: {
      firstName: string;
      lastName: string;
    };
  } | null;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    role: string;
  };
}

export interface UseChatOptions {
  /** Current viewer id (used to determine "mine" vs "theirs"). */
  userId: string | null | undefined;
  /** When set, the active room whose messages are streamed. */
  roomId: string | null;
}

/**
 * useChat manages the active room's message list, the realtime (Socket.IO)
 * stream for new/edited/deleted messages, optimistic-send, and the user's
 * room list. The socket auto-reconnects; on every reconnect we backfill from
 * the API (`?after=<lastTs>`) so the DB remains the source of truth.
 */
export function useChat({ userId, roomId }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastTsRef = useRef<string | null>(null);
  const socket = useRealtime(!!roomId);

  // Debounced auto-read: while the chat is open and the tab visible, any
  // message from the other side is marked read shortly after it renders.
  // The POST stamps readBy + READ and pushes realtime events so BOTH sides'
  // badges (mine clears, sender's ticks turn blue) update instantly.
  const markReadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scheduleMarkRead = useCallback(() => {
    if (!roomId || typeof document === "undefined") return;
    if (document.visibilityState !== "visible") return;
    if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
    markReadTimerRef.current = setTimeout(() => {
      fetch(`/api/chat/rooms/${roomId}/read`, { method: "POST" }).catch(
        () => {}
      );
    }, 1200);
  }, [roomId]);

  // Clear any pending read-stamp on unmount.
  useEffect(() => {
    return () => {
      if (markReadTimerRef.current) clearTimeout(markReadTimerRef.current);
    };
  }, []);

  // Catch up on unread when the user returns to the tab with a chat open.
  useEffect(() => {
    if (!roomId) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") scheduleMarkRead();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () =>
      document.removeEventListener("visibilitychange", onVisible);
  }, [roomId, scheduleMarkRead]);

  // Initial load whenever the room changes.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!roomId) {
        setMessages([]);
        return;
      }
      setIsLoadingMessages(true);
      setError(null);
      try {
        const res = await fetch(`/api/chat/rooms/${roomId}/messages?limit=100`);
        const data = await res.json();
        if (cancelled) return;
        if (data.success) {
          setMessages(data.messages);
          const last = data.messages[data.messages.length - 1];
          lastTsRef.current = last ? last.createdAt : null;
          // Opening the chat = seeing it — stamp any unread as read.
          const hasUnreadFromOthers = data.messages.some(
            (m: ChatMessage) => m.senderId && m.senderId !== userId
          );
          if (hasUnreadFromOthers) scheduleMarkRead();
        } else {
          setError(data.error || "Failed to load messages");
        }
      } catch (e) {
        if (!cancelled) setError("Failed to load messages");
      } finally {
        if (!cancelled) setIsLoadingMessages(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [roomId, userId, scheduleMarkRead]);

  // Live updates via the realtime gateway (Socket.IO) — replaces the old
  // SSE stream + 5s polling. We join `room:<id>`, receive pushed events,
  // and backfill from the API after every (re)connect — the DB stays the
  // source of truth, so no event is ever lost across disconnects.
  useEffect(() => {
    if (!roomId || !socket) return;

    const mergeMessages = (incoming: ChatMessage[]) => {
      if (!incoming.length) return;
      setMessages((prev) => {
        const map = new Map(prev.map((m) => [m.id, m]));
        for (const m of incoming) map.set(m.id, m);
        const arr = Array.from(map.values()).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        return arr;
      });
      const last = incoming[incoming.length - 1];
      if (last) lastTsRef.current = last.createdAt;
    };

    // Backfill everything newer than the last delivered message.
    const backfill = async () => {
      try {
        const after =
          lastTsRef.current || new Date(Date.now() - 60_000).toISOString();
        const res = await fetch(
          `/api/chat/rooms/${roomId}/messages?after=${encodeURIComponent(after)}`
        );
        const data = await res.json();
        if (data.success) {
          mergeMessages(data.messages);
          if (
            data.messages.some(
              (m: ChatMessage) => m.senderId && m.senderId !== userId
            )
          ) {
            scheduleMarkRead();
          }
        }
      } catch {
        /* swallow; next connect retries */
      }
    };

    const onNew = (m: ChatMessage) => {
      // Events arrive from BOTH the room channel and our personal channel
      // (dual fan-out) — ignore messages belonging to a different room.
      if (m.roomId && roomId && m.roomId !== roomId) return;
      mergeMessages([m]);
      // Message from the other side rendered into the OPEN chat = seen.
      if (m.senderId && m.senderId !== userId) scheduleMarkRead();
    };
    // Payloads may be PARTIAL (e.g. { id, status, readBy } from the
    // mark-read route) — merge instead of replace so nothing is lost.
    const onUpdated = (m: Partial<ChatMessage> & { id: string }) =>
      setMessages((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, ...m } : x))
      );
    // Payload is either { id } (single delete) or { roomId, id: null }
    // (chat cleared — every member of the room wipes their local list).
    const onDeleted = (p: { id?: string | null; roomId?: string | null }) => {
      if (!p?.id && p?.roomId === roomId) {
        setMessages([]);
        return;
      }
      if (p?.id) setMessages((prev) => prev.filter((m) => m.id !== p.id));
    };
    const onConnect = () => void backfill();

    socket.on("message:new", onNew);
    socket.on("message:updated", onUpdated);
    socket.on("message:deleted", onDeleted);
    socket.on("connect", onConnect);
    joinRoom(`room:${roomId}`);

    return () => {
      socket.off("message:new", onNew);
      socket.off("message:updated", onUpdated);
      socket.off("message:deleted", onDeleted);
      socket.off("connect", onConnect);
      leaveRoom(`room:${roomId}`);
    };
  }, [roomId, socket, userId, scheduleMarkRead]);

  // Send a message optimistically.
  const sendMessage = useCallback(
    async (payload: {
      content: string;
      type?: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
      replyToId?: string;
    }) => {
      if (!roomId) throw new Error("No active room");

      const res = await fetch(`/api/chat/rooms/${roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to send");
      // The SSE stream will deliver the canonical copy; we still merge here
      // so the message appears instantly even if SSE is lagging.
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
      return data.message as ChatMessage;
    },
    [roomId]
  );

  const editMessage = useCallback(
    async (messageId: string, content: string) => {
      const res = await fetch(`/api/chat/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to edit message");
      
      setMessages((prev) => {
        return prev.map(m => m.id === messageId ? data.message : m);
      });
      return data.message as ChatMessage;
    },
    []
  );

  const deleteMessage = useCallback(
    async (messageId: string, type: "ME" | "EVERYONE") => {
      const res = await fetch(`/api/chat/messages/${messageId}?type=${type}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to delete message");
      
      setMessages((prev) => {
        if (type === "ME") {
          return prev.filter(m => m.id !== messageId);
        } else {
          return prev.map(m => m.id === messageId ? data.message : m);
        }
      });
    },
    []
  );

  const clearChat = useCallback(async () => {
    if (!roomId) throw new Error("No active room");
    const res = await fetch(`/api/chat/rooms/${roomId}/messages`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to clear chat");
    setMessages([]);
  }, [roomId]);

  return { messages, isLoadingMessages, error, sendMessage, editMessage, deleteMessage, clearChat };
}

/**
 * useRooms — list + create rooms for the current user.
 *
 * Live updates: the API pushes `room:updated` to the user's personal
 * channel (`user:<id>`) whenever a room changes (new message, rename,
 * new room). We also refresh on window focus — no more periodic polling.
 */
export function useRooms(userId: string | null | undefined) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const socket = useRealtime(!!userId);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/rooms");
      const data = await res.json();
      if (data.success) setRooms(data.rooms);
    } catch {
      /* swallow */
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    refresh();

    // Refresh when the tab regains focus so the list is fresh on return.
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    let cleanupSocket = () => {};
    if (socket) {
      const onRoomUpdated = () => void refresh();
      const onConnect = () => void refresh();
      socket.on("room:updated", onRoomUpdated);
      socket.on("connect", onConnect);
      cleanupSocket = () => {
        socket.off("room:updated", onRoomUpdated);
        socket.off("connect", onConnect);
      };
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      cleanupSocket();
    };
  }, [refresh, userId, socket]);

  const createRoom = useCallback(
    async (targetUserId: string): Promise<ChatRoom | null> => {
      const res = await fetch("/api/chat/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to start chat");
      await refresh();
      return data.room as ChatRoom;
    },
    [refresh]
  );

  return { rooms, isLoading, refresh, createRoom };
}
