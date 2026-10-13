import { getCurrentUser } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

import { prisma } from "@/lib/utils/prisma";

// GET /api/blogs - Get all blogs with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const status = searchParams.get("status") || "";
    const isFeatured = searchParams.get("isFeatured") === "true";
    const isActive = searchParams.get("isActive") !== "false";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const authorId = searchParams.get("authorId") || "";
    const tags = searchParams.get("tags") || "";

    console.log("API Blogs - Query params:", {
      authorId,
      status,
      isActive,
      page,
      limit,
      categoryId,
      tags,
    });

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive,
    };

    // Get current user to check admin status
    const currentUser = await getCurrentUser(request);

    // For non-admin users, only show approved blogs unless they're viewing their own blogs
    if (!authorId) {
      // Public blog listing - only show approved blogs
      where.approvalStatus = "APPROVED";
    } else if (currentUser?.id !== authorId && currentUser?.role !== "ADMIN") {
      // Viewing another user's blogs - only show approved ones
      where.approvalStatus = "APPROVED";
    }
    // If viewing own blogs or user is admin, show all blogs (no approval filter)

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { excerpt: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (status) {
      where.status = status;
    }

    if (isFeatured) {
      where.isFeatured = true;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (tags) {
      const tagList = tags.split(",").map((tag) => tag.trim());
      where.tags = {
        some: {
          tag: {
            name: { in: tagList },
          },
        },
      };
    }

    console.log("API Blogs - Where clause:", JSON.stringify(where, null, 2));

    // First, let's check if there are ANY blogs for this author
    if (authorId) {
      const totalUserBlogs = await prisma.blog.count({
        where: { authorId },
      });
      console.log(`Total blogs for author ${authorId}:`, totalUserBlogs);
    }

    // Get blogs with pagination
    const [blogs, totalCount] = await Promise.all([
      prisma.blog.findMany({
        where,
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
          comments: {
            where: { isActive: true },
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
            orderBy: {
              createdAt: "desc",
            },
            take: 5, // Latest 5 comments for preview
          },
          _count: {
            select: {
              likes: true,
              comments: true,
              savedBy: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.blog.count({ where }),
    ]);

    console.log("API Blogs - Found blogs:", blogs.length);
    console.log("API Blogs - Total count:", totalCount);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        blogs,
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
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create new blog
export async function POST(request: NextRequest) {
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
      status = "DRAFT",
      isFeatured = false,
      publishedAt,
    } = body;

    // Validate required fields
    if (!title || !content || !categoryId) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, content, and category are required",
        },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: "Invalid category" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = slugify(title, { lower: true, strict: true });
    const existingBlog = await prisma.blog.findUnique({
      where: { slug },
    });

    if (existingBlog) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create blog
    const blog = await prisma.blog.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        metaTitle,
        metaDescription,
        keywords: keywords || [],
        status,
        approvalStatus: user.role === "ADMIN" ? "APPROVED" : "PENDING",
        approvedAt: user.role === "ADMIN" ? new Date() : null,
        approvedBy: user.role === "ADMIN" ? user.id : null,
        isFeatured,
        authorId: user.id,
        categoryId,
        publishedAt:
          status === "PUBLISHED"
            ? new Date()
            : publishedAt
            ? new Date(publishedAt)
            : null,
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

    // Handle tags if provided
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
            blogId: blog.id,
            tagId: tag.id,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: blog,
      message: "Blog created successfully",
    });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create blog" },
      { status: 500 }
    );
  }
}

