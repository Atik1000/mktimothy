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

    // Rate limiting (stricter for resend)
    const rateLimitResponse = rateLimitMiddleware(request, authRateLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    // Parse request body
    const body = await request.json();
    const { userId, type = "EMAIL_VERIFICATION" } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
          code: "MISSING_FIELDS",
        },
        { status: 400 }
      );
    }

    // Validate type
    if (!["EMAIL_VERIFICATION", "PHONE_VERIFICATION"].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid verification type",
          code: "INVALID_TYPE",
        },
        { status: 400 }
      );
    }

    // Send verification code
    const result = await authService.sendVerificationCode(userId, type);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: "SEND_FAILED",
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
    console.error("Resend verification API error:", error);

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
