import { prisma } from "@/lib/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get all blogs and check their approval status
    const allBlogs = await prisma.blog.findMany({
      select: {
        id: true,
        title: true,
        approvalStatus: true,
        status: true,
        createdAt: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const blogsWithNullApproval = allBlogs.filter(
      (blog) => blog.approvalStatus === null
    );
    const pendingBlogs = allBlogs.filter(
      (blog) => blog.approvalStatus === "PENDING"
    );
    const approvedBlogs = allBlogs.filter(
      (blog) => blog.approvalStatus === "APPROVED"
    );

    return NextResponse.json({
      success: true,
      data: {
        totalBlogs: allBlogs.length,
        blogsWithNullApproval: blogsWithNullApproval.length,
        pendingBlogs: pendingBlogs.length,
        approvedBlogs: approvedBlogs.length,
        allBlogs: allBlogs.map((blog) => ({
          id: blog.id,
          title: blog.title,
          approvalStatus: blog.approvalStatus,
          status: blog.status,
          author: `${blog.author.firstName} ${blog.author.lastName}`,
          createdAt: blog.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Debug blogs error:", error);
    return NextResponse.json(
      { error: "Failed to debug blogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Fix blogs with null approval status by setting them to PENDING
    const result = await prisma.blog.updateMany({
      where: {
        approvalStatus: undefined,
      },
      data: {
        approvalStatus: "PENDING",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Updated ${result.count} blogs to PENDING status`,
      updatedCount: result.count,
    });
  } catch (error) {
    console.error("Fix blogs approval status error:", error);
    return NextResponse.json(
      { error: "Failed to fix blogs approval status" },
      { status: 500 }
    );
  }
}
