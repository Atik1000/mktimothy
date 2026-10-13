import { NextRequest, NextResponse } from "next/server";


import { prisma } from "@/lib/utils/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { success: false, error: "Phone number and code are required" },
        { status: 400 }
      );
    }

    // Find the latest valid OTP for this phone
    const validOtp = await prisma.preRegisterOtp.findFirst({
      where: {
        phone,
        code,
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (validOtp) {
      // Mark as used
      await prisma.preRegisterOtp.update({
        where: { id: validOtp.id },
        data: { used: true }
      });

      return NextResponse.json({
        success: true,
        message: "Phone verified successfully",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid or expired verification code" },
      { status: 400 }
    );
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
