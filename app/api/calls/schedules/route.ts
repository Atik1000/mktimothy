import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/calls/schedules?status=PENDING&role=caller|callee|all
 *   - Admin: all schedules (or filtered by ?status).
 *   - User: schedules where they are caller or callee.
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

    // Lazy cleanup: mark APPROVED schedules whose window has fully passed as
    // COMPLETED. Without this, ended-but-never-expired schedules accumulate
    // forever and clutter the UI. Only flip APPROVED→COMPLETED; never touch
    // PENDING/REJECTED/etc. Run this before the findMany below so the result
    // set reflects the cleanup immediately. Guarded so a DB hiccup here can't
    // fail the whole request.
    try {
      const now = new Date();
      await prisma.callSchedule.updateMany({
        where: {
          status: "APPROVED",
          endDateTime: { lt: now },
        },
        data: { status: "COMPLETED" },
      });
    } catch (e) {
      console.warn("[calls/schedules] lazy-complete cleanup failed:", e);
    }

    const where: any = {};
    if (status) where.status = status;
    if (!isAdmin) {
      where.OR = [{ callerId: currentUser.id }, { calleeId: currentUser.id }];
    }

    const schedules = await prisma.callSchedule.findMany({
      where,
      orderBy: { startDateTime: "asc" },
      take: 200,
      include: {
        caller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            email: true,
          },
        },
        callee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            email: true,
          },
        },
        approver: {
          select: { id: true, firstName: true, lastName: true },
        },
        sessions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            status: true,
            startedAt: true,
            endedAt: true,
            durationSec: true,
            endReason: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, schedules });
  } catch (error) {
    console.error("[calls/schedules] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load schedules" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calls/schedules
 * A user requests a call. The proposed window must fall within the policy.
 * Body: { calleeId, callType: "AUDIO"|"VIDEO", startDateTime, endDateTime,
 *         title?, notes?, roomId? }
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
    const calleeId = body?.calleeId as string | undefined;
    const callType = (body?.callType ?? "AUDIO") as "AUDIO" | "VIDEO";
    const startDateTime = body?.startDateTime
      ? new Date(body.startDateTime)
      : undefined;
    const endDateTime = body?.endDateTime
      ? new Date(body.endDateTime)
      : undefined;

    if (!calleeId) {
      return NextResponse.json(
        { error: "calleeId is required" },
        { status: 400 }
      );
    }
    if (!startDateTime || !endDateTime || endDateTime <= startDateTime) {
      return NextResponse.json(
        { error: "Valid startDateTime and endDateTime are required" },
        { status: 400 }
      );
    }
    if (calleeId === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot schedule a call with yourself" },
        { status: 400 }
      );
    }

    const callee = await prisma.user.findUnique({
      where: { id: calleeId },
      select: { id: true, isActive: true },
    });
    if (!callee || !callee.isActive) {
      return NextResponse.json(
        { error: "Recipient not found or unavailable" },
        { status: 404 }
      );
    }

    // Users may request a call at ANY time — the admin's approval/rejection is
    // the only gate. No day/hour policy restriction on booking.

    // Determine the room this schedule belongs to (create one if not given).
    let roomId = body?.roomId as string | undefined;
    if (!roomId) {
      // Find or create a DIRECT room between caller and callee.
      const candidates = await prisma.chatRoom.findMany({
        where: { type: "DIRECT", isActive: true },
      });
      const existing = candidates.find((room) => {
        const parts = room.participants as any[];
        const ids = Array.isArray(parts) ? parts.map((p) => p?.id) : [];
        return ids.includes(currentUser.id) && ids.includes(calleeId);
      });
      if (existing) {
        roomId = existing.id;
      } else {
        const [caller, calleeFull] = await Promise.all([
          prisma.user.findUnique({
            where: { id: currentUser.id },
            select: { id: true, role: true, firstName: true, lastName: true, avatar: true },
          }),
          prisma.user.findUnique({
            where: { id: calleeId },
            select: { id: true, role: true, firstName: true, lastName: true, avatar: true },
          }),
        ]);
        if (caller && calleeFull) {
          const newRoom = await prisma.chatRoom.create({
            data: {
              type: "DIRECT",
              participants: [
                {
                  id: caller.id,
                  role: caller.role,
                  name: `${caller.firstName} ${caller.lastName}`.trim(),
                  avatar: caller.avatar ?? null,
                },
                {
                  id: calleeFull.id,
                  role: calleeFull.role,
                  name: `${calleeFull.firstName} ${calleeFull.lastName}`.trim(),
                  avatar: calleeFull.avatar ?? null,
                },
              ] as unknown as object[],
            },
          });
          roomId = newRoom.id;
        }
      }
    }

    const schedule = await prisma.callSchedule.create({
      data: {
        callerId: currentUser.id,
        calleeId,
        callType,
        title: body?.title ?? null,
        notes: body?.notes ?? null,
        startDateTime,
        endDateTime,
        status: "PENDING",
      },
      include: {
        caller: {
          select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
        },
        callee: {
          select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
        },
      },
    });

    return NextResponse.json({ success: true, schedule, roomId });
  } catch (error) {
    console.error("[calls/schedules] POST error:", error);
    return NextResponse.json(
      { error: "Failed to create schedule" },
      { status: 500 }
    );
  }
}
