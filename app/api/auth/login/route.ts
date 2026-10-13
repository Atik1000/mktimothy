import {
  authRateLimiter,
  corsMiddleware,
  getDeviceFingerprint,
  rateLimitMiddleware,
  securityHeadersMiddleware,
} from "@/lib/middleware/auth";
import { authService, type LoginCredentials } from "@/lib/services/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Handle CORS
    const corsResponse = corsMiddleware(request);
    if (corsResponse) return corsResponse;

    // Rate limiting
    const rateLimitResponse = rateLimitMiddleware(request, authRateLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    // Parse request body
    const body = await request.json();
    const { email, phone, password, remember, twoFactorCode } = body;

    // Validate required fields
    if ((!email && !phone) || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email/phone and password are required",
          code: "MISSING_CREDENTIALS",
        },
        { status: 400 }
      );
    }

    // Prepare login credentials
    const credentials: LoginCredentials = {
      email: email?.toLowerCase().trim(),
      phone: phone?.trim(),
      password,
      remember: remember || false,
      twoFactorCode: twoFactorCode?.trim(),
    };

    // Get device info for security tracking
    const deviceInfo = {
      ...getDeviceFingerprint(request),
      location: request.geo?.city || "Unknown",
    };

    // Attempt login
    const result = await authService.login(credentials, deviceInfo);

    if (!result.success) {
      // Handle specific error cases
      if (result.requiresTwoFactor) {
        return NextResponse.json(
          {
            success: false,
            requiresTwoFactor: true,
            message: result.message,
            code: "TWO_FACTOR_REQUIRED",
          },
          { status: 200 }
        );
      }

      if (result.requiresVerification) {
        return NextResponse.json(
          {
            success: false,
            requiresVerification: true,
            message: result.error,
            code: "EMAIL_VERIFICATION_REQUIRED",
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: "LOGIN_FAILED",
        },
        { status: 401 }
      );
    }

    // Log successful login (without sensitive data)
    console.log("User logged in successfully:", {
      userId: result.user?.id,
      email: result.user?.email,
      deviceInfo: {
        userAgent: deviceInfo.userAgent,
        location: deviceInfo.location,
      },
    });

    // Prepare response
    const response = NextResponse.json(
      {
        success: true,
        message: result.message,
    // Prepare response — MUST mirror the field set returned by
    // /api/auth/verify. It previously returned a lean 12-field user, and any
    // component reading a missing field (socialLinks.x, skills, bio, ...)
    // threw a client-side exception on the first navigation after login —
    // fine again after refresh, because refresh loads the user via verify.
        user: {
          id: result.user?.id,
          email: result.user?.email,
          firstName: result.user?.firstName,
          lastName: result.user?.lastName,
          phone: result.user?.phone,
          role: result.user?.role,
          emailVerified: result.user?.emailVerified,
          phoneVerified: result.user?.phoneVerified,
          avatar: result.user?.avatar,
          bio: result.user?.bio,
          location: result.user?.location,
          website: result.user?.website,
          socialLinks: result.user?.socialLinks,
          jobTitle: result.user?.jobTitle,
          company: result.user?.company,
          skills: result.user?.skills,
          languages: result.user?.languages,
          address: result.user?.address,
          city: result.user?.city,
          country: result.user?.country,
          zipCode: result.user?.zipCode,
          isProfilePublic: result.user?.isProfilePublic,
          showEmail: result.user?.showEmail,
          showPhone: result.user?.showPhone,
          showLocation: result.user?.showLocation,
          allowMessages: result.user?.allowMessages,
          isVerified: result.user?.isVerified,
          verificationBadge: result.user?.verificationBadge,
          verificationDate: result.user?.verificationDate,
          businessType: result.user?.businessType,
          workingDays: result.user?.workingDays,
          isWorking: result.user?.isWorking,
          onboardingComplete:
            (result.user as any)?.onboardingComplete ?? true,
          createdAt: result.user?.createdAt,
          updatedAt: result.user?.updatedAt,
          subAdminPermissions: result.user?.subAdminPermissions,
        },
        token: result.token,
        refreshToken: result.refreshToken,
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookie for token if remember is true
    if (remember && result.token) {
      response.cookies.set("auth-token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    // Set refresh token cookie
    if (result.refreshToken) {
      response.cookies.set("refresh-token", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    // Add security headers
    const securityHeaders = securityHeadersMiddleware();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error("Login API error:", error);

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

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return corsMiddleware(request) || new NextResponse(null, { status: 200 });
}

