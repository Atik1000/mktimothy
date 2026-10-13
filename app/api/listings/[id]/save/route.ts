import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { authService } from "@/lib/services/auth";

// POST /api/listings/[id]/save - Save/Unsave listing
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

    // Check if user already saved the listing
    const existingSave = await prisma.savedListing.findUnique({
      where: {
        userId_listingId: {
          userId: user.id,
          listingId: params.id,
        },
      },
    });

    if (existingSave) {
      // Unsave - remove the save
      await prisma.savedListing.delete({
        where: {
          userId_listingId: {
            userId: user.id,
            listingId: params.id,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Listing removed from saved items",
        isSaved: false,
      });
    } else {
      // Save - add the save
      await prisma.savedListing.create({
        data: {
          userId: user.id,
          listingId: params.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Listing saved",
        isSaved: true,
      });
    }
  } catch (error) {
    console.error("Error toggling listing save:", error);
    return NextResponse.json(
      { success: false, error: "Failed to toggle save" },
      { status: 500 }
    );
  }
}

