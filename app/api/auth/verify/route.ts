import { authService } from "@/lib/services/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid token provided",
          code: "NO_TOKEN",
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token using auth service
    const verificationResult = await authService.verifyToken(token);

    if (!verificationResult.valid || !verificationResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid or expired token",
          code: "INVALID_TOKEN",
        },
        { status: 401 }
      );
    }

    // Return user data if token is valid
    return NextResponse.json(
      {
        success: true,
        user: {
          id: verificationResult.user.id,
          email: verificationResult.user.email,
          firstName: verificationResult.user.firstName,
          lastName: verificationResult.user.lastName,
          phone: verificationResult.user.phone,
          role: verificationResult.user.role,
          emailVerified: verificationResult.user.emailVerified,
          phoneVerified: verificationResult.user.phoneVerified,
          avatar: verificationResult.user.avatar,
          bio: verificationResult.user.bio,
          location: verificationResult.user.location,
          website: verificationResult.user.website,
          socialLinks: verificationResult.user.socialLinks,
          jobTitle: verificationResult.user.jobTitle,
          company: verificationResult.user.company,
          skills: verificationResult.user.skills,
          languages: verificationResult.user.languages,
          address: verificationResult.user.address,
          city: verificationResult.user.city,
          country: verificationResult.user.country,
          zipCode: verificationResult.user.zipCode,
          isProfilePublic: verificationResult.user.isProfilePublic,
          showEmail: verificationResult.user.showEmail,
          showPhone: verificationResult.user.showPhone,
          showLocation: verificationResult.user.showLocation,
          allowMessages: verificationResult.user.allowMessages,
          isVerified: verificationResult.user.isVerified,
          verificationBadge: verificationResult.user.verificationBadge,
          verificationDate: verificationResult.user.verificationDate,
          businessType: verificationResult.user.businessType,
          workingDays: verificationResult.user.workingDays,
          isWorking: verificationResult.user.isWorking,
          onboardingComplete:
            (verificationResult.user as any).onboardingComplete ?? true,
          createdAt: verificationResult.user.createdAt,
          updatedAt: verificationResult.user.updatedAt,
          subAdminPermissions: verificationResult.user.subAdminPermissions,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Token verification error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
 