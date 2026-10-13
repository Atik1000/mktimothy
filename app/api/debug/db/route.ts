import { prisma } from "@/lib/utils/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const dbUrl = process.env.DATABASE_URL;

    console.log("DATABASE_URL exists:", !!dbUrl);
    console.log("DATABASE_URL starts with:", dbUrl?.substring(0, 20) + "...");

    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1 as test`;

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      envLoaded: !!dbUrl,
      dbUrlPreview: dbUrl?.substring(0, 20) + "...",
      testQuery: result,
    });
  } catch (error) {
    console.error("Database debug error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        envLoaded: !!process.env.DATABASE_URL,
        dbUrlPreview:
          process.env.DATABASE_URL?.substring(0, 20) + "..." || "Not found",
      },
      { status: 500 }
    );
  }
}
