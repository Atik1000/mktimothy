import { getCurrentUser } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/utils/prisma";

// PUT /api/blogs/[id]/comments/[commentId] - Edit comment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
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
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Comment content is required" },
        { status: 400 }
      );
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id: params.commentId },
    });

    if (!existingComment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized to edit this comment" },
        { status: 403 }
      );
    }

    const updatedComment = await prisma.comment.update({
      where: { id: params.commentId },
      data: {
        content: content.trim(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedComment,
    });
  } catch (error) {
    console.error("Error editing comment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to edit comment" },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id]/comments/[commentId] - Delete comment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const existingComment = await prisma.comment.findUnique({
      where: { id: params.commentId },
    });

    if (!existingComment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    if (existingComment.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized to delete this comment" },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: params.commentId },
    });

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete comment" },
      { status: 500 }
    );
  }
}
