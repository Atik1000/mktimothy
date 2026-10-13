import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { authService } from "@/lib/services/auth";

// POST /api/listings/[id]/like - Like/Unlike listing
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const { valid, user } = await authService.verifyToken(token);
    
    if (!valid || !user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: params.id },
    });

    if (!listing) {
      return NextResponse.json(
        { success: false, error: "Listing not found" },
        { status: 404 }
      );
    }

    // Check if user already liked the listing
    const existingLike = await prisma.listingLike.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: params.id,
        },
      },
    });

    if (existingLike) {
      // Unlike - remove the like
      await prisma.listingLike.delete({
        where: {
          userId_listingId: {
            userId: user.id,
            listingId: params.id,
          },
        },
      });

      // Decrement like count
      await prisma.listing.update({
        where: { id: params.id },
        data: { likeCount: { decrement: 1 } },
      });

      return NextResponse.json({
        success: true,
        message: "Listing unliked",
        isLiked: false,
      });
    } else {
      // Like - add the like
      await prisma.listingLike.create({
        data: {
          userId: user.id,
          listingId: params.id,
        },
      });

      // Increment like count
      await prisma.listing.update({
        where: { id: params.id },
        data: { likeCount: { increment: 1 } },
      });

      return NextResponse.json({
        success: true,
        message: "Listing liked",
        isLiked: true,
      });
    }
  } catch (error) {
    console.error("Error toggling listing like:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}

