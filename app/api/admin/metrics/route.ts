import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Get total user count
    const totalUsers = await prisma.user.count({
      where: {
        approvalStatus: "APPROVED",
      },
    });

    // Get total listings count
    const totalListings = await prisma.listing.count({
      where: {
        approvalStatus: "APPROVED",
      },
    });

    // Get total admin count (users with ADMIN or MODERATOR role)
    const totalAdmins = await prisma.user.count({
      where: {
        role: {
          in: ["ADMIN", "MODERATOR"],
        },
      },
    });

    const response = NextResponse.json({
      users: totalUsers,
      listings: totalListings,
      admins: totalAdmins,
    });
    
    // Prevent caching of metrics data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}

