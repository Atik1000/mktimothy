import { getCurrentUser } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/utils/prisma";

// POST /api/blogs/[id]/like - Like/Unlike blog
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

    const blogId = params.id;

    // Check if blog exists
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    // Check if user already liked this blog
    const existingLike = await prisma.blogLike.findUnique({
      where: {
        userId_blogId: {
          userId: user.id,
          blogId: blogId,
        },
      },
    });

    if (existingLike) {
      // Unlike: Remove the like
      await prisma.blogLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      // Decrement like count
      await prisma.blog.update({
        where: { id: blogId },
        data: {
          likeCount: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Blog unliked successfully",
        liked: false,
      });
    } else {
      // Like: Add the like
      await prisma.blogLike.create({
        data: {
          userId: user.id,
          blogId: blogId,
        },
      });

      // Increment like count
      await prisma.blog.update({
        where: { id: blogId },
        data: {
          likeCount: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Blog liked successfully",
        liked: true,
      });
    }
  } catch (error) {
    console.error("Error liking/unliking blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to like/unlike blog" },
      { status: 500 }
    );
  }
}
