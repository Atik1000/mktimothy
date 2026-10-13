import { getCurrentUser } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/utils/prisma";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    // Check if user is an admin or moderator
    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, type, action } = body;

    if (!id || !type || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["APPROVED", "REJECTED"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "Invalid action" },
        { status: 400 }
      );
    }

    let updatedItem;

    if (type === "listing") {
      updatedItem = await prisma.listing.update({
        where: { id },
        data: {
          approvalStatus: action,
          approvedAt: action === "APPROVED" ? new Date() : null,
          approvedBy: user.id,
        },
      });
    } else if (type === "comment") {
      updatedItem = await prisma.comment.update({
        where: { id },
        data: {
          approvalStatus: action,
        },
      });
    } else if (type === "review") {
      updatedItem = await prisma.review.update({
        where: { id },
        data: {
          approvalStatus: action,
        },
      });
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid content type" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${type} has been ${action.toLowerCase()} successfully`,
      data: updatedItem,
    });
  } catch (error) {
    console.error("Error approving/rejecting content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process content moderation" },
      { status: 500 }
    );
  }
}
