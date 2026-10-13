import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { pushMessageUpdated } from "@/lib/realtime/emit";
import { NextRequest, NextResponse } from "next/server";

type RouteParams = { params: { messageId: string } };

/**
 * PATCH /api/chat/messages/[messageId]
 * Body: { content: string }
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await auth(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const message = await prisma.chatMessage.findUnique({
      where: { id: params.messageId },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    // Only the sender can edit
    if (message.senderId !== currentUser.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Only text messages can be edited (we don't want them swapping audio/files)
    if (message.type !== "TEXT") {
      return NextResponse.json(
        { error: "Only text messages can be edited" },
        { status: 400 }
      );
    }

    // 5-minute window
    const now = Date.now();
    const messageTime = message.createdAt.getTime();
    if (now - messageTime > 5 * 60 * 1000) {
      return NextResponse.json(
        { error: "Messages can only be edited within 5 minutes of sending" },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const content = String(body?.content ?? "").trim();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const updatedMessage = await prisma.chatMessage.update({
      where: { id: params.messageId },
      data: {
        content,
        isEdited: true,
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

    // Update the room's last message if this was the last message
    const room = await prisma.chatRoom.findUnique({
      where: { id: message.roomId },
    });
    
    // We check if this was roughly the last message (time matching)
    if (room && room.lastMessageAt && room.lastMessageAt.getTime() === message.createdAt.getTime()) {
      await prisma.chatRoom.update({
        where: { id: room.id },
        data: {
          lastMessageContent: content.slice(0, 500),
        },
      });
    }

    // Realtime fan-out: edited message → everyone in the room.
    // Awaited — Vercel drops un-awaited work after the response is sent.
    await pushMessageUpdated(message.roomId, updatedMessage);

    return NextResponse.json({ success: true, message: updatedMessage });
  } catch (error) {
    console.error("[chat/messages] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to edit message" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/chat/messages/[messageId]?type=ME|EVERYONE
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await auth(request);
    if (!currentUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const message = await prisma.chatMessage.findUnique({
      where: { id: params.messageId },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // "ME" or "EVERYONE"

    if (type === "EVERYONE") {
      if (message.senderId !== currentUser.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const updatedMessage = await prisma.chatMessage.update({
        where: { id: params.messageId },
        data: { isDeletedForEveryone: true },
      });

      // Realtime fan-out: the tombstone row → everyone in the room.
      // Awaited — Vercel drops un-awaited work after the response is sent.
      await pushMessageUpdated(message.roomId, updatedMessage);

      return NextResponse.json({ success: true, message: updatedMessage });
    } else {
      // type === "ME"
      const deletedFor = (message.deletedFor as string[]) || [];
      if (!deletedFor.includes(currentUser.id)) {
        deletedFor.push(currentUser.id);
      }

      const updatedMessage = await prisma.chatMessage.update({
        where: { id: params.messageId },
        data: { deletedFor },
      });
      return NextResponse.json({ success: true, message: updatedMessage });
    }
  } catch (error) {
    console.error("[chat/messages] DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
  }
}
