import { getCurrentUser } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/utils/prisma";

// GET /api/users/history/blogs - Get user's blog viewing history
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

    // Get unique blog IDs from user's viewing history (most recent view per blog)
    const blogViews = await prisma.activityLog.findMany({
      where: {
        userId: user.id,
        action: "VIEW_BLOG",
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        data: true,
        createdAt: true,
      },
    });

    // Deduplicate by blog ID, keeping only the most recent view of each blog
    const uniqueBlogViews = new Map();
    blogViews.forEach((view) => {
      const data = view.data as { blogId?: string } | null;
      const blogId = data?.blogId;
      if (blogId && !uniqueBlogViews.has(blogId)) {
        uniqueBlogViews.set(blogId, view);
      }
    });

    // Convert to array
    const allUniqueBlogViews = Array.from(uniqueBlogViews.values());

    // Extract all blog IDs to check which ones are still active
    const allBlogIds = allUniqueBlogViews
      .map((view) => {
        const data = view.data as { blogId?: string } | null;
        return data?.blogId;
      })
      .filter((id) => id) as string[];

    // First, get all active blogs to filter out inactive ones
    const activeBlogs = await prisma.blog.findMany({
      where: {
        id: { in: allBlogIds },
        isActive: true,
        status: "PUBLISHED",
        approvalStatus: "APPROVED",
      },
      select: {
        id: true,
      },
    });

    const activeBlogIds = new Set(activeBlogs.map((blog) => blog.id));

    // Filter views to only include active blogs
    const activeBlogViews = allUniqueBlogViews.filter((view) => {
      const data = view.data as { blogId?: string } | null;
      const blogId = data?.blogId;
      return blogId && activeBlogIds.has(blogId);
    });

    // Now calculate the correct total count and apply pagination
    const totalCount = activeBlogViews.length;
    const paginatedBlogViews = activeBlogViews.slice(skip, skip + limit);

    // Extract blog IDs for the current page
    const blogIds = paginatedBlogViews
      .map((view) => {
        const data = view.data as { blogId?: string } | null;
        return data?.blogId;
      })
      .filter((id) => id) as string[];

    const blogs = await prisma.blog.findMany({
      where: {
        id: { in: blogIds },
        isActive: true,
        status: "PUBLISHED",
        approvalStatus: "APPROVED",
      },
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
    });

    // Create a map of blog ID to blog data for efficient lookup
    const blogMap = new Map(blogs.map((blog) => [blog.id, blog]));

    // Combine view history with blog data, maintaining chronological order
    const blogHistory = paginatedBlogViews
      .map((view) => {
        const data = view.data as { blogId?: string } | null;
        const blogId = data?.blogId;
        if (!blogId) return null;
        const blog = blogMap.get(blogId);
        if (!blog) return null;

        return {
          ...blog,
          viewedAt: view.createdAt,
        };
      })
      .filter((item) => item !== null);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        blogs: blogHistory,
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
    console.error("Error fetching blog history:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog history" },
      { status: 500 }
    );
  }
}
