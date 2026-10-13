
import { NextResponse } from "next/server";

import { prisma } from "@/lib/utils/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeListingCount = searchParams.get("includeListingCount") === "true";

    const sectors = await prisma.sector.findMany({
      orderBy: { sortOrder: "asc" },
      include: includeListingCount
        ? {
            _count: {
              select: { listings: true },
            },
          }
        : undefined,
    });
    return NextResponse.json({ success: true, data: sectors });
  } catch (error) {
    console.error("Error fetching sectors:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sectors" },
      { status: 500 }
    );
  }
}
