import { getCurrentUser } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

import { prisma } from "@/lib/utils/prisma";

// GET /api/listings - Get all listings with filters and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const sectorId = searchParams.get("sectorId") || "";
    const status = searchParams.get("status") || "";
    const isFeatured = searchParams.get("isFeatured") === "true";
    const isActive = searchParams.get("isActive") !== "false";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const userId = searchParams.get("userId") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const businessType = searchParams.get("businessType") || "";
    const country = searchParams.get("country") || "";
    const city = searchParams.get("city") || "";
    const state = searchParams.get("state") || "";

    console.log("API Listings - Query params:", {
      userId,
      status,
      isActive,
      page,
      limit,
      minPrice,
      maxPrice,
      businessType,
      country,
      city,
      state,
    });

    const skip = (page - 1) * limit;

    // Get current user to check admin status
    const currentUser = await getCurrentUser(request);

    // Build where clause
    const where: any = {
      isActive,
    };

    // For non-admin users, only show approved listings unless they're viewing their own listings
    if (!userId) {
      // Public listing - only show approved listings
      where.approvalStatus = "APPROVED";
    } else if (currentUser?.id !== userId && currentUser?.role !== "ADMIN") {
      // Viewing another user's listings - only show approved ones
      where.approvalStatus = "APPROVED";
    }
    // If viewing own listings or user is admin, show all listings (no approval filter)

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { businessName: { contains: search, mode: "insensitive" } },
        { businessType: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (sectorId) {
      where.sectorId = sectorId;
    }

    if (status) {
      if (status.includes(",")) {
        where.status = { in: status.split(",") };
      } else {
        where.status = status;
      }
    }

    if (isFeatured) {
      where.isFeatured = true;
    }

    if (userId) {
      where.userId = userId;
    }

    // Price range filters
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    // Business type filter
    if (businessType) {
      where.businessType = { contains: businessType, mode: "insensitive" };
    }

    // Location filters
    if (country) {
      where.country = { contains: country, mode: "insensitive" };
    }
    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }
    if (state) {
      where.state = { contains: state, mode: "insensitive" };
    }

    // Dynamic Meta filters
    const standardKeys = [
      "page", "limit", "search", "categoryId", "sectorId", 
      "status", "isFeatured", "isActive", "sortBy", "sortOrder", 
      "userId", "minPrice", "maxPrice", "businessType", "country", 
      "city", "state"
    ];
    const metaFilters: any[] = [];

    Array.from(searchParams.entries()).forEach(([key, value]) => {
      if (!standardKeys.includes(key) && value) {
        metaFilters.push({
          meta: {
            some: {
              metaKey: key,
              metaValue: value,
            },
          },
        });
      }
    });

    if (metaFilters.length > 0) {
      where.AND = metaFilters;
    }

    console.log("API Listings - Where clause:", JSON.stringify(where, null, 2));

    // First, let's check if there are ANY listings for this user
    if (userId) {
      const totalUserListings = await prisma.listing.count({
        where: { userId },
      });
      console.log(`Total listings for user ${userId}:`, totalUserListings);
    }

    // Get listings with pagination
    const [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          user: {
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
              tagColor: true,
            },
          },
          sector: {
            select: {
              id: true,
              name: true,
              slug: true,
              icon: true,
            },
          },
          listingImages: {
            orderBy: { order: "asc" },
          },
          meta: true,
          _count: {
            select: {
              likes: true,
              reviews: true,
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
      prisma.listing.count({ where }),
    ]);

    console.log("API Listings - Found listings:", listings.length);
    console.log("API Listings - Total count:", totalCount);

    const totalPages = Math.ceil(totalCount / limit);

    const mappedListings = listings.map((listing: any) => {
      // Sort images to ensure featured image is always first
      const sortedImages = [...(listing.listingImages || [])].sort((a: any, b: any) => {
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return (a.order || 0) - (b.order || 0);
      });

      return {
        ...listing,
        images: sortedImages.map((img: any) => img.url),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        listings: mappedListings,
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
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listings" },
      { status: 500 }
    );
  }
}

// POST /api/listings - Create new listing
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
      description,
      content,
      businessName,
      businessType,
      website,
      email,
      phone,
      address,
      city,
      state,
      country,
      zipCode,
      latitude,
      longitude,
      images,
      videos,
      documents,
      price,
      priceType,
      currency,
      businessHours,
      categoryId,
      sectorId,
      metaTitle,
      metaDescription,
      keywords,
      status = "DRAFT",
      isFeatured = false,
      summary,
      askingPrice,
      priceOnRequest = false,
      listingImages = [],
      meta = {},
    } = body;

    // Validate required fields
    if (!title || !description || !categoryId || !sectorId) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, description, category, and sector are required",
        },
        { status: 400 }
      );
    }

    if (!listingImages || listingImages.length < 4) {
      return NextResponse.json(
        {
          success: false,
          error: "A minimum of 4 listing images are required",
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
    const existingListing = await prisma.listing.findUnique({
      where: { slug },
    });

    if (existingListing) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        title,
        slug,
        description,
        content,
        businessName,
        businessType,
        website,
        email,
        phone,
        address,
        city,
        state,
        country,
        zipCode,
        latitude,
        longitude,
        listingImages: {
          create: listingImages.map((img: any, index: number) => ({
            url: typeof img === 'string' ? img : img.url,
            isFeatured: typeof img === 'string' ? index === 0 : (img.isFeatured || index === 0),
            order: typeof img === 'string' ? index : (img.order || index),
          })),
        },
        meta: {
          create: Object.entries(meta).map(([key, value]) => ({
            metaKey: key,
            metaValue: String(value),
          })),
        },
        videos: videos || [],
        documents: documents || [],
        price,
        askingPrice,
        priceOnRequest,
        priceType,
        currency: currency || "USD",
        businessHours,
        status,
        approvalStatus: user.role === "ADMIN" ? "APPROVED" : "PENDING",
        approvedAt: user.role === "ADMIN" ? new Date() : null,
        approvedBy: user.role === "ADMIN" ? user.id : null,
        isFeatured,
        metaTitle,
        metaDescription,
        keywords: keywords || [],
        user: { connect: { id: user.id } },
        category: { connect: { id: categoryId } },
        sector: { connect: { id: sectorId } },
        summary,
        publishedAt: status === "PUBLISHED" || status === "ACTIVE" ? new Date() : null,
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
            reviews: true,
            savedBy: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: listing,
      message: "Listing created successfully",
    });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create listing" },
      { status: 500 }
    );
  }
}

