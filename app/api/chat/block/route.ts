import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { targetUserId, block } = await request.json();
    if (!targetUserId) {
      return NextResponse.json(
        { error: "targetUserId is required" },
        { status: 400 }
      );
    }

    // Do not allow blocking admins
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { role: true }
    });

    if (targetUser?.role === "ADMIN") {
      return NextResponse.json({ error: "Cannot block an admin" }, { status: 400 });
    }

    if (block) {
      await prisma.blockedUser.upsert({
        where: {
          blockerId_blockedId: {
            blockerId: user.id,
            blockedId: targetUserId,
          },
        },
        create: {
          blockerId: user.id,
          blockedId: targetUserId,
        },
        update: {},
      });
    } else {
      await prisma.blockedUser.deleteMany({
        where: {
          blockerId: user.id,
          blockedId: targetUserId,
        },
      });
    }

    return NextResponse.json({ success: true, blocked: block });
  } catch (error: any) {
    console.error("[chat/block] POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await auth(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return a list of users this user has blocked
    const blockedUsers = await prisma.blockedUser.findMany({
      where: { blockerId: user.id },
      select: { blockedId: true },
    });

    // Also return users that have blocked this user
    const blockedByUsers = await prisma.blockedUser.findMany({
      where: { blockedId: user.id },
      select: { blockerId: true },
    });

    return NextResponse.json({
      success: true,
      blockedIds: blockedUsers.map((b) => b.blockedId),
      blockedByIds: blockedByUsers.map((b) => b.blockerId),
    });
  } catch (error: any) {
    console.error("[chat/block] GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
