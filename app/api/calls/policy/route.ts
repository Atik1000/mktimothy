import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { defaultPolicy } from "@/lib/utils/calls";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/calls/policy
 * Returns the global call policy singleton. Any authenticated user may read
 * it (so the request form can constrain the proposed time). If no row exists
 * yet, a default one is lazily seeded.
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

    let policy = await prisma.callPolicy.findUnique({
      where: { key: "global" },
    });

    if (!policy) {
      policy = await prisma.callPolicy.create({
        data: { ...defaultPolicy(), updatedById: currentUser.id },
      });
    }

    return NextResponse.json({ success: true, policy });
  } catch (error) {
    console.error("[calls/policy] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load policy" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/calls/policy
 * Admin-only. Updates the global policy.
 * Body: { isEnabled?, allowedDays?, allowedStartTime?, allowedEndTime?,
 *         timezone?, maxDurationMin? }
 */
export async function PUT(request: NextRequest) {
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

    // Basic validation.
    const days = body?.allowedDays;
    if (days !== undefined) {
      if (
        !Array.isArray(days) ||
        !days.every((d: unknown) => typeof d === "string")
      ) {
        return NextResponse.json(
          { error: "allowedDays must be a string array" },
          { status: 400 }
        );
      }
    }
    const validateHHMM = (v: unknown) =>
      typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
    if (
      body?.allowedStartTime !== undefined &&
      !validateHHMM(body.allowedStartTime)
    ) {
      return NextResponse.json(
        { error: "allowedStartTime must be HH:mm" },
        { status: 400 }
      );
    }
    if (
      body?.allowedEndTime !== undefined &&
      !validateHHMM(body.allowedEndTime)
    ) {
      return NextResponse.json(
        { error: "allowedEndTime must be HH:mm" },
        { status: 400 }
      );
    }
    if (
      body?.maxDurationMin !== undefined &&
      (typeof body.maxDurationMin !== "number" || body.maxDurationMin < 0)
    ) {
      return NextResponse.json(
        { error: "maxDurationMin must be a non-negative number" },
        { status: 400 }
      );
    }

    const data: Record<string, unknown> = { updatedById: currentUser.id };
    const fields = [
      "isEnabled",
      "allowedDays",
      "allowedStartTime",
      "allowedEndTime",
      "timezone",
      "maxDurationMin",
    ];
    for (const f of fields) {
      if (body?.[f] !== undefined) data[f] = body[f];
    }

    const policy = await prisma.callPolicy.upsert({
      where: { key: "global" },
      create: { ...defaultPolicy(), ...data } as any,
      update: data,
    });

    return NextResponse.json({ success: true, policy });
  } catch (error) {
    console.error("[calls/policy] PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update policy" },
      { status: 500 }
    );
  }
}
