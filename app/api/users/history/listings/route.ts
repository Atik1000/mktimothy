import { getCurrentUser } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/utils/prisma";

// GET /api/users/history/listings - Get user's listing viewing history
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    // Get unique listing IDs from user's viewing history (most recent view per listing)
    const listingViews = await prisma.activityLog.findMany({
      where: {
        userId: user.id,
        action: "VIEW_LISTING",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        data: true,
        createdAt: true,
      },
    });

    // Deduplicate by listing ID, keeping only the most recent view of each listing
    const uniqueListingViews = new Map();
    listingViews.forEach((view) => {
      const data = view.data as { listingId?: string } | null;
      const listingId = data?.listingId;
      if (listingId && !uniqueListingViews.has(listingId)) {
        uniqueListingViews.set(listingId, view);
      }
    });

    // Convert to array
    const allUniqueListingViews = Array.from(uniqueListingViews.values());

    // Extract all listing IDs to check which ones are still active
    const allListingIds = allUniqueListingViews
      .map((view) => {
        const data = view.data as { listingId?: string } | null;
        return data?.listingId;
      })
      .filter((id) => id) as string[];

    // First, get all active listings to filter out inactive ones
    const activeListings = await prisma.listing.findMany({
      where: {
        id: { in: allListingIds },
        isActive: true,
        status: "PUBLISHED",
        approvalStatus: "APPROVED",
      },
      select: {
        id: true,
      },
    });

    const activeListingIds = new Set(
      activeListings.map((listing) => listing.id)
    );

    // Filter views to only include active listings
    const activeListingViews = allUniqueListingViews.filter((view) => {
      const data = view.data as { listingId?: string } | null;
      const listingId = data?.listingId;
      return listingId && activeListingIds.has(listingId);
    });

    // Now calculate the correct total count and apply pagination
    const totalCount = activeListingViews.length;
    const paginatedListingViews = activeListingViews.slice(skip, skip + limit);

    // Extract listing IDs for the current page
    const listingIds = paginatedListingViews
      .map((view) => {
        const data = view.data as { listingId?: string } | null;
        return data?.listingId;
      })
      .filter((id) => id) as string[];

    const listings = await prisma.listing.findMany({
      where: {
        id: { in: listingIds },
        isActive: true,
        status: "PUBLISHED",
        approvalStatus: "APPROVED",
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        listingImages: {
          orderBy: { order: "asc" },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
          },
        },
        _count: {
          select: {
            likes: true,
            reviews: true,
            savedBy: true,
          },
        },
      },
    });

    // Create a map of listing ID to listing data for efficient lookup
    const listingMap = new Map(
      listings.map((listing) => [listing.id, listing])
    );

    // Combine view history with listing data, maintaining chronological order
    const listingHistory = paginatedListingViews
      .map((view) => {
        const data = view.data as { listingId?: string } | null;
        const listingId = data?.listingId;
        if (!listingId) return null;
        const listing = listingMap.get(listingId);
        if (!listing) return null;

        const listingData = { ...listing } as any;
        if (!listingData.images && listingData.listingImages) {
          listingData.images = listingData.listingImages.map((img: any) => img.url);
        }

        return {
          ...listingData,
          viewedAt: view.createdAt,
        };
      })
      .filter((item) => item !== null);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        listings: listingHistory,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          pageSize: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching listing history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listing history" },
      { status: 500 }
    );
  }
}
