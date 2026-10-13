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
    const { email, code, newPassword, confirmPassword } = body;

    // Validate required fields
    if (!email || !code || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Email, code, and new password are required",
          code: "MISSING_FIELDS",
        },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Passwords do not match",
          code: "PASSWORD_MISMATCH",
        },
        { status: 400 }
      );
    }

    // Reset password
    const result = await authService.resetPassword(
      email.toLowerCase().trim(),
      code.trim(),
      newPassword
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: "RESET_FAILED",
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
    console.error("Reset password API error:", error);

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
