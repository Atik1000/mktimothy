import { dbHelpers } from "@/lib/config/database";
import { authService } from "@/lib/services/auth";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/notifications/mark-read - Mark notifications as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationIds, markAllAsRead } = body;

    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify authentication
    const authResult = await authService.verifyToken(token);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    let updatedCount = 0;

    if (markAllAsRead) {
      // Mark all notifications as read for the current user
      updatedCount = await dbHelpers.markAllNotificationsAsRead(
        authResult.user.id
      );
    } else if (notificationIds && Array.isArray(notificationIds)) {
      // Mark specific notifications as read
      updatedCount = await dbHelpers.markNotificationsAsRead(
        notificationIds,
        authResult.user.id
      );
    } else {
      return NextResponse.json(
        {
          error:
            "Invalid request. Provide notificationIds or set markAllAsRead to true",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { updatedCount },
      message: `${updatedCount} notification${
        updatedCount !== 1 ? "s" : ""
      } marked as read`,
    });
  } catch (error) {
    console.error("Mark notifications as read error:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
