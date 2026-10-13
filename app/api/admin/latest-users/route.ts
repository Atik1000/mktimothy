import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Get latest 10 approved users ordered by creation date (most recent first)
    const latestUsers = await prisma.user.findMany({
      where: {
        approvalStatus: "APPROVED", // Only show approved users
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        createdAt: true,
        approvalStatus: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    // Format the data to match the component's expected structure
    const formattedUsers = latestUsers.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      image: user.avatar || "/images/default-user-icon.png", // Default user icon for users without profile image
      createdAt: user.createdAt,
    }));

    const response = NextResponse.json(formattedUsers);
    
    // Prevent caching of latest users data
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    console.error("Error fetching latest users:", error);
    return NextResponse.json(
      { error: "Failed to fetch latest users" },
      { status: 500 }
    );
  }
}
