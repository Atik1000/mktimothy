import { getCurrentUser } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

import { prisma } from "@/lib/utils/prisma";

// GET /api/tags - Get all tags
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      };
    }

    const tags = await prisma.tag.findMany({
      where,
      include: {
        _count: {
          select: {
            blogs: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch tags" },
      { status: 500 }
    );
  }
}

// POST /api/tags - Create new tag
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    // Only admin can create tags directly
    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, color } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Tag name is required" },
        { status: 400 }
      );
    }

    // Generate slug
    const slug = slugify(name.trim(), { lower: true, strict: true });

    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name: name.trim() },
    });

    if (existingTag) {
      return NextResponse.json(
        { success: false, error: "Tag already exists" },
        { status: 400 }
      );
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug,
        color,
      },
      include: {
        _count: {
          select: {
            blogs: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: tag,
      message: "Tag created successfully",
    });
  } catch (error) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create tag" },
      { status: 500 }
    );
  }
}
