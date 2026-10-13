import { prisma } from "@/lib/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get all listings and check their approval status
    const allListings = await prisma.listing.findMany({
      select: {
        id: true,
        title: true,
        approvalStatus: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const listingsWithNullApproval = allListings.filter(
      (listing) => listing.approvalStatus === null
    );
    const pendingListings = allListings.filter(
      (listing) => listing.approvalStatus === "PENDING"
    );
    const approvedListings = allListings.filter(
      (listing) => listing.approvalStatus === "APPROVED"
    );

    return NextResponse.json({
      success: true,
      data: {
        totalListings: allListings.length,
        listingsWithNullApproval: listingsWithNullApproval.length,
        pendingListings: pendingListings.length,
        approvedListings: approvedListings.length,
        allListings: allListings.map((listing) => ({
          id: listing.id,
          title: listing.title,
          approvalStatus: listing.approvalStatus,
          status: listing.status,
          author: `${listing.user.firstName} ${listing.user.lastName}`,
          createdAt: listing.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Debug listings error:", error);
    return NextResponse.json(
      { error: "Failed to debug listings" },
      { status: 500 }
    );
  }
}
