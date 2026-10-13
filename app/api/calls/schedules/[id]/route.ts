import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RouteParams = { params: { id: string } };

/**
 * PATCH /api/calls/schedules/[id]
 *
 * Admin actions:
 *   { action: "approve" }                          -> status APPROVED
 *   { action: "reject", rejectionReason?: string } -> status REJECTED
 *
 * User actions (caller or callee):
 *   { action: "cancel" }                           -> status CANCELLED
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

    const schedule = await prisma.callSchedule.findUnique({
      where: { id: params.id },
    });
    if (!schedule) {
      return NextResponse.json(
        { error: "Schedule not found" },
        { status: 404 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const action = body?.action as string | undefined;
    const isAdmin = currentUser.role === "ADMIN";
    const isParticipant =
      schedule.callerId === currentUser.id ||
      schedule.calleeId === currentUser.id;

    if (!isAdmin && !isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await (async () => {
      if (action === "approve") {
        if (!isAdmin)
          throw { status: 403, error: "Only admins can approve calls" };
        if (schedule.status !== "PENDING")
          throw {
            status: 400,
            error: `Cannot approve a ${schedule.status} request`,
          };
        return prisma.callSchedule.update({
          where: { id: schedule.id },
          data: {
            status: "APPROVED",
            approverId: currentUser.id,
            approvedAt: new Date(),
            rejectionReason: null,
          },
        });
      }

      if (action === "reject") {
        if (!isAdmin)
          throw { status: 403, error: "Only admins can reject calls" };
        if (schedule.status !== "PENDING")
          throw {
            status: 400,
            error: `Cannot reject a ${schedule.status} request`,
          };
        return prisma.callSchedule.update({
          where: { id: schedule.id },
          data: {
            status: "REJECTED",
            approverId: currentUser.id,
            rejectionReason: body?.rejectionReason ?? null,
          },
        });
      }

      if (action === "cancel") {
        if (!["PENDING", "APPROVED"].includes(schedule.status)) {
          throw {
            status: 400,
            error: `Cannot cancel a ${schedule.status} request`,
          };
        }
        return prisma.callSchedule.update({
          where: { id: schedule.id },
          data: {
            status: "CANCELLED",
            cancelledAt: new Date(),
            cancelledById: currentUser.id,
          },
        });
      }

      throw { status: 400, error: "Unknown action" };
    })().catch((e: any) => {
      throw e;
    });

    return NextResponse.json({ success: true, schedule: updated });
  } catch (error: any) {
    if (error?.status) {
      return NextResponse.json(
        { error: error.error },
        { status: error.status }
      );
    }
    console.error("[calls/schedules/[id]] PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update schedule" },
      { status: 500 }
    );
  }
}
