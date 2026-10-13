import { getCurrentUser } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/utils/prisma";

// POST /api/blogs/[id]/save - Save/Unsave blog
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

    // Check if user already saved this blog
    const existingSave = await prisma.savedBlog.findUnique({
      where: {
        userId_blogId: {
          userId: user.id,
          blogId: blogId,
        },
      },
    });

    if (existingSave) {
      // Unsave: Remove the save
      await prisma.savedBlog.delete({
        where: {
          id: existingSave.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Blog unsaved successfully",
        saved: false,
      });
    } else {
      // Save: Add the save
      await prisma.savedBlog.create({
        data: {
          userId: user.id,
          blogId: blogId,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Blog saved successfully",
        saved: true,
      });
    }
  } catch (error) {
    console.error("Error saving/unsaving blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save/unsave blog" },
      { status: 500 }
    );
  }
}
