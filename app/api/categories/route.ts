import { prisma } from "@/lib/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/categories - Get all categories
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeListingCount =
      searchParams.get("includeListingCount") === "true";
    const sectorId = searchParams.get("sectorId");

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        ...(sectorId ? {
          listings: {
            some: {
              sectorId,
              isActive: true,
              status: "PUBLISHED",
              approvalStatus: "APPROVED",
            }
          }
        } : {})
      },
      include: includeListingCount
        ? {
            _count: {
              select: {
                listings: {
                  where: {
                    isActive: true,
                    status: "PUBLISHED",
                    approvalStatus: "APPROVED",
                    ...(sectorId ? { sectorId } : {})
                  },
                },
              },
            },
          }
        : undefined,
      orderBy: {
        sortOrder: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
