import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { authService } from "@/lib/services/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const authResult = await authService.verifyToken(token);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (authResult.user.role !== "ADMIN" && authResult.user.role !== "MODERATOR") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "viewCount";
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { businessName: { contains: search, mode: "insensitive" } },
      ];
    }

    const [listings, total, totals] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: "desc" },
        select: {
          id: true,
          title: true,
          businessName: true,
          status: true,
          viewCount: true,
          likeCount: true,
          shareCount: true,
          createdAt: true,
          publishedAt: true,
          category: { select: { name: true, color: true } },
          user: { select: { firstName: true, lastName: true } },
          displayAuthorName: true,
          _count: { select: { likes: true, reviews: true, savedBy: true } },
        },
      }),
      prisma.listing.count({ where }),
      prisma.listing.aggregate({
        _sum: { viewCount: true, likeCount: true, shareCount: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        listings,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        totals: {
          views: totals._sum.viewCount || 0,
          likes: totals._sum.likeCount || 0,
          shares: totals._sum.shareCount || 0,
        },
      },
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
