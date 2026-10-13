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
      role: "USER",
      skipVerificationEmail: true,
      markEmailVerified: true
    });

    if (!registerResult.success) {
      return NextResponse.json(
        { success: false, error: registerResult.error },
        { status: 400 }
      );
    }

    // Get the newly created user to attach the Pitch Idea
    const dbUser = await dbHelpers.getUserByEmail(user.email);
    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "Failed to retrieve registered user" },
        { status: 500 }
      );
    }

    // Map the questions array to the PitchIdea fields
    const getAnswer = (qNum: number) => questions.find((q: any) => q.number === qNum)?.answer || null;

    await prisma.pitchIdea.create({
      data: {
        userId: dbUser.id,
        businessStage: getAnswer(1),
        fundingStatus: getAnswer(2),
        investorType: getAnswer(3),
        experience: getAnswer(4),
        timeToFunding: getAnswer(5),
        // Additional questions can be mapped here as needed
      }
    });

    // Send welcome email with the generated password
    await emailService.sendPitchIdeaAccountCreatedEmail(
      user.email,
      firstName,
      generatedPassword
    );

    return NextResponse.json({
      success: true,
      message: "Pitch Idea submitted and account created successfully",
    });
  } catch (error) {
    console.error("Pitch Idea Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
