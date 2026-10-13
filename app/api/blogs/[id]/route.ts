import { getCurrentUser } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

import { prisma } from "@/lib/utils/prisma";

// GET /api/blogs/[id] - Get single blog
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser(request);
    const isAdmin = user?.role === "ADMIN" || user?.role === "MODERATOR";

    const blog = await prisma.blog.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            email: true,
            phone: true,
            location: true,
            bio: true,
            website: true,
            socialLinks: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        comments: {
          where: { 
            isActive: true, 
            parentId: null,
            ...(!isAdmin ? {
              OR: [
                { approvalStatus: "APPROVED" },
                ...(user ? [{ userId: user.id }] : [])
              ]
            } : {})
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
            replies: {
              where: { 
                isActive: true,
                ...(!isAdmin ? {
                  OR: [
                    { approvalStatus: "APPROVED" },
                    ...(user ? [{ userId: user.id }] : [])
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
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        savedBy: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
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

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.blog.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    // Track view in activity log if user is authenticated
    if (user) {
      await prisma.activityLog.create({
        data: {
          action: "VIEW_BLOG",
          description: `Viewed blog: ${blog.title}`,
          data: {
            blogId: params.id,
            blogTitle: blog.title,
          },
          userId: user.id,
          ipAddress:
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: blog,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[id] - Update blog
export async function PUT(
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
    const {
      title,
      excerpt,
      content,
      coverImage,
      categoryId,
      tags,
      metaTitle,
      metaDescription,
      keywords,
      status,
      isFeatured,
      isActive,
      publishedAt,
    } = body;

    // Check if blog exists and user has permission
    const existingBlog = await prisma.blog.findUnique({
      where: { id: params.id },
      include: {
        tags: true,
      },
    });

    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    if (existingBlog.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized to update this blog" },
        { status: 403 }
      );
    }

    // If title is being changed, update slug
    let slug = existingBlog.slug;
    if (title && title !== existingBlog.title) {
      slug = slugify(title, { lower: true, strict: true });
      const existingWithSlug = await prisma.blog.findUnique({
        where: { slug },
      });

      if (existingWithSlug && existingWithSlug.id !== params.id) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Determine if we need to reset approval status to PENDING
    // This happens when:
    // 1. A rejected blog is being updated by its author (including admin authors)
    // 2. The content is being modified (title, content, excerpt, etc.)
    // 3. Exception: Don't reset if an admin is updating someone else's blog
    const isAuthorUpdatingOwnBlog = existingBlog.authorId === user.id;
    const shouldResetApprovalStatus =
      isAuthorUpdatingOwnBlog &&
      (title || content || excerpt || coverImage || categoryId);

    // Update blog
    const updatedBlog = await prisma.blog.update({
      where: { id: params.id },
      data: {
        ...(title && { title, slug }),
        ...(excerpt !== undefined && { excerpt }),
        ...(content && { content }),
        ...(coverImage !== undefined && { coverImage }),
        ...(categoryId && { categoryId }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(keywords !== undefined && { keywords }),
        ...(status && {
          status,
          publishedAt:
            status === "PUBLISHED" && existingBlog.status !== "PUBLISHED"
              ? new Date()
              : status === "SCHEDULED" && publishedAt
              ? new Date(publishedAt)
              : existingBlog.publishedAt,
        }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isActive !== undefined && { isActive }),
        // Reset approval status to PENDING if blog was rejected and content is being updated
        ...(shouldResetApprovalStatus && {
          approvalStatus: "PENDING",
          approvedAt: null,
          approvedBy: null,
        }),
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
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
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

    // Handle tags update if provided
    if (tags !== undefined) {
      // Remove existing tags
      await prisma.blogTag.deleteMany({
        where: { blogId: params.id },
      });

      // Add new tags
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          // Create tag if it doesn't exist
          const tag = await prisma.tag.upsert({
            where: { name: tagName.trim() },
            update: {},
            create: {
              name: tagName.trim(),
              slug: slugify(tagName.trim(), { lower: true, strict: true }),
            },
          });

          // Link tag to blog
          await prisma.blogTag.create({
            data: {
              blogId: params.id,
              tagId: tag.id,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedBlog,
      message: "Blog updated successfully",
    });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update blog" },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] - Delete blog
export async function DELETE(
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

    // Check if blog exists and user has permission
    const existingBlog = await prisma.blog.findUnique({
      where: { id: params.id },
    });

    if (!existingBlog) {
      return NextResponse.json(
        { success: false, error: "Blog not found" },
        { status: 404 }
      );
    }

    if (existingBlog.authorId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized to delete this blog" },
        { status: 403 }
      );
    }

    // Delete blog (cascade will handle related records)
    await prisma.blog.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete blog" },
      { status: 500 }
    );
  }
}
