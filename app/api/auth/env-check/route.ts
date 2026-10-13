import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),

      // Critical environment variables
      DATABASE_URL: !!process.env.DATABASE_URL,
      JWT_SECRET: !!process.env.JWT_SECRET,

      // Email configuration
      SMTP_HOST: process.env.SMTP_HOST || "NOT_SET",
      SMTP_PORT: process.env.SMTP_PORT || "NOT_SET",
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      SMTP_SECURE: process.env.SMTP_SECURE || "NOT_SET",
    };

    const criticalMissing = [];

    if (!envCheck.DATABASE_URL) criticalMissing.push("DATABASE_URL");
    if (!envCheck.JWT_SECRET) criticalMissing.push("JWT_SECRET");
    if (!envCheck.SMTP_USER) criticalMissing.push("SMTP_USER");
    if (!envCheck.SMTP_PASS) criticalMissing.push("SMTP_PASS");

    return NextResponse.json({
      environment: envCheck,
      criticalMissing,
      status: criticalMissing.length === 0 ? "OK" : "MISSING_CRITICAL_VARS",
      message:
        criticalMissing.length === 0
          ? "All critical environment variables are set"
          : `Missing: ${criticalMissing.join(", ")}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to check environment variables",
        message: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
