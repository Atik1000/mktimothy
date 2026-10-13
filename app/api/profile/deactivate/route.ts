import { prisma } from "@/lib/utils/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      );
    }

    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { password, reason } = body;

    // Get user to verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 400 }
      );
    }

    // Deactivate account
    await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    // Log the deactivation
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: "ACCOUNT_DEACTIVATED",
        description: "User deactivated their account",
        data: { reason },
      },
    });

    // Invalidate all user sessions
    await prisma.session.deleteMany({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      message: "Account deactivated successfully",
    });
  } catch (error) {
    console.error("Account deactivation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to deactivate account" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      );
    }

    // Verify and decode token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (jwtError: any) {
      console.error("JWT verification error:", jwtError.message);
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token payload" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { password, confirmDelete } = body;

    console.log(
      "Delete request for user:",
      userId,
      "confirmDelete:",
      confirmDelete
    );

    if (!confirmDelete) {
      return NextResponse.json(
        { success: false, error: "Deletion confirmation required" },
        { status: 400 }
      );
    }

    // Get user to verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log("Invalid password for user:", userId);
      return NextResponse.json(
        { success: false, error: "Invalid password" },
        { status: 400 }
      );
    }

    console.log("Starting account deletion for user:", userId);

    // Delete user data step by step to avoid transaction timeout
    try {
      console.log("Step 1: Deleting sessions and basic data...");
      await prisma.session.deleteMany({ where: { userId } });
      await prisma.otpCode.deleteMany({ where: { userId } });

      console.log("Step 2: Deleting activity logs...");
      await prisma.activityLog.deleteMany({ where: { userId } });

      console.log("Step 3: Deleting search queries...");
      await prisma.searchQuery.deleteMany({ where: { userId } });

      console.log("Step 4: Deleting user interactions...");
      await prisma.blogLike.deleteMany({ where: { userId } });
      await prisma.listingLike.deleteMany({ where: { userId } });
      await prisma.savedBlog.deleteMany({ where: { userId } });
      await prisma.savedListing.deleteMany({ where: { userId } });

      console.log("Step 5: Deleting reviews and comments...");
      await prisma.review.deleteMany({ where: { userId } });
      await prisma.comment.deleteMany({ where: { userId } });

      console.log("Step 6: Deleting user content...");
      await prisma.listing.deleteMany({ where: { userId } });
      await prisma.blog.deleteMany({ where: { authorId: userId } });

      console.log("Step 7: Deleting files...");
      await prisma.file.deleteMany({ where: { userId } });

      console.log("Step 8: Deleting support tickets...");
      await prisma.ticketMessage.deleteMany({ where: { userId } });
      await prisma.supportTicket.deleteMany({ where: { userId } });
      await prisma.supportTicket.deleteMany({
        where: { assignedTo: userId },
      });

      console.log("Step 9: Deleting optional data...");
      // Delete notification preferences if exists
      try {
        await prisma.notificationPreference.delete({ where: { userId } });
      } catch (e) {
        console.log("No notification preferences found");
      }

      // Delete subscription if exists
      try {
        const subscription = await prisma.subscription.findUnique({
          where: { userId },
        });
        if (subscription) {
          await prisma.invoice.deleteMany({
            where: { subscriptionId: subscription.id },
          });
          await prisma.subscription.delete({ where: { userId } });
        }
      } catch (e) {
        console.log("No subscription found");
      }

      console.log("Step 10: Deleting user account...");
      await prisma.user.delete({ where: { id: userId } });

      console.log("Account deletion completed successfully for user:", userId);

      return NextResponse.json({
        success: true,
        message: "Account deleted successfully",
      });
    } catch (stepError: any) {
      console.error("Account deletion step failed:", stepError);
      throw stepError;
    }
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
