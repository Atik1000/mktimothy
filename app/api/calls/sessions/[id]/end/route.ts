import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

/**
 * POST /api/calls/sessions/[id]/end
 * Graceful end by any participant.
 * Body: { reason?: "NORMAL" | "PEER_HANGUP" }
 *
 * POST /api/calls/sessions/[id]/end?interrupt=1   (admin only)
 * Admin interrupts the call — sets endReason ADMIN_INTERRUPTED and broadcasts
 * an END signal so all peers tear down immediately.
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

    const session = await prisma.callSession.findUnique({
      where: { id: params.id },
      include: { schedule: true },
    });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isAdmin = currentUser.role === "ADMIN";
    const isParty =
      session.schedule.callerId === currentUser.id ||
      session.schedule.calleeId === currentUser.id;
    if (!isAdmin && !isParty) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const interrupt = searchParams.get("interrupt") === "1";

    if (interrupt && !isAdmin) {
      return NextResponse.json(
        { error: "Only admins can interrupt calls" },
        { status: 403 }
      );
    }

    const now = new Date();
    const durationSec = session.answeredAt
      ? Math.round((now.getTime() - session.answeredAt.getTime()) / 1000)
      : null;

    const updated = await prisma.callSession.update({
      where: { id: session.id },
      data: {
        status: "ENDED",
        endedAt: now,
        endedById: currentUser.id,
        endReason: interrupt ? "ADMIN_INTERRUPTED" : "PEER_HANGUP",
        durationSec,
      },
    });

    // Broadcast an END signal so all connected peers tear down their PC.
    await prisma.callSignal.create({
      data: {
        sessionId: session.id,
        fromId: currentUser.id,
        type: "END",
        payload: {
          reason: interrupt ? "ADMIN_INTERRUPTED" : "PEER_HANGUP",
          by: currentUser.id,
        },
      },
    });

    // NOTE: We intentionally do NOT mark the schedule COMPLETED on hangup.
    // The schedule stays APPROVED so either party can start a fresh call
    // session from it as long as the booked window is still open. The
    // schedule moves to COMPLETED only lazily, once its booked window has
    // passed (handled in the session-start route's window check).

    return NextResponse.json({ success: true, session: updated });
  } catch (error) {
    console.error("[calls/sessions/[id]/end] POST error:", error);
    return NextResponse.json(
      { error: "Failed to end session" },
      { status: 500 }
    );
  }
}
