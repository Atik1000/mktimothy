import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/utils/prisma";
import { authService } from "@/lib/services/auth";

// PATCH /api/admin/listings/[id]/author — override display author name
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.substring(7);
    const authResult = await authService.verifyToken(token);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    if (authResult.user.role !== "ADMIN" && authResult.user.role !== "MODERATOR") {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }


    const { displayAuthorName } = await request.json();

    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: { displayAuthorName: displayAuthorName || null },
      select: { id: true, title: true, displayAuthorName: true },
    });

    return NextResponse.json({ success: true, data: listing });
  } catch (error: any) {
    if (error.code === "P2025") {
      return NextResponse.json({ success: false, error: "Listing not found" }, { status: 404 });
    }
    console.error("Listing author PATCH error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
