
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/utils/prisma";

// GET /api/listings/featured - Get featured listings
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "8");

    const featuredListings = await prisma.listing.findMany({
      where: {
        isFeatured: true,
        isActive: true,
        status: "PUBLISHED",
        approvalStatus: "APPROVED", // Only show approved featured listings
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
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: featuredListings,
    });
  } catch (error) {
    console.error("Error fetching featured listings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch featured listings" },
      { status: 500 }
    );
  }
}
