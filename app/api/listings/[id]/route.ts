import { getCurrentUser } from "@/lib/auth";

import { NextRequest, NextResponse } from "next/server";
import slugify from "slugify";

import { prisma } from "@/lib/utils/prisma";

// GET /api/listings/[id] - Get single listing
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        user: {
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
        sector: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        reviews: {
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
          take: 10,
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
        listingImages: {
          orderBy: {
            order: "asc",
          },
        },
        meta: true,
        verification: true,
        _count: {
          select: {
            likes: true,
            reviews: true,
            savedBy: true,
          },
        },
      },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.listing.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    // Track view in activity log if user is authenticated
    const user = await getCurrentUser(request);
    if (user) {
      await prisma.activityLog.create({
        data: {
          action: "VIEW_LISTING",
          description: `Viewed listing: ${listing.title}`,
          data: {
            listingId: params.id,
            listingTitle: listing.title,
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

    // Map images for frontend compatibility, ensuring featured image is first
    const sortedImages = [...(listing as any).listingImages || []].sort((a: any, b: any) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return (a.order || 0) - (b.order || 0);
    });

    const mappedListing = {
      ...listing,
      images: sortedImages.map((img: any) => img.url),
    };

    return NextResponse.json({
      success: true,
      data: mappedListing,
    });
  } catch (error) {
    console.error("Error fetching listing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch listing" },
      { status: 500 }
    );
  }
}

// PUT /api/listings/[id] - Update listing
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
      listingImages,
      videos,
      documents,
      price,
      priceType,
      currency,
      businessHours,
      categoryId,
      metaTitle,
      metaDescription,
      keywords,
      status,
      isFeatured,
      isActive,
    } = body;

    // Check if listing exists and user has permission
    const existingListing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: { listingImages: true }
    });

    if (!existingListing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    if (existingListing.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized to update this listing" },
        { status: 403 }
      );
    }

    // If title is being changed, update slug
    let slug = existingListing.slug;
    if (title && title !== existingListing.title) {
      slug = slugify(title, { lower: true, strict: true });
      const existingWithSlug = await prisma.listing.findUnique({
        where: { slug },
      });

      if (existingWithSlug && existingWithSlug.id !== params.id) {
        slug = `${slug}-${Date.now()}`;
      }
    }

    // Determine if we need to reset approval status to PENDING
    // This happens when:
    // 1. A rejected listing is being updated by its author (including admin authors)
    // 2. The content is being modified (title, description, images, etc.)
    // 3. Exception: Don't reset if an admin is updating someone else's listing
    const isAuthorUpdatingOwnListing = existingListing.userId === user.id;
    const shouldResetApprovalStatus =
      isAuthorUpdatingOwnListing &&
      (title ||
        description ||
        content ||
        businessName ||
        businessType ||
        website ||
        email ||
        phone ||
        address ||
        city ||
        state ||
        country ||
        listingImages ||
        videos ||
        price ||
        categoryId);

    // Enforce minimum 4 images rule for PUBLISHED or PENDING listings
    // If they are setting it to PUBLISHED or if it's currently PUBLISHED/PENDING and they are updating it
    const isTryingToPublish = status === "PUBLISHED" || existingListing.status === "PUBLISHED" || existingListing.approvalStatus === "PENDING";
    
    if (isTryingToPublish) {
      const currentImageCount = existingListing.listingImages ? existingListing.listingImages.length : 0;
      
      // If they provided new images in the payload, check that length
      if (listingImages && listingImages.length < 4) {
        return NextResponse.json(
          { success: false, error: "A minimum of 4 images is required to publish a listing." },
          { status: 400 }
        );
      } else if (!listingImages && currentImageCount < 4) {
        return NextResponse.json(
          { success: false, error: "A minimum of 4 images is required to publish a listing." },
          { status: 400 }
        );
      }
    }

    // Update listing
    const updatedListing = await prisma.listing.update({
      where: { id: params.id },
      data: {
        ...(title && { title, slug }),
        ...(description && { description }),
        ...(content !== undefined && { content }),
        ...(businessName !== undefined && { businessName }),
        ...(businessType !== undefined && { businessType }),
        ...(website !== undefined && { website }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(country !== undefined && { country }),
        ...(zipCode !== undefined && { zipCode }),
        ...(latitude !== undefined && { latitude }),
        ...(longitude !== undefined && { longitude }),
        ...(listingImages && {
          listingImages: {
            deleteMany: {},
            create: listingImages.map((img: any, index: number) => ({
              url: img.url,
              isFeatured: img.isFeatured,
              order: img.order || index,
            })),
          },
        }),
        ...(videos !== undefined && { videos }),
        ...(documents !== undefined && { documents }),
        ...(price !== undefined && { price }),
        ...(priceType !== undefined && { priceType }),
        ...(currency !== undefined && { currency }),
        ...(businessHours !== undefined && { businessHours }),
        ...(categoryId && { categoryId }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
        ...(keywords !== undefined && { keywords }),
        ...(status && {
          status,
          publishedAt:
            status === "PUBLISHED" && existingListing.status !== "PUBLISHED"
              ? new Date()
              : existingListing.publishedAt,
        }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(isActive !== undefined && { isActive }),
        // Reset approval status to PENDING if listing was rejected and content is being updated
        ...(shouldResetApprovalStatus && {
          approvalStatus: "PENDING",
          approvedAt: null,
          approvedBy: null,
        }),
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
      data: updatedListing,
      message: "Listing updated successfully",
    });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

// DELETE /api/listings/[id] - Delete listing
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

    // Check if listing exists and user has permission
    const existingListing = await prisma.listing.findUnique({
      where: { id: params.id },
    });

    if (!existingListing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    if (existingListing.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized to delete this listing" },
        { status: 403 }
      );
    }

    // Delete listing (cascade will handle related records)
    await prisma.listing.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting listing:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}

