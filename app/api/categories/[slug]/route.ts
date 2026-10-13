
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/utils/prisma";

// GET /api/categories/[slug] - Get single category by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Find category by slug
    const category = await prisma.category.findUnique({
      where: { slug: params.slug },
      include: {
        _count: {
          select: {
            listings: {
              where: {
                isActive: true,
                status: "PUBLISHED",
                approvalStatus: "APPROVED", // Only count approved listings
              },
            },
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}
