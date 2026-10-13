import { authService } from "@/lib/services/auth";
import { dbHelpers } from "@/lib/config/database";
import { prisma } from "@/lib/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/auth/onboarding
 *
 * Final step of the Google-first-login onboarding flow. Unlike the public
 * `/api/{investors,pitch-idea}/register` routes, this does NOT create a new
 * user (the Google user already exists). Instead it:
 *   1. Verifies the Bearer token to resolve the existing user.
 *   2. Updates the user's contact fields (phone, country/city, name, etc.).
 *   3. Upserts the matching questionnaire row (InvestorProfile or PitchIdea).
 *   4. Flips `onboardingComplete = true`.
 *
 * Request body:
 *   {
 *     flow: "investor" | "entrepreneur",
 *     user: { name?, phone, country?, city?, company?, source? },
 *     questions: [{ number: number, answer: string }]
 *   }
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
        {
          success: false,
          error: "Invalid or expired token",
          code: "INVALID_TOKEN",
        },
        { status: 401 }
      );
    }
    const userId = verification.user.id;

    const body = await request.json();
    const flow: "investor" | "entrepreneur" = body.flow === "investor"
      ? "investor"
      : "entrepreneur";
    const user = body.user || {};
    const questions: Array<{ number: number; answer: string }> =
      Array.isArray(body.questions) ? body.questions : [];

    const getAnswer = (qNum: number) =>
      questions.find((q) => q.number === qNum)?.answer || null;

    // ── Basic contact-field validation ──────────────────────────────
    const phone = typeof user.phone === "string" ? user.phone.trim() : "";
    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone is required.", code: "MISSING_FIELDS" },
        { status: 400 }
      );
    }

    // Enforce phone uniqueness across other users.
    const phoneOwner = await dbHelpers.getUserByPhone(phone);
    if (phoneOwner && phoneOwner.id !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: "That phone number is already in use.",
          code: "PHONE_TAKEN",
        },
        { status: 409 }
      );
    }

    // Split a full name into first/last for the User row.
    let firstName = verification.user.firstName;
    let lastName = verification.user.lastName;
    if (typeof user.name === "string" && user.name.trim()) {
      const parts = user.name.trim().split(/\s+/);
      firstName = parts[0];
      lastName = parts.slice(1).join(" ") || "";
    }

    // ── Update the User row with contact + profile fields ───────────
    const userUpdate: Record<string, unknown> = {
      firstName,
      lastName,
      phone,
      phoneVerified: false,
      onboardingComplete: true,
    };
    if (typeof user.country === "string" && user.country.trim()) {
      userUpdate.country = user.country.trim();
    }
    if (typeof user.city === "string" && user.city.trim()) {
      userUpdate.city = user.city.trim();
    }
    if (typeof user.company === "string" && user.company.trim()) {
      userUpdate.company = user.company.trim();
    }

    await dbHelpers.updateUser(userId, userUpdate as any);

    // ── Upsert the questionnaire row ───────────────────────────────
    if (flow === "investor") {
      await prisma.investorProfile.upsert({
        where: { userId },
        update: {
          investorType: getAnswer(1),
          investmentStage: getAnswer(2),
          checkSize: getAnswer(3),
          valueAdd: getAnswer(4),
          targetRegion: getAnswer(5),
          industries: getAnswer(6),
          revenueRange: getAnswer(7),
          employeeCount: getAnswer(8),
          businessModel: getAnswer(9),
          postInvestmentEngagement: getAnswer(10),
          businessPlanStatus: getAnswer(11),
          localPartnershipNeeds: getAnswer(12),
          launchTimeline: getAnswer(13),
          referenceCode: getAnswer(14),
        },
        create: {
          userId,
          investorType: getAnswer(1),
          investmentStage: getAnswer(2),
          checkSize: getAnswer(3),
          valueAdd: getAnswer(4),
          targetRegion: getAnswer(5),
          industries: getAnswer(6),
          revenueRange: getAnswer(7),
          employeeCount: getAnswer(8),
          businessModel: getAnswer(9),
          postInvestmentEngagement: getAnswer(10),
          businessPlanStatus: getAnswer(11),
          localPartnershipNeeds: getAnswer(12),
          launchTimeline: getAnswer(13),
          referenceCode: getAnswer(14),
        },
      });
    } else {
      // entrepreneur → PitchIdea. The pitch-idea register route only maps
      // 5 of the 8 columns; we map the full set so nothing is lost.
      await prisma.pitchIdea.upsert({
        where: { userId },
        update: {
          businessStage: getAnswer(1),
          fundingStatus: getAnswer(2),
          investorType: getAnswer(3),
          experience: getAnswer(4),
          timeToFunding: getAnswer(5),
          industries: getAnswer(6),
          businessModel: getAnswer(7),
          referenceCode: getAnswer(8),
        },
        create: {
          userId,
          businessStage: getAnswer(1),
          fundingStatus: getAnswer(2),
          investorType: getAnswer(3),
          experience: getAnswer(4),
          timeToFunding: getAnswer(5),
          industries: getAnswer(6),
          businessModel: getAnswer(7),
          referenceCode: getAnswer(8),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Onboarding complete.",
      flow,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
