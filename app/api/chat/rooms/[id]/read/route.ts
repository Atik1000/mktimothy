import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { canAccessRoom } from "@/lib/utils/chat";
import { emitToRoom, totalUnreadFor } from "@/lib/realtime/emit";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/chat/rooms/[id]/read
 *
 * Marks every message in the room sent by OTHERS as read by the caller
 * (stamps readBy[userId] + status READ). The client calls this:
 *   - right after opening a chat (initial history load),
 *   - debounced, whenever new messages arrive into the OPEN chat,
 *   - when the tab regains focus with the chat open.
 *
 * Realtime fan-out on every call that actually marks something:
 *   - `message:updated` { id, status, readBy } → room:<id>
 *       → the SENDER's open chat turns its ticks blue live
 *   - `room:updated`  → user:<me> → my chat-list badge refreshes
 *   - `unread:updated` { count } → user:<me> → global badge refreshes
 *
 * Idempotent: a second call with nothing new marks 0 and emits nothing.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await auth(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const room = await prisma.chatRoom.findUnique({
      where: { id: params.id },
    });
    if (!room || !room.isActive) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    if (!canAccessRoom(currentUser, room.participants)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Messages from others that I haven't read yet.
    const unread = await prisma.chatMessage.findMany({
      where: {
        roomId: room.id,
        senderId: { not: currentUser.id },
        status: "SENT",
      },
      select: { id: true, readBy: true },
    });

    if (unread.length === 0) {
      return NextResponse.json({ success: true, updated: 0 });
    }

    const nowIso = new Date().toISOString();
    const updated: { id: string; readBy: Record<string, string> }[] = [];
    for (const m of unread) {
      const readBy = {
        ...((m.readBy as Record<string, string>) ?? {}),
        [currentUser.id]: nowIso,
      };
      await prisma.chatMessage.update({
        where: { id: m.id },
        data: { readBy, status: "READ" },
      });
      updated.push({ id: m.id, readBy });
    }

    // Realtime fan-out (awaited — Vercel drops un-awaited work).
    for (const m of updated) {
      await emitToRoom(`room:${room.id}`, "message:updated", {
        id: m.id,
        status: "READ",
        readBy: m.readBy,
      });
    }
    await emitToRoom(`user:${currentUser.id}`, "room:updated", {
      roomId: room.id,
    });
    const count = await totalUnreadFor(currentUser.id).catch(() => 0);
    await emitToRoom(`user:${currentUser.id}`, "unread:updated", { count });

    return NextResponse.json({ success: true, updated: updated.length });
  } catch (error) {
    console.error("[chat/read] POST error:", error);
    return NextResponse.json(
      { error: "Failed to mark read" },
      { status: 500 }
    );
  }
}
