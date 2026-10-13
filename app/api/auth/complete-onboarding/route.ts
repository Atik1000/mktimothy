import { authService } from "@/lib/services/auth";
import { dbHelpers } from "@/lib/config/database";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/complete-onboarding
 *
 * Called by the `/onboarding` screen after a brand-new social-login user
 * fills in the required profile fields (phone, country, city, role).
 * Requires a valid Bearer token. Writes the fields, marks
 * `onboardingComplete = true`, and returns the updated user so the client
 * can update its auth context and redirect home.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "No valid token provided", code: "NO_TOKEN" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const verification = await authService.verifyToken(token);
    if (!verification.valid || !verification.user) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token", code: "INVALID_TOKEN" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const country = typeof body.country === "string" ? body.country.trim() : "";
    const city = typeof body.city === "string" ? body.city.trim() : "";
    const role = typeof body.role === "string" ? body.role : "";

    if (!phone || !country || !city || !role) {
      return NextResponse.json(
        {
          success: false,
          error: "Phone, country, city, and role are all required.",
          code: "MISSING_FIELDS",
        },
        { status: 400 }
      );
    }

    const allowedRoles = ["USER", "INVESTOR", "ENTREPRENEUR"];
    const normalizedRole = role.toUpperCase();
    if (!allowedRoles.includes(normalizedRole)) {
      return NextResponse.json(
        { success: false, error: "Invalid role.", code: "INVALID_ROLE" },
        { status: 400 }
      );
    }

    // Enforce phone uniqueness (schema has @unique on phone).
    if (phone) {
      const existing = await dbHelpers.getUserByPhone(phone);
      if (existing && existing.id !== verification.user.id) {
        return NextResponse.json(
          {
            success: false,
            error: "That phone number is already in use.",
            code: "PHONE_TAKEN",
          },
          { status: 409 }
        );
      }
    }

    const updated = await dbHelpers.updateUser(verification.user.id, {
      phone,
      country,
      city,
      // ENTREPRENEUR isn't a UserRole enum value; store as USER + a flag.
      role: normalizedRole === "ENTREPRENEUR" ? "USER" : (normalizedRole as any),
      // The user may now verify the phone via the existing OTP flow later.
      phoneVerified: false,
      onboardingComplete: true,
      // Persist the chosen account type for entrepreneurs on a free-text
      // field that already exists on the User model.
      ...(normalizedRole === "ENTREPRENEUR"
        ? { businessType: "Entrepreneur" }
        : {}),
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        firstName: updated.firstName,
        lastName: updated.lastName,
        phone: updated.phone,
        role: updated.role,
        country: updated.country,
        city: updated.city,
        emailVerified: updated.emailVerified,
        phoneVerified: updated.phoneVerified,
        onboardingComplete: true,
      },
      message: "Onboarding complete.",
    });
  } catch (error) {
    console.error("Complete onboarding error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
