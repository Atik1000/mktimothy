import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/chat/favorites
 *   Returns the ids of the current user's starred ("Favorites") chat rooms.
 *
 * POST /api/chat/favorites
 *   Body: { roomId: string, favorite: boolean }
 *   Toggles the favorite state of one room for the current user.
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

    const favorites = await prisma.chatRoomFavorite.findMany({
      where: { userId: currentUser.id },
      select: { roomId: true },
    });

    return NextResponse.json({
      success: true,
      roomIds: favorites.map((f) => f.roomId),
    });
  } catch (error) {
    console.error("[chat/favorites] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load favorites" },
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
    const roomId = String(body?.roomId ?? "");
    const favorite = body?.favorite !== false;

    if (!roomId) {
      return NextResponse.json(
        { error: "roomId is required" },
        { status: 400 }
      );
    }

    // The room must exist (and be visible to this user via canAccessRoom-like
    // participation check to prevent starring arbitrary rooms).
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
    });
    if (!room || !room.isActive) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const participants = room.participants as any[];
    const isParticipant =
      Array.isArray(participants) &&
      participants.some((p) => p?.id === currentUser.id);
    if (!isParticipant && currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (favorite) {
      await prisma.chatRoomFavorite.upsert({
        where: {
          userId_roomId: { userId: currentUser.id, roomId },
        },
        create: { userId: currentUser.id, roomId },
        update: {},
      });
    } else {
      await prisma.chatRoomFavorite.deleteMany({
        where: { userId: currentUser.id, roomId },
      });
    }

    return NextResponse.json({ success: true, roomId, favorite });
  } catch (error) {
    console.error("[chat/favorites] POST error:", error);
    return NextResponse.json(
      { error: "Failed to update favorite" },
      { status: 500 }
    );
  }
}
