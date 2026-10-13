import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { logoutAllDevices } from "@/lib/middleware/auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

/**
 * POST /api/users/[id]/block
 * Admin-only. Blocks a user from the system:
 *   - Sets isActive = false (login route must reject inactive users).
 *   - Ends all their active call sessions with endReason ADMIN_INTERRUPTED.
 *   - Invalidates all their sessions (force logout everywhere).
 *
 * Body: { block?: boolean }  (omit or true to block, false to unblock)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await auth(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    if (currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const block = body?.block !== false; // default true

    const target = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, isActive: true, role: true },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    // Guard: never block another admin.
    if (target.role === "ADMIN") {
      return NextResponse.json(
        { error: "Cannot block an admin" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: target.id },
      data: { isActive: block ? false : true },
      select: { id: true, isActive: true },
    });

    if (block) {
      // End any active call sessions for this user.
      const activeSessions = await prisma.callSession.findMany({
        where: { status: { in: ["RINGING", "ACTIVE"] } },
        include: { schedule: true },
      });
      const theirs = activeSessions.filter(
        (s) =>
          s.schedule.callerId === target.id ||
          s.schedule.calleeId === target.id
      );
      for (const s of theirs) {
        await prisma.callSession.update({
          where: { id: s.id },
          data: {
            status: "ENDED",
            endedAt: new Date(),
            endedById: currentUser.id,
            endReason: "ADMIN_INTERRUPTED",
          },
        });
        await prisma.callSignal.create({
          data: {
            sessionId: s.id,
            fromId: currentUser.id,
            type: "END",
            payload: { reason: "ADMIN_INTERRUPTED", blocked: target.id },
          },
        });
      }

      // Force logout on all devices.
      try {
        await logoutAllDevices(target.id);
      } catch {
        /* sessions table may not have rows */
      }
    }

    return NextResponse.json({
      success: true,
      user: updated,
      message: block ? "User blocked" : "User unblocked",
    });
  } catch (error) {
    console.error("[users/[id]/block] POST error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
