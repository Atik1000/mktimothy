import { auth } from "@/lib/auth";
import { dbHelpers } from "@/lib/config/database";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users/for-chat - Get users with approvalStatus APPROVED and phone set
// Filtered by moderator assignments for MODERATOR role
export async function GET(request: NextRequest) {
  try {
    // Get current authenticated user
    const currentUser = await auth(request);

    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has permission to access chat users
    if (currentUser.role === "USER") {
      return NextResponse.json(
        {
          error:
            "Insufficient permissions. Only admins and moderators can access chat users.",
        },
        { status: 403 }
      );
    }

    let filtered: any[] = [];

    if (currentUser.role === "ADMIN") {
      // Admins can see all approved users
      const users = await dbHelpers.getUsersWithPagination(1, 1000, {
        approvalStatus: "APPROVED",
      });

      // Filter out users with empty/null phone and exclude current user
      filtered = users.users.filter(
        (u) => u.phone && u.phone.trim() !== "" && u.id !== currentUser.id
      );
    } else if (currentUser.role === "MODERATOR") {
      // Moderators can only see users assigned to them
      const assignedUsers = await dbHelpers.getModeratorAssignedUsers(
        currentUser.id
      );

      // Filter out users with empty/null phone, ensure they are approved, and exclude current user
      filtered = assignedUsers.filter(
        (u) => u.phone && u.phone.trim() !== "" && u.id !== currentUser.id
      );
    }

    return NextResponse.json({
      success: true,
      users: filtered,
      userRole: currentUser.role, // Include role for debugging
      totalCount: filtered.length,
    });
  } catch (error) {
    console.error("Get users for chat error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users for chat" },
      { status: 500 }
    );
  }
}

