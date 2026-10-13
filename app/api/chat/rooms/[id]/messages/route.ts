import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { canAccessRoom } from "@/lib/utils/chat";
import { pushNewMessage } from "@/lib/realtime/emit";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: { id: string } };

/**
 * GET /api/chat/rooms/[id]/messages?after=<iso>&before=<iso>&limit=<n>
 * Cursor-paginated history. `after` returns messages strictly newer than the
 * given timestamp (used by the SSE fallback poll + initial backfill).
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await auth(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
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

    const { searchParams } = new URL(request.url);
    const after = searchParams.get("after");
    const before = searchParams.get("before");
    const limit = Math.min(Number(searchParams.get("limit") ?? "100"), 500);

    const where: any = { roomId: room.id };
    if (after) where.createdAt = { gt: new Date(after) };
    if (before) where.createdAt = { lt: new Date(before) };

    const messages = await prisma.chatMessage.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: limit,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            type: true,
            sender: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    let filteredMessages = messages.filter((m) => {
      const deletedFor = (m.deletedFor as string[]) || [];
      return !deletedFor.includes(currentUser.id);
    });

    filteredMessages = filteredMessages.map((m) => {
      if (m.isDeletedForEveryone && currentUser.role !== "ADMIN") {
        return {
          ...m,
          content: "",
          fileUrl: null,
          fileName: null,
        };
      }
      return m;
    });

    // Read receipts are no longer stamped here. The client calls
    // POST /api/chat/rooms/[id]/read after loading (and whenever new
    // messages arrive into the open chat) — that route stamps readBy AND
    // pushes realtime events so both sides' badges update live.
    return NextResponse.json({ success: true, messages: filteredMessages });
  } catch (error) {
    console.error("[chat/messages] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load messages" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/chat/rooms/[id]/messages
 * Body: { content: string, type?: "TEXT"|"IMAGE"|"VIDEO"|"AUDIO"|"DOCUMENT",
 *         fileUrl?, fileName?, fileSize? }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await auth(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
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

    const body = await request.json().catch(() => ({}));
    const content = String(body?.content ?? "").trim();
    const type = (body?.type ?? "TEXT") as
      | "TEXT"
      | "IMAGE"
      | "VIDEO"
      | "AUDIO"
      | "DOCUMENT";

    if (!content && !body?.fileUrl) {
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 },
      );
    }

    if (room.type === "DIRECT") {
      const participants = room.participants as any[];
      const otherParticipant = participants.find(
        (p) => p.id !== currentUser.id,
      );

      if (otherParticipant) {
        // Check if blocked
        const isBlocked = await prisma.blockedUser.findFirst({
          where: {
            OR: [
              { blockerId: currentUser.id, blockedId: otherParticipant.id },
              { blockerId: otherParticipant.id, blockedId: currentUser.id },
            ],
          },
        });
        if (isBlocked) {
          return NextResponse.json(
            { error: "Cannot send message to this user. User is blocked." },
            { status: 403 },
          );
        }
      }
    }

    // Admins monitoring a room can post too — sender is recorded honestly.

    const message = await prisma.chatMessage.create({
      data: {
        content: content || body?.fileName || "Attachment",
        type: type as any,
        status: "SENT",
        fileUrl: body?.fileUrl ?? null,
        fileName: body?.fileName ?? null,
        fileSize: body?.fileSize ?? null,
        senderId: currentUser.id,
        roomId: room.id,
        replyToId: body?.replyToId ?? null,
        readBy: { [currentUser.id]: new Date().toISOString() },
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            type: true,
            sender: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Bump room denormalized fields so the room list re-sorts.
    await prisma.chatRoom.update({
      where: { id: room.id },
      data: {
        lastMessageAt: message.createdAt,
        lastMessageContent: message.content.slice(0, 500),
        lastMessageSenderId: currentUser.id,
      },
    });

    // Realtime fan-out: message:new → room, unread + room:updated → others.
    // AWAITED on purpose: on Vercel serverless, un-awaited promises can be
    // dropped once the response is sent — the push must complete first.
    await pushNewMessage(room, message);

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("[chat/messages] POST error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/chat/rooms/[id]/messages
 * Clears the chat for the current user (appends their ID to deletedFor for all messages in the room).
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await auth(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
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

    const messages = await prisma.chatMessage.findMany({
      where: { roomId: room.id },
      select: { id: true, deletedFor: true },
    });

    // Update each message in a transaction
    await prisma.$transaction(
      messages.map((m) => {
        const deletedFor = (m.deletedFor as string[]) || [];
        if (!deletedFor.includes(currentUser.id)) {
          deletedFor.push(currentUser.id);
        }
        return prisma.chatMessage.update({
          where: { id: m.id },
          data: { deletedFor },
        });
      }),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[chat/rooms/messages] DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to clear chat" },
      { status: 500 },
    );
  }
}
