import {
  authRateLimiter,
  corsMiddleware,
  rateLimitMiddleware,
  securityHeadersMiddleware,
} from "@/lib/middleware/auth";
import { authService } from "@/lib/services/auth";
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
    const { userId, email, code } = body;

    // Validate required fields - accept either userId or email
    if ((!userId && !email) || !code) {
      return NextResponse.json(
        {
          success: false,
          error: "Email/User ID and verification code are required",
          code: "MISSING_FIELDS",
        },
        { status: 400 }
      );
    }

    // Get user ID from email if email is provided
    let actualUserId = userId;
    if (email && !userId) {
      const user = await authService.getUserByEmail(email);
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "User not found",
            code: "USER_NOT_FOUND",
          },
          { status: 404 }
        );
      }
      actualUserId = user.id;
    }

    // Verify email
    const result = await authService.verifyEmail(actualUserId, code.trim());

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: "VERIFICATION_FAILED",
        },
        { status: 400 }
      );
    }

    // Prepare response
    const response = NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );

    // Add security headers
    const securityHeaders = securityHeadersMiddleware();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error("Email verification API error:", error);

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
