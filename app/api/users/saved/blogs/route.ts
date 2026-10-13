import { getCurrentUser } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/utils/prisma";

// GET /api/users/saved/blogs - Get user's saved blogs
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

    // Get user's saved blogs with full blog details
    const [savedBlogs, totalCount] = await Promise.all([
      prisma.savedBlog.findMany({
        where: {
          userId: user.id,
          blog: {
            isActive: true,
            status: "PUBLISHED",
            approvalStatus: "APPROVED",
          },
        },
        include: {
          blog: {
            include: {
              author: {
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
                  comments: true,
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
      prisma.savedBlog.count({
        where: {
          userId: user.id,
          blog: {
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
        savedBlogs: savedBlogs.map((saved) => saved.blog),
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
    console.error("Error fetching saved blogs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch saved blogs" },
      { status: 500 }
    );
  }
}
