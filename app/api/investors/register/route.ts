import { authService } from "@/lib/services/auth";
import { emailService } from "@/lib/services/email";
import { dbHelpers } from "@/lib/config/database";
import { NextRequest, NextResponse } from "next/server";

import crypto from "crypto";

import { prisma } from "@/lib/utils/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questions, user } = body;

    if (!user || !user.email || !user.name) {
      return NextResponse.json(
        { success: false, error: "Name and email are required" },
        { status: 400 }
      );
    }

    const nameParts = user.name.trim().split(" ");
    const firstName = nameParts[0];
    let lastName = nameParts.slice(1).join(" ").trim();
    if (lastName.length < 2) {
      lastName = "";
    }
    
    // Generate a secure random password
    const generatedPassword = crypto.randomBytes(8).toString("hex") + "A1!";

    // Ensure phone number starts with + for E.164 validation
    let formattedPhone = user.phone;
    if (formattedPhone && !formattedPhone.startsWith("+")) {
      formattedPhone = "+" + formattedPhone.replace(/\D/g, "");
    }

    // Register the user
    const registerResult = await authService.register({
      email: user.email,
      phone: formattedPhone,
      firstName,
      lastName,
      password: generatedPassword,
      role: "INVESTOR",
      skipVerificationEmail: true,
      markEmailVerified: true
    });

    if (!registerResult.success) {
      return NextResponse.json(
        { success: false, error: registerResult.error },
        { status: 400 }
      );
    }

    // Get the newly created user to attach the Investor Profile
    const dbUser = await dbHelpers.getUserByEmail(user.email);
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "Failed to retrieve registered user" },
        { status: 500 }
      );
    }

    // Map the questions array to the InvestorProfile fields
    const getAnswer = (qNum: number) => questions.find((q: any) => q.number === qNum)?.answer || null;

    await prisma.investorProfile.create({
      data: {
        userId: dbUser.id,
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
      }
    });

    // Send temporary password email
    await emailService.sendAccountCreatedWithPasswordEmail(
      user.email,
      firstName,
      generatedPassword
    );

    // Send the dedicated Welcome Email
    await emailService.sendInvestorWelcomeEmail(
      user.email,
      firstName
    );

    return NextResponse.json({
      success: true,
      message: "Investor Profile submitted and account created successfully",
    });
  } catch (error) {
    console.error("Investor Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
