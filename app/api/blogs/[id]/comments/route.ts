import { getCurrentUser } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/utils/prisma";

// GET /api/blogs/[id]/comments - Get comments for a blog
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const currentUser = await getCurrentUser(request);
    
    const whereClause: any = {
      blogId: params.id,
      isActive: true,
      parentId: null,
    };
    
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR")) {
      whereClause.OR = [
        { approvalStatus: "APPROVED" },
        ...(currentUser ? [{ userId: currentUser.id }] : [])
      ];
    }

    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          replies: {
            where: { 
              isActive: true,
              ...(!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR") ? {
                OR: [
                  { approvalStatus: "APPROVED" },
                  ...(currentUser ? [{ userId: currentUser.id }] : [])
                ]
              } : {})
            },
            orderBy: { createdAt: "asc" },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
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
      prisma.comment.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        comments,
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
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/blogs/[id]/comments - Add a comment to a blog
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, rating, parentId } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id: params.id },
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    const isAdmin = user.role === "ADMIN" || user.role === "MODERATOR";

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        rating: rating || null,
        userId: user.id,
        blogId: params.id,
        parentId: parentId || null,
        approvalStatus: isAdmin ? "APPROVED" : "PENDING",
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
      },
    });

    return NextResponse.json({
      success: true,
      data: comment,
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

