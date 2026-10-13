import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/chat/users?q=<search>
 * List of users the current user is allowed to start a chat with.
 *
 * Returns active, messageable users other than the caller. Search is a
 * case-insensitive prefix match on name/email. Admins/moderators see all;
 * regular users see approved, messageable users (allowMessages !== false).
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
    const q = searchParams.get("q")?.trim() ?? "";

    const isAdmin =
      currentUser.role === "ADMIN" || currentUser.role === "MODERATOR";

    const where: any = {
      id: { not: currentUser.id },
      isActive: true,
      ...(isAdmin
        ? {}
        : { 
            approvalStatus: "APPROVED", 
            allowMessages: { not: false },
            role: { notIn: ["ADMIN", "MODERATOR"] }
          }),
    };

    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        role: true,
        jobTitle: true,
        company: true,
      },
      take: 50,
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("[chat/users] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    );
  }
}
