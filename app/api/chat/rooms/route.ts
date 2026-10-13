import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { toParticipant } from "@/lib/utils/chat";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/chat/rooms
 *   - Normal users: their rooms only.
 *   - Admin: ALL rooms (monitor view).
 *
 * POST /api/chat/rooms
 *   Body: { targetUserId: string }
 *   Get-or-create a DIRECT room between the caller and targetUserId.
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await auth(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const isAdmin = currentUser.role === "ADMIN";

    // We pull active rooms (capped) and apply JSON participant filtering in JS.
    // Postgres JSON containment would need a GIN index + raw SQL; the room set
    // is small enough (~hundreds) that an in-memory filter is fine and keeps
    // this query portable across DBs.
    const rooms = await prisma.chatRoom.findMany({
      where: { isActive: true },
      orderBy: { lastMessageAt: "desc" },
      take: 500,
    });

    const visible = rooms.filter((room) => {
      if (isAdmin) return true;
      const parts = room.participants as unknown[];
      return (
        Array.isArray(parts) && parts.some((p: any) => p?.id === currentUser.id)
      );
    });

    if (visible.length > 0) {
      const roomIds = visible.map((r) => r.id);
      
      const unreadCounts = await prisma.chatMessage.groupBy({
        by: ['roomId'],
        where: {
          roomId: { in: roomIds },
          senderId: { not: currentUser.id },
          status: "SENT"
        },
        _count: {
          id: true
        }
      });

      const unreadMap = Object.fromEntries(
        unreadCounts.map((u) => [u.roomId, u._count.id])
      );

      const lastMessages = await prisma.chatMessage.findMany({
        where: { roomId: { in: roomIds } },
        orderBy: { createdAt: "desc" },
        distinct: ["roomId"],
        select: { roomId: true, status: true },
      });
      const statusMap = Object.fromEntries(
        lastMessages.map((m) => [m.roomId, m.status])
      );

      for (const room of visible) {
        (room as any).unreadCount = unreadMap[room.id] || 0;
        (room as any).lastMessageStatus = statusMap[room.id] || null;
      }
    }

    return NextResponse.json({ success: true, rooms: visible });
  } catch (error) {
    console.error("[chat/rooms] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load rooms" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await auth(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const targetUserId = body?.targetUserId as string | undefined;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "targetUserId is required" },
        { status: 400 }
      );
    }

    if (targetUserId === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot start a chat with yourself" },
        { status: 400 }
      );
    }

    // Load the target user (must be active + messageable)
    const target = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        role: true,
        firstName: true,
        lastName: true,
        avatar: true,
        isActive: true,
        allowMessages: true,
      },
    });

    if (!target || !target.isActive) {
      return NextResponse.json(
        { error: "User not found or unavailable" },
        { status: 404 }
      );
    }

    if (target.allowMessages === false && currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "This user does not accept messages" },
        { status: 403 }
      );
    }

    // Look for an existing DIRECT room containing both users
    const candidates = await prisma.chatRoom.findMany({
      where: { type: "DIRECT", isActive: true },
    });

    const existing = candidates.find((room) => {
      const parts = room.participants as any[];
      const ids = Array.isArray(parts) ? parts.map((p) => p?.id) : [];
      return ids.includes(currentUser.id) && ids.includes(targetUserId);
    });

    if (existing) {
      return NextResponse.json({ success: true, room: existing });
    }

    // Create a new room
    const room = await prisma.chatRoom.create({
      data: {
        type: "DIRECT",
        participants: [
          toParticipant(currentUser),
          toParticipant(target),
        ] as unknown as object[],
      },
    });

    return NextResponse.json({ success: true, room });
  } catch (error) {
    console.error("[chat/rooms] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
