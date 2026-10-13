import { prisma } from "@/lib/utils/prisma";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header or cookies
    const authHeader = request.headers.get("authorization");
    let token = authHeader?.replace("Bearer ", "");

    // If no authorization header, try to get from cookies
    if (!token) {
      const cookies = request.headers.get("cookie");
      if (cookies) {
        const tokenMatch = cookies.match(/auth-token=([^;]+)/);
        token = tokenMatch ? tokenMatch[1] : undefined;
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      );
    }

    // Clean token (remove any extra whitespace or quotes)
    token = token.trim().replace(/^["']|["']$/g, "");

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
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

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        socialLinks: true,
        jobTitle: true,
        company: true,
        skills: true,
        languages: true,
        address: true,
        city: true,
        country: true,
        zipCode: true,
        isProfilePublic: true,
        showEmail: true,
        showPhone: true,
        showLocation: true,
        allowMessages: true,
        isVerified: true,
        verificationBadge: true,
        verificationDate: true,
        businessType: true,
        workingDays: true,
        isWorking: true,
        emailVerified: true,
        phoneVerified: true,
        role: true,
        approvalStatus: true,
        approvedAt: true,
        approvedBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Extract token from Authorization header or cookies
    const authHeader = request.headers.get("authorization");
    let token = authHeader?.replace("Bearer ", "");

    // If no authorization header, try to get from cookies
    if (!token) {
      const cookies = request.headers.get("cookie");
      if (cookies) {
        const tokenMatch = cookies.match(/auth-token=([^;]+)/);
        token = tokenMatch ? tokenMatch[1] : undefined;
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      );
    }

    // Clean token (remove any extra whitespace or quotes)
    token = token.trim().replace(/^["']|["']$/g, "");

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
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

    // Get the existing user to check approval status
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        approvalStatus: true,
        firstName: true,
        lastName: true,
        bio: true,
        location: true,
        website: true,
        jobTitle: true,
        company: true,
        skills: true,
        languages: true,
        businessType: true,
        address: true,
        city: true,
        country: true,
        zipCode: true,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      bio,
      location,
      website,
      socialLinks,
      jobTitle,
      company,
      skills,
      languages,
      businessType,
      workingDays,
      address,
      city,
      country,
      zipCode,
      isProfilePublic,
      showEmail,
      showPhone,
      showLocation,
      allowMessages,
    } = body;

    // Determine if we need to reset approval status to PENDING
    // This happens when:
    // 1. A rejected user is updating their profile
    // 2. Profile content is being modified (any significant profile field)
    const shouldResetApprovalStatus =
      existingUser.approvalStatus === "REJECTED" &&
      (firstName !== undefined ||
        lastName !== undefined ||
        bio !== undefined ||
        location !== undefined ||
        website !== undefined ||
        jobTitle !== undefined ||
        company !== undefined ||
        businessType !== undefined ||
        address !== undefined ||
        city !== undefined ||
        country !== undefined ||
        zipCode !== undefined ||
        skills !== undefined ||
        languages !== undefined);

    console.log("Profile update attempt:", {
      userId,
      shouldResetApprovalStatus,
      currentApprovalStatus: existingUser.approvalStatus,
    });

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone !== undefined && { phone: phone || null }),
        ...(bio !== undefined && { bio: bio || null }),
        ...(location !== undefined && { location: location || null }),
        ...(website !== undefined && { website: website || null }),
        ...(socialLinks !== undefined && { socialLinks }),
        ...(jobTitle !== undefined && { jobTitle: jobTitle || null }),
        ...(company !== undefined && { company: company || null }),
        ...(skills !== undefined && { skills }),
        ...(languages !== undefined && { languages }),
        ...(businessType !== undefined && {
          businessType: businessType || null,
        }),
        ...(workingDays !== undefined && {
          workingDays: workingDays || null,
          isWorking:
            workingDays && Array.isArray(workingDays)
              ? (() => {
                  const today = new Date();
                  const dayNames = [
                    "Sun",
                    "Mon",
                    "Tue",
                    "Wed",
                    "Thu",
                    "Fri",
                    "Sat",
                  ];
                  const currentDay = dayNames[today.getDay()];
                  return workingDays.includes(currentDay);
                })()
              : false,
        }),
        ...(address !== undefined && { address: address || null }),
        ...(city !== undefined && { city: city || null }),
        ...(country !== undefined && { country: country || null }),
        ...(zipCode !== undefined && { zipCode: zipCode || null }),
        ...(isProfilePublic !== undefined && { isProfilePublic }),
        ...(showEmail !== undefined && { showEmail }),
        ...(showPhone !== undefined && { showPhone }),
        ...(showLocation !== undefined && { showLocation }),
        ...(allowMessages !== undefined && { allowMessages }),
        // Reset approval status to PENDING if user was rejected and profile content is being updated
        ...(shouldResetApprovalStatus && {
          approvalStatus: "PENDING",
          approvedAt: null,
          approvedBy: null,
        }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        avatar: true,
        bio: true,
        location: true,
        website: true,
        socialLinks: true,
        jobTitle: true,
        company: true,
        skills: true,
        languages: true,
        address: true,
        city: true,
        country: true,
        zipCode: true,
        isProfilePublic: true,
        showEmail: true,
        showPhone: true,
        showLocation: true,
        allowMessages: true,
        isVerified: true,
        verificationBadge: true,
        verificationDate: true,
        businessType: true,
        workingDays: true,
        isWorking: true,
        emailVerified: true,
        phoneVerified: true,
        role: true,
        approvalStatus: true,
        approvedAt: true,
        approvedBy: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { user: updatedUser },
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

