import { auth } from "@/lib/auth";
import { dbHelpers } from "@/lib/config/database";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/moderator-assignments/[moderatorId] - Get users assigned to specific moderator
export async function GET(
  request: NextRequest,
  { params }: { params: { moderatorId: string } }
) {
  try {
    const currentUser = await auth(request);

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { moderatorId } = params;

    if (!moderatorId) {
      return NextResponse.json(
        { error: "Moderator ID is required" },
        { status: 400 }
      );
    }

    const assignedUsers = await dbHelpers.getModeratorAssignedUsers(
      moderatorId
    );

    return NextResponse.json({
      success: true,
      data: {
        moderatorId,
        assignedUsers,
        count: assignedUsers.length,
      },
    });
  } catch (error) {
    console.error("Get moderator assigned users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch assigned users" },
      { status: 500 }
    );
  }
}
