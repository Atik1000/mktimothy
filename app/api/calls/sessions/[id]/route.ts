import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

/**
 * GET /api/calls/sessions/[id]
 * Details of a call session + its schedule participants.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isAdmin = currentUser.role === "ADMIN";
    const isParty =
      session.schedule.callerId === currentUser.id ||
      session.schedule.calleeId === currentUser.id;
    // Share-link guests are recorded in session.participants by the join
    // action — they may read the session (the join page + tile labels need
    // it) but nothing else.
    const isGuest = ((session.participants as any[]) ?? []).some(
      (p) => p?.id === currentUser.id
    );
    if (!isAdmin && !isParty && !isGuest) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error("[calls/sessions/[id]] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load session" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calls/sessions/[id]
 * Mark a session as answered (callee picked up) — sets status ACTIVE.
 * Body: { action: "answer" | "decline" }
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

    const body = await request.json().catch(() => ({}));
    const action = body?.action as string | undefined;

    if (action === "join") {
      // Share-link join: ANY authenticated user can join an ACTIVE call as
      // an extra participant (translator, second investor, ...). Same
      // participant stamp as "answer" — the caller/callee clients treat the
      // joiner as a late joiner and let it initiate the peer connections.
      if (session.status !== "ACTIVE") {
        return NextResponse.json(
          {
            error:
              session.endedAt || session.status === "ENDED"
                ? "This call has already ended."
                : "This call is not active yet.",
            status: session.status,
          },
          { status: 409 }
        );
      }
      const parts = (session.participants as any[]) ?? [];
      if (parts.some((p) => p?.id === currentUser.id)) {
        return NextResponse.json({ success: true, session });
      }
      parts.push({
        id: currentUser.id,
        role: currentUser.role,
        name: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
        avatar: currentUser.avatar ?? null,
        joinedAt: new Date().toISOString(),
        guest: true,
      });
      const updated = await prisma.callSession.update({
        where: { id: session.id },
        data: { participants: parts },
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
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === "leave") {
      // Guest leaving the call — strip ONLY their own guest entry so the
      // "+N guests" count and rejoin semantics stay clean. Deliberately does
      // NOT touch the session status: the call continues for the originals.
      const parts = (session.participants as any[]) ?? [];
      const next = parts.filter(
        (p) => !(p?.id === currentUser.id && p?.guest)
      );
      if (next.length === parts.length) {
        return NextResponse.json({ success: true, session });
      }
      const updated = await prisma.callSession.update({
        where: { id: session.id },
        data: { participants: next },
      });
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === "answer") {
      // Add this user to participants if not present.
      const parts = (session.participants as any[]) ?? [];
      if (!parts.some((p) => p?.id === currentUser.id)) {
        parts.push({
          id: currentUser.id,
          role: currentUser.role,
          name: `${currentUser.firstName} ${currentUser.lastName}`.trim(),
          avatar: currentUser.avatar ?? null,
          joinedAt: new Date().toISOString(),
        });
      }
      const updated = await prisma.callSession.update({
        where: { id: session.id },
        data: { status: "ACTIVE", answeredAt: new Date(), participants: parts },
      });
      return NextResponse.json({ success: true, session: updated });
    }

    if (action === "decline") {
      const updated = await prisma.callSession.update({
        where: { id: session.id },
        data: {
          status: "DECLINED",
          endedAt: new Date(),
          endedById: currentUser.id,
          endReason: "PEER_HANGUP",
        },
      });
      // Notify the caller via a broadcast END signal.
      await prisma.callSignal.create({
        data: {
          sessionId: session.id,
          fromId: currentUser.id,
          type: "END",
          payload: { reason: "declined" },
        },
      });
      return NextResponse.json({ success: true, session: updated });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    console.error("[calls/sessions/[id]] POST error:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
