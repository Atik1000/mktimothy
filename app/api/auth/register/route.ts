import {
  authRateLimiter,
  corsMiddleware,
  getDeviceFingerprint,
  rateLimitMiddleware,
  securityHeadersMiddleware,
} from "@/lib/middleware/auth";
import { authService, type RegisterData } from "@/lib/services/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Debug logging
    console.log("Registration attempt started", {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      hasDatabase: !!process.env.DATABASE_URL,
      hasJWT: !!process.env.JWT_SECRET,
      hasSMTP: !!process.env.SMTP_USER && !!process.env.SMTP_PASS,
    });

    // Handle CORS
    const corsResponse = corsMiddleware(request);
    if (corsResponse) return corsResponse;

    // Rate limiting
    const rateLimitResponse = rateLimitMiddleware(request, authRateLimiter);
    if (rateLimitResponse) return rateLimitResponse;

    // Parse request body
    const body = await request.json();
    const { email, phone, firstName, lastName, password, confirmPassword, role } =
      body;

    // Validate required fields
    if (!email || !firstName || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          code: "MISSING_FIELDS",
        },
        { status: 400 }
      );
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Passwords do not match",
          code: "PASSWORD_MISMATCH",
        },
        { status: 400 }
      );
    }

    // Prepare registration data
    const registrationData: RegisterData = {
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      firstName: firstName.trim(),
      lastName: lastName ? lastName.trim() : "",
      password,
      role: role || "USER", // Pass the role from the request (e.g. INVESTOR)
    };

    // Get device info for security logging
    const deviceInfo = getDeviceFingerprint(request);

    // Register user
    console.log("Calling authService.register with data:", {
      email: registrationData.email,
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      hasPassword: !!registrationData.password,
      hasPhone: !!registrationData.phone,
    });

    const result = await authService.register(registrationData);

    console.log("Registration result:", {
      success: result.success,
      error: result.error,
      hasUser: !!result.user,
      userId: result.user?.id,
    });

    if (!result.success) {
      console.error("Registration failed:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          code: "REGISTRATION_FAILED",
        },
        { status: 400 }
      );
    }

    // Log successful registration (without sensitive data)
    console.log("User registered successfully:", {
      userId: result.user?.id,
      email: result.user?.email,
      deviceInfo,
    });

    // Return success response
    const response = NextResponse.json(
      {
        success: true,
        message: result.message,
        user: {
          id: result.user?.id,
          email: result.user?.email,
          firstName: result.user?.firstName,
          lastName: result.user?.lastName,
          emailVerified: result.user?.emailVerified,
          phoneVerified: result.user?.phoneVerified,
        },
        requiresVerification: result.requiresVerification,
      },
      { status: 201 }
    );

    // Add security headers
    const securityHeaders = securityHeadersMiddleware();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error("Registration API error:", error);

    // In development, provide more detailed error information
    const isDevelopment = process.env.NODE_ENV === "development";

    return NextResponse.json(
      {
        success: false,
        error: isDevelopment
          ? (error as Error).message
          : "Internal server error",
        code: "INTERNAL_ERROR",
        ...(isDevelopment && {
          stack: (error as Error).stack,
          timestamp: new Date().toISOString(),
        }),
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return corsMiddleware(request) || new NextResponse(null, { status: 200 });
}
