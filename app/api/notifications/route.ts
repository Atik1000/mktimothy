import { dbHelpers } from "@/lib/config/database";
import { authService } from "@/lib/services/auth";
import { NextRequest, NextResponse } from "next/server";

// GET /api/notifications - Get notifications for current user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const unreadOnly = searchParams.get("unreadOnly") === "true";

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

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      OR: [{ userId: authResult.user.id }, { isGlobal: true }],
    };

    if (unreadOnly) {
      where.isRead = false;
    }

    // Get notifications with pagination
    const notifications = await dbHelpers.getNotifications(where, {
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Get total count
    const totalCount = await dbHelpers.getNotificationsCount(where);

    // Get unread count
    const unreadCount = await dbHelpers.getNotificationsCount({
      OR: [{ userId: authResult.user.id }, { isGlobal: true }],
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        totalCount,
        unreadCount,
        hasMore: totalCount > skip + notifications.length,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      message,
      type,
      priority,
      userId,
      isGlobal,
      data,
      actionUrl,
    } = body;

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

    // Only admins can create notifications for other users
    if ((userId && userId !== authResult.user.id) || isGlobal) {
      if (authResult.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Admin access required" },
          { status: 403 }
        );
      }
    }

    // Validate required fields
    if (!title || !message || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const notification = await dbHelpers.createNotification({
      title,
      message,
      type,
      priority: priority || "MEDIUM",
      userId: isGlobal ? null : userId || authResult.user.id,
      isGlobal: isGlobal || false,
      data: data || null,
      actionUrl: actionUrl || null,
    });

    return NextResponse.json({
      success: true,
      data: notification,
      message: "Notification created successfully",
    });
  } catch (error) {
    console.error("Create notification error:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}
