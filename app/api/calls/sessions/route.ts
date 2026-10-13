import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { isScheduleWindowOpen } from "@/lib/utils/calls";
import { emitToRoom } from "@/lib/realtime/emit";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/calls/sessions?status=ACTIVE
 *   - Admin: all sessions (optionally filtered by status).
 *   - User: sessions on their schedules only.
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const isAdmin = currentUser.role === "ADMIN";

    const where: any = {};
    if (status) where.status = status;
    if (!isAdmin) {
      where.schedule = {
        OR: [{ callerId: currentUser.id }, { calleeId: currentUser.id }],
      };
    }

    const sessions = await prisma.callSession.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: 50,
      include: {
        schedule: {
          include: {
            caller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
              },
            },
            callee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error("[calls/sessions] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load sessions" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calls/sessions
 * Start a call from an approved schedule. Re-validates the window server-side
 * before creating a RINGING session.
 * Body: { scheduleId: string }
 *
 * Returns the session + a fresh roomId (for the callee to receive the ring).
 */
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
    const scheduleId = body?.scheduleId as string | undefined;
    if (!scheduleId) {
      return NextResponse.json(
        { error: "scheduleId is required" },
        { status: 400 }
      );
    }

    const schedule = await prisma.callSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        caller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
        callee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    const isCaller = schedule.callerId === currentUser.id;
    const isCallee = schedule.calleeId === currentUser.id;
    const isAdmin = currentUser.role === "ADMIN";

    if (!isCaller && !isCallee && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // The schedule must be APPROVED, and the call must be started within the
    // booked time window the user chose when requesting.
    if (!isScheduleWindowOpen(schedule)) {
      const start = new Date(schedule.startDateTime);
      const end = new Date(schedule.endDateTime);
      const now = new Date();
      // Lazy cleanup: if the booked window has passed, mark COMPLETED so the
      // schedule stops appearing as a restartable call.
      if (schedule.status === "APPROVED" && now > end) {
        await prisma.callSchedule
          .update({
            where: { id: schedule.id },
            data: { status: "COMPLETED", completedAt: now },
          })
          .catch(() => {});
      }
      const msg =
        schedule.status !== "APPROVED"
          ? "This call has not been approved yet."
          : now < start
          ? `This call's booked window hasn't started yet (starts ${start.toLocaleString()}).`
          : `This call's booked window has ended (was ${start.toLocaleString()} – ${end.toLocaleString()}).`;
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    // Find the room for this conversation (so the callee can be notified).
    const rooms = await prisma.chatRoom.findMany({
      where: { type: "DIRECT", isActive: true },
    });
    const room = rooms.find((r) => {
      const parts = r.participants as any[];
      const ids = Array.isArray(parts) ? parts.map((p) => p?.id) : [];
      return (
        ids.includes(schedule.callerId) && ids.includes(schedule.calleeId)
      );
    });

    // Prevent duplicate active sessions for the same schedule.
    const existing = await prisma.callSession.findFirst({
      where: {
        scheduleId,
        status: { in: ["RINGING", "ACTIVE"] },
      },
      include: {
        schedule: {
          include: {
            caller: {
              select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
            },
            callee: {
              select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
            },
          },
        },
      },
    });
    if (existing) {
      return NextResponse.json({ success: true, session: existing, roomId: room?.id ?? null, alreadyActive: true });
    }

    const participants = [
      {
        id: currentUser.id,
        role: currentUser.role,
        name: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        avatar: currentUser.avatar ?? null,
        joinedAt: new Date().toISOString(),
      },
    ];

    const session = await prisma.callSession.create({
      data: {
        scheduleId,
        roomId: room?.id ?? "unknown",
        status: "RINGING",
        participants,
      },
      include: {
        schedule: {
          include: {
            caller: {
              select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
            },
            callee: {
              select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
            },
          },
        },
      },
    });

    // Realtime doorbell: ring the OTHER party instantly (no polling). The
    // client hydrates the full session from the API on receipt. Awaited —
    // Vercel drops un-awaited work after the response is sent.
    const otherId =
      currentUser.id === schedule.callerId
        ? schedule.calleeId
        : currentUser.id === schedule.calleeId
          ? schedule.callerId
          : schedule.calleeId; // admin-started session rings the callee
    await emitToRoom(`user:${otherId}`, "call:incoming", {
      callId: session.id,
      from: session.schedule.caller,
      callType: session.schedule.callType,
    });

    return NextResponse.json({
      success: true,
      session,
      roomId: room?.id ?? null,
      schedule,
    });
  } catch (error) {
    console.error("[calls/sessions] POST error:", error);
    return NextResponse.json(
      { error: "Failed to start session" },
      { status: 500 }
    );
  }
}
