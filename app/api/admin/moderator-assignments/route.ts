import { auth } from "@/lib/auth";
import { dbHelpers } from "@/lib/config/database";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/moderator-assignments - Get all moderator assignments and stats
export async function GET(request: NextRequest) {
  try {
    const currentUser = await auth(request);

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const [moderators, unassignedUsers, assignmentStats] = await Promise.all([
      dbHelpers.getAllModerators(),
      dbHelpers.getUnassignedUsers(),
      dbHelpers.getModeratorAssignmentStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        moderators,
        unassignedUsers,
        stats: assignmentStats,
      },
    });
  } catch (error) {
    console.error("Get moderator assignments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch moderator assignments" },
      { status: 500 }
    );
  }
}

// POST /api/admin/moderator-assignments - Assign user to moderator
export async function POST(request: NextRequest) {
  try {
    const currentUser = await auth(request);

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, moderatorId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: "userId and action are required" },
        { status: 400 }
      );
    }

    let result;

    if (action === "assign") {
      if (!moderatorId) {
        return NextResponse.json(
          { error: "moderatorId is required for assign action" },
          { status: 400 }
        );
      }

      result = await dbHelpers.assignUserToModerator(userId, moderatorId);
    } else if (action === "unassign") {
      result = await dbHelpers.unassignUserFromModerator(userId);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'assign' or 'unassign'" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${action}ed successfully`,
      data: result,
    });
  } catch (error: any) {
    console.error("Moderator assignment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to manage moderator assignment" },
      { status: 500 }
    );
  }
}
