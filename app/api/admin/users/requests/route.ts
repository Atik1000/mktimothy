import { dbHelpers } from "@/lib/config/database";
import { authService } from "@/lib/services/auth";
import { NotificationService } from "@/lib/services/notification";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/users/requests - Get all pending user requests
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search");

    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify authentication
    const authResult = await authService.verifyToken(token);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin or moderator with manage-users permission
    const user = authResult.user;
    const isAdmin = user.role === "ADMIN";
    const hasPermission = user.role === "MODERATOR" && user.subAdminPermissions?.includes("manage-users");

    if (!isAdmin && !hasPermission) {
      return NextResponse.json(
        { error: "Admin or Moderator with users permission required" },
        { status: 403 }
      );
    }

    // Build filters for pending requests
    const filters: any = {
      approvalStatus: "PENDING",
    };

    // Get pending users with pagination
    const result = await dbHelpers.getUsersWithPagination(page, limit, filters);

    // If search is provided, filter by name or email
    if (search && result.users) {
      const searchLower = search.toLowerCase();
      result.users = result.users.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get user requests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user requests" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users/requests - Approve or reject user request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action } = body; // action: 'approve', 'reject', 'suspend', 'block'

    console.log("POST /api/admin/users/requests - Received:", {
      userId,
      action,
    }); // Debug log

    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify authentication
    const authResult = await authService.verifyToken(token);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!userId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["approve", "reject", "suspend", "block"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve', 'reject', 'suspend', or 'block'" },
        { status: 400 }
      );
    }

    // Get the user to update
    const user = await dbHelpers.getUserById(userId);
    if (!user) {
      console.error("User not found:", userId); // Debug log
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Found user:", {
      id: user.id,
      email: user.email,
      currentStatus: user.approvalStatus,
    });

    if (user.approvalStatus !== "PENDING") {
      console.error("User request already processed:", {
        userId,
        currentStatus: user.approvalStatus,
      }); // Debug log
      return NextResponse.json(
        { error: "User request has already been processed" },
        { status: 400 }
      );
    }

    // Update user approval status
    const updateData = {
      approvalStatus:
        action === "approve" ? ("APPROVED" as const) : ("REJECTED" as const),
      approvedAt: new Date(),
      approvedBy: authResult.user.id,
      isActive: action === "approve" ? true : false,
    };

    console.log("Updating user with data:", updateData); // Debug log

    const updatedUser = await dbHelpers.updateUser(userId, updateData);

    console.log("User updated successfully:", {
      userId,
      action,
      newStatus: updatedUser.approvalStatus,
    }); // Debug log

    // Send notification to the user
    const adminName = `${authResult.user.firstName} ${authResult.user.lastName}`;
    try {
      if (action === "approve") {
        await NotificationService.notifyUserApproved(userId, adminName);
      } else if (action === "reject") {
        await NotificationService.notifyUserRejected(userId, adminName);
      }
      // If action is suspend or block, we silently reject and skip notification
    } catch (notifError) {
      console.error(
        "Failed to send user approval/rejection notification:",
        notifError
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: `User ${
        action === "approve" ? "approved" : action === "reject" ? "rejected" : "suspended"
      } successfully`,
    });
  } catch (error) {
    console.error("Process user request error:", error);
    return NextResponse.json(
      { error: "Failed to process user request" },
      { status: 500 }
    );
  }
}

