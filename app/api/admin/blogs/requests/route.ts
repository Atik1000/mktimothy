import { dbHelpers } from "@/lib/config/database";
import { authService } from "@/lib/services/auth";
import { NotificationService } from "@/lib/services/notification";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/blogs/requests - Get all pending blog requests
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

    // Check if user is admin or moderator with manage-blogs permission
    const user = authResult.user;
    const isAdmin = user.role === "ADMIN";
    const hasPermission = user.role === "MODERATOR" && user.subAdminPermissions?.includes("manage-blogs");

    if (!isAdmin && !hasPermission) {
      return NextResponse.json(
        { error: "Admin or Moderator with blogs permission required" },
        { status: 403 }
      );
    }

    // Get all pending blogs (no pagination, search handled client-side)
    const result = await dbHelpers.getBlogsWithPagination(1, 1000, {
      approvalStatus: "PENDING",
    });

    return NextResponse.json({
      success: true,
      data: {
        blogs: result.blogs,
        totalCount: result.total,
      },
    });
  } catch (error) {
    console.error("Get blog requests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog requests" },
      { status: 500 }
    );
  }
}

// POST /api/admin/blogs/requests - Approve or reject blog request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { blogId, action } = body; // action: 'approve' or 'reject'

    console.log("POST /api/admin/blogs/requests - Received:", {
      blogId,
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

    // Check if user is admin or moderator with manage-blogs permission
    const user = authResult.user;
    const isAdmin = user.role === "ADMIN";
    const hasPermission = user.role === "MODERATOR" && user.subAdminPermissions?.includes("manage-blogs");

    if (!isAdmin && !hasPermission) {
      return NextResponse.json(
        { error: "Admin or Moderator with blogs permission required" },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!blogId || !action) {
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

    // Get the blog to update
    const blog = await dbHelpers.getBlogById(blogId);
    if (!blog) {
      console.error("Blog not found:", blogId); // Debug log
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    console.log("Found blog:", {
      id: blog.id,
      title: blog.title,
      currentApprovalStatus: blog.approvalStatus,
    });

    // Allow re-approval of rejected blogs and rejection of approved blogs
    // Only prevent action if trying to approve an already approved blog or reject an already rejected blog
    if (
      (action === "approve" && blog.approvalStatus === "APPROVED") ||
      (action === "reject" && blog.approvalStatus === "REJECTED")
    ) {
      console.error("Blog already has the requested status:", {
        blogId,
        currentApprovalStatus: blog.approvalStatus,
        requestedAction: action,
      }); // Debug log
      return NextResponse.json(
        { error: `Blog is already ${action}d` },
        { status: 400 }
      );
    }

    // Update blog approval status
    const updateData = {
      approvalStatus:
        action === "approve" ? ("APPROVED" as const) : ("REJECTED" as const),
      approvedAt: new Date(),
      approvedBy: authResult.user.id,
      // If approving, set status to PUBLISHED. If rejecting, set status to DRAFT
      status:
        action === "approve" ? ("PUBLISHED" as const) : ("DRAFT" as const),
    };

    console.log("Updating blog with data:", updateData); // Debug log

    const updatedBlog = await dbHelpers.updateBlog(blogId, updateData);

    console.log("Blog updated successfully:", {
      blogId,
      action,
      newApprovalStatus: updatedBlog.approvalStatus,
    }); // Debug log

    // Send notification to the blog author
    const adminName = `${authResult.user.firstName} ${authResult.user.lastName}`;
    try {
      if (action === "approve") {
        await NotificationService.notifyBlogApproved(
          blog.authorId,
          blog.title,
          blogId,
          adminName
        );
      } else {
        await NotificationService.notifyBlogRejected(
          blog.authorId,
          blog.title,
          blogId,
          adminName
        );
      }
    } catch (notifError) {
      console.error(
        "Failed to send blog approval/rejection notification:",
        notifError
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedBlog,
      message: `Blog ${
        action === "approve" ? "approved" : "rejected"
      } successfully`,
    });
  } catch (error) {
    console.error("Process blog request error:", error);
    return NextResponse.json(
      { error: "Failed to process blog request" },
      { status: 500 }
    );
  }
}

