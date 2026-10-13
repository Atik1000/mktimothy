import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/calls/sessions/by-schedule/[scheduleId]
 *
 * Resolves the LATEST session for a call schedule (any status). Used by the
 * share-link join page when the link was created BEFORE the call started
 * (link token = scheduleId): returns null until a session exists, and the
 * join page polls until it finds an ACTIVE one.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { scheduleId: string } }
) {
  try {
    const currentUser = await auth(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const session = await prisma.callSession.findFirst({
      where: { scheduleId: params.scheduleId },
      orderBy: { startedAt: "desc" },
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

    return NextResponse.json({ success: true, session: session ?? null });
  } catch (error) {
    console.error("[calls/by-schedule] GET error:", error);
    return NextResponse.json(
      { error: "Failed to resolve call" },
      { status: 500 }
    );
  }
}
