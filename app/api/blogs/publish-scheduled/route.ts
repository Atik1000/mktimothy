import { prisma } from "@/lib/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/blogs/publish-scheduled - Publish scheduled blogs that are due
export async function POST(request: NextRequest) {
  try {
    // Find all scheduled blogs that should be published now
    const currentTime = new Date();

    const scheduledBlogs = await prisma.blog.findMany({
      where: {
        status: "SCHEDULED",
        publishedAt: {
          lte: currentTime, // Published time is less than or equal to current time
        },
        approvalStatus: "APPROVED", // Only publish approved blogs
        isActive: true,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (scheduledBlogs.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No scheduled blogs to publish",
        publishedCount: 0,
      });
    }

    // Update all scheduled blogs to published
    const publishedBlogs = [];

    for (const blog of scheduledBlogs) {
      const updatedBlog = await prisma.blog.update({
        where: { id: blog.id },
        data: {
          status: "PUBLISHED",
          updatedAt: new Date(),
        },
      });
      publishedBlogs.push(updatedBlog);
    }

    console.log(
      `Published ${publishedBlogs.length} scheduled blogs:`,
      publishedBlogs.map((blog) => ({ id: blog.id, title: blog.title }))
    );

    return NextResponse.json({
      success: true,
      message: `Successfully published ${publishedBlogs.length} scheduled blog(s)`,
      publishedCount: publishedBlogs.length,
      publishedBlogs: publishedBlogs.map((blog) => ({
        id: blog.id,
        title: blog.title,
        slug: blog.slug,
      })),
    });
  } catch (error) {
    console.error("Error publishing scheduled blogs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to publish scheduled blogs",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET /api/blogs/publish-scheduled - Check scheduled blogs status (for debugging)
export async function GET(request: NextRequest) {
  try {
    const currentTime = new Date();

    const scheduledBlogs = await prisma.blog.findMany({
      where: {
        status: "SCHEDULED",
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        publishedAt: true,
        approvalStatus: true,
        author: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        publishedAt: "asc",
      },
    });

    const dueBLogs = scheduledBlogs.filter(
      (blog) =>
        blog.publishedAt &&
        blog.publishedAt <= currentTime &&
        blog.approvalStatus === "APPROVED"
    );

    return NextResponse.json({
      success: true,
      currentTime: currentTime.toISOString(),
      totalScheduled: scheduledBlogs.length,
      dueForPublishing: dueBLogs.length,
      scheduledBlogs: scheduledBlogs.map((blog) => ({
        id: blog.id,
        title: blog.title,
        publishedAt: blog.publishedAt?.toISOString(),
        approvalStatus: blog.approvalStatus,
        author: `${blog.author.firstName} ${blog.author.lastName}`,
        isDue:
          blog.publishedAt &&
          blog.publishedAt <= currentTime &&
          blog.approvalStatus === "APPROVED",
      })),
    });
  } catch (error) {
    console.error("Error checking scheduled blogs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check scheduled blogs",
      },
      { status: 500 }
    );
  }
}
