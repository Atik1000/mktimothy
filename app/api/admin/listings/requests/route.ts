import { dbHelpers } from "@/lib/config/database";
import { authService } from "@/lib/services/auth";
import { NotificationService } from "@/lib/services/notification";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/listings/requests - Get all pending listing requests
export async function GET(request: NextRequest) {
  try {
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

    // Check if user is admin or moderator with manage-listings permission
    const user = authResult.user;
    const isAdmin = user.role === "ADMIN";
    const hasPermission = user.role === "MODERATOR" && user.subAdminPermissions?.includes("manage-listings");

    if (!isAdmin && !hasPermission) {
      return NextResponse.json(
        { error: "Admin or Moderator with listings permission required" },
        { status: 403 }
      );
    }

    // Get all pending listings (no pagination, search handled client-side)
    const result = await dbHelpers.getListingsWithPagination(1, 1000, {
      approvalStatus: "PENDING",
    });

    return NextResponse.json({
      success: true,
      data: {
        listings: result.listings,
        totalCount: result.total,
      },
    });
  } catch (error) {
    console.error("Get listing requests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch listing requests" },
      { status: 500 }
    );
  }
}

// POST /api/admin/listings/requests - Approve or reject listing request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, action } = body; // action: 'approve' or 'reject'

    console.log("POST /api/admin/listings/requests - Received:", {
      listingId,
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

    // Check if user is admin or moderator with manage-listings permission
    const user = authResult.user;
    const isAdmin = user.role === "ADMIN";
    const hasPermission = user.role === "MODERATOR" && user.subAdminPermissions?.includes("manage-listings");

    if (!isAdmin && !hasPermission) {
      return NextResponse.json(
        { error: "Admin or Moderator with listings permission required" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!listingId || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Get the listing to update
    const listing = await dbHelpers.getListingById(listingId);
    if (!listing) {
      console.error("Listing not found:", listingId); // Debug log
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    console.log("Found listing:", {
      id: listing.id,
      title: listing.title,
      currentApprovalStatus: listing.approvalStatus,
    });

    // Update the listing approval status
    const newApprovalStatus = action === "approve" ? "APPROVED" : "REJECTED";
    const updateData: any = {
      approvalStatus: newApprovalStatus,
      approvedBy: authResult.user.id,
      approvedAt: new Date(),
    };

    console.log("Updating listing with:", updateData); // Debug log

    const updatedListing = await dbHelpers.updateListing(listingId, updateData);

    console.log("Updated listing approval status:", {
      id: updatedListing.id,
      title: updatedListing.title,
      approvalStatus: updatedListing.approvalStatus,
    }); // Debug log

    // Send notification to the listing owner
    const adminName = `${authResult.user.firstName} ${authResult.user.lastName}`;
    try {
      if (action === "approve") {
        await NotificationService.notifyListingApproved(
          listing.userId,
          listing.title,
          listingId,
          adminName
        );
      } else {
        await NotificationService.notifyListingRejected(
          listing.userId,
          listing.title,
          listingId,
          adminName
        );
      }
    } catch (notifError) {
      console.error(
        "Failed to send listing approval/rejection notification:",
        notifError
      );
    }

    return NextResponse.json({
      success: true,
      message: `Listing ${action}d successfully`,
      data: updatedListing,
    });
  } catch (error) {
    console.error("Update listing approval error:", error);
    return NextResponse.json(
      { error: "Failed to update listing approval status" },
      { status: 500 }
    );
  }
}
