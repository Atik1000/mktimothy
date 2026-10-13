import { getCurrentUser } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/utils/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    
    // Check if user is an admin or moderator
    if (!user || (user.role !== "ADMIN" && user.role !== "MODERATOR")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "all"; // 'all', 'listing', 'comment', 'review'

    let pendingListings: any[] = [];
    let pendingComments: any[] = [];
    let pendingReviews: any[] = [];

    if (type === "all" || type === "listing") {
      pendingListings = await prisma.listing.findMany({
        where: { approvalStatus: "PENDING" },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          category: { select: { name: true } },
        },
        orderBy: { updatedAt: "desc" },
      });
    }

    if (type === "all" || type === "comment") {
      pendingComments = await prisma.comment.findMany({
        where: { approvalStatus: "PENDING" },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          blog: { select: { id: true, title: true } },
          parent: {
            select: {
              user: { select: { firstName: true, lastName: true } }
            }
          }
        },
        orderBy: { createdAt: "desc" },
      });
    }

    if (type === "all" || type === "review") {
      pendingReviews = await prisma.review.findMany({
        where: { approvalStatus: "PENDING" },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
          listing: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        listings: pendingListings,
        comments: pendingComments,
        reviews: pendingReviews,
      },
    });
  } catch (error) {
    console.error("Error fetching pending content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pending content" },
      { status: 500 }
    );
  }
}
