import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      NODE_ENV: process.env.NODE_ENV,
      // Database
      DATABASE_URL: !!process.env.DATABASE_URL,
      DIRECT_URL: !!process.env.DIRECT_URL,

      // JWT
      JWT_SECRET: !!process.env.JWT_SECRET,
      JWT_REFRESH_SECRET: !!process.env.JWT_REFRESH_SECRET,

      // Email/SMTP
      SMTP_HOST: process.env.SMTP_HOST || "NOT_SET",
      SMTP_PORT: process.env.SMTP_PORT || "NOT_SET",
      SMTP_USER: !!process.env.SMTP_USER,
      SMTP_PASS: !!process.env.SMTP_PASS,
      SMTP_SECURE: process.env.SMTP_SECURE || "NOT_SET",

      // Optional services
      TWILIO_ACCOUNT_SID: !!process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: !!process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: !!process.env.TWILIO_PHONE_NUMBER,

      // MinIO Storage
      MINIO_ENDPOINT: process.env.MINIO_ENDPOINT || "NOT_SET",
      MINIO_PORT: process.env.MINIO_PORT || "NOT_SET",
      MINIO_ACCESS_KEY: !!process.env.MINIO_ACCESS_KEY,
      MINIO_SECRET_KEY: !!process.env.MINIO_SECRET_KEY,
    };

    const criticalMissing = [];

    if (!envCheck.DATABASE_URL) criticalMissing.push("DATABASE_URL");
    if (!envCheck.JWT_SECRET) criticalMissing.push("JWT_SECRET");
    if (!envCheck.SMTP_USER) criticalMissing.push("SMTP_USER");
    if (!envCheck.SMTP_PASS) criticalMissing.push("SMTP_PASS");

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: envCheck,
      criticalMissing,
      status:
        criticalMissing.length === 0
          ? "All critical env vars present"
          : "Missing critical env vars",
      recommendation:
        criticalMissing.length > 0
          ? `Please set these environment variables in your Vercel dashboard: ${criticalMissing.join(
              ", "
            )}`
          : "Environment configuration looks good",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to check environment variables",
        message: error.message,
      },
      { status: 500 }
    );
  }
}
