import { getCurrentUser } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/utils/prisma";

// GET /api/users/saved/listings - Get user's saved listings
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
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Get user's saved listings with full listing details
    const [savedListings, totalCount] = await Promise.all([
      prisma.savedListing.findMany({
        where: {
          userId: user.id,
          listing: {
            isActive: true,
            status: "PUBLISHED",
            approvalStatus: "APPROVED",
          },
        },
        include: {
          listing: {
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
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.savedListing.count({
        where: {
          userId: user.id,
          listing: {
            isActive: true,
            status: "PUBLISHED",
            approvalStatus: "APPROVED",
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        savedListings: savedListings.map((saved) => {
          const listingData = saved.listing as any;
          if (!listingData.images && listingData.listingImages) {
            listingData.images = listingData.listingImages.map((img: any) => img.url);
          }
          return listingData;
        }),
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
    console.error("Error fetching saved listings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch saved listings" },
      { status: 500 }
    );
  }
}
