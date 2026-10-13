/**
 * Server-side publish helper for the realtime gateway.
 *
 * Clients are RECEIVE-ONLY (the gateway rejects client emits by design).
 * Whenever an API route changes state other users should see, it calls
 * emitToRoom(...) and the gateway fans the event out to sockets in that room.
 *
 * Wire-up: set these env vars (from the gateway/DevOps team):
 *   REALTIME_EMIT_URL  e.g. https://relay.quickwebs.site/emit
 *   REALTIME_API_KEY   shared secret for the emit endpoint
 *
 * When unset, emitToRoom() silently no-ops — the app behaves exactly as
 * before (clients just don't receive pushes), so wiring routes is always safe.
 *
 * Rooms:  room:<roomId>  — chat room channel (message:new / updated / deleted)
 *         user:<userId>  — personal channel (unread:updated, call:incoming,
 *                          webrtc:* signaling, room:updated)
 */

import { prisma } from "@/lib/config/database";

const EMIT_URL = process.env.REALTIME_EMIT_URL || "";
const API_KEY = process.env.REALTIME_API_KEY || "";

export async function emitToRoom(
  room: string,
  event: string,
  payload: unknown
): Promise<void> {
  if (!EMIT_URL || !API_KEY) return; // gateway publish not configured — no-op
  try {
    await fetch(EMIT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Verified against the live gateway: it authenticates with a Bearer
        // token (x-api-key is NOT accepted).
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({ room, event, payload }),
    });
  } catch (err) {
    // Never fail the API request because a push failed — the DB is the
    // source of truth and clients refetch on reconnect.
    console.error(`[realtime] emit ${event} → ${room} failed:`, err);
  }
}

/* ------------------------------------------------------------------ */
/* Chat fan-out helpers — one call per API mutation.                   */
/* ------------------------------------------------------------------ */

interface RoomLike {
  id: string;
  participants: unknown;
}

function participantIds(room: RoomLike): string[] {
  const parts = room.participants as any[];
  return Array.isArray(parts) ? parts.map((p) => p?.id).filter(Boolean) : [];
}

/**
 * Everyone who must receive this room's message events: the participants
 * PLUS all active admins (the /chats monitor view — admins are not room
 * participants but their open ChatWindow needs live updates too).
 */
async function roomAudience(room: RoomLike): Promise<string[]> {
  const targets = new Set(participantIds(room));
  const admins = await prisma.user
    .findMany({
      where: { role: "ADMIN", isActive: true },
      select: { id: true },
    })
    .catch(() => [] as { id: string }[]);
  admins.forEach((a) => targets.add(a.id));
  return Array.from(targets);
}

/** Recompute a user's TOTAL unread count exactly like GET /api/chat/rooms. */
export async function totalUnreadFor(userId: string): Promise<number> {
  const rooms = await prisma.chatRoom.findMany({
    where: { isActive: true },
    select: { id: true, participants: true },
    take: 500,
  });
  const roomIds = rooms
    .filter((r) => participantIds(r).includes(userId))
    .map((r) => r.id);
  if (roomIds.length === 0) return 0;

  const grouped = await prisma.chatMessage.groupBy({
    by: ["roomId"],
    where: {
      roomId: { in: roomIds },
      senderId: { not: userId },
      status: "SENT",
    },
    _count: { id: true },
  });
  return grouped.reduce((sum, g) => sum + g._count.id, 0);
}

/**
 * After a message is created:
 *  - `message:new` → room:<id> (watchers) AND each audience member's
 *    personal channel (participants + admins). Dual-channel on purpose:
 *    personal channels are guaranteed delivery (auto-joined by the gateway),
 *    the room channel covers anyone else explicitly joined. The client
 *    dedupes by message id, so double delivery is harmless.
 *  - `unread:updated` + `room:updated` → each other participant (badge +
 *    chat-list re-sort).
 */
export async function pushNewMessage(
  room: RoomLike,
  message: unknown
): Promise<void> {
  if (!EMIT_URL) return;
  void emitToRoom(`room:${room.id}`, "message:new", message);

  const senderId = (message as any)?.senderId;
  for (const uid of await roomAudience(room)) {
    if (uid === senderId) continue;
    void emitToRoom(`user:${uid}`, "message:new", message);
    const count = await totalUnreadFor(uid).catch(() => 0);
    void emitToRoom(`user:${uid}`, "unread:updated", { count });
    void emitToRoom(`user:${uid}`, "room:updated", { roomId: room.id });
  }
}

/** After a message is edited / deleted-for-everyone (dual-channel). */
export async function pushMessageUpdated(
  roomId: string,
  message: unknown
): Promise<void> {
  if (!EMIT_URL) return;
  await dualEmit(roomId, "message:updated", message);
}

/** After a single message is deleted-for-everyone (client removes by id). */
export async function pushMessageDeleted(
  roomId: string,
  messageId: string
): Promise<void> {
  if (!EMIT_URL) return;
  await dualEmit(roomId, "message:deleted", { id: messageId });
}

/** After a chat is cleared — every member wipes their local list. */
export async function pushRoomCleared(roomId: string): Promise<void> {
  if (!EMIT_URL) return;
  await dualEmit(roomId, "message:deleted", { id: null, roomId });
}

/** Emit to the room channel AND every audience member's personal channel. */
async function dualEmit(
  roomId: string,
  event: string,
  payload: unknown
): Promise<void> {
  void emitToRoom(`room:${roomId}`, event, payload);
  const room = await prisma.chatRoom
    .findUnique({ where: { id: roomId } })
    .catch(() => null);
  if (!room) return;
  for (const uid of await roomAudience(room)) {
    void emitToRoom(`user:${uid}`, event, payload);
  }
}
