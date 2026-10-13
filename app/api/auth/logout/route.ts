import {
  corsMiddleware,
  extractTokenFromRequest,
  securityHeadersMiddleware,
} from "@/lib/middleware/auth";
import { authService } from "@/lib/services/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Handle CORS
    const corsResponse = corsMiddleware(request);
    if (corsResponse) return corsResponse;

    // Extract token
    const token = extractTokenFromRequest(request);

    if (token) {
      // Logout user (invalidate session)
      await authService.logout(token);
    }

    // Prepare response
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );

    // Clear auth cookies
    response.cookies.delete("auth-token");
    response.cookies.delete("refresh-token");

    // Add security headers
    const securityHeaders = securityHeadersMiddleware();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error("Logout API error:", error);

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
