import { dbHelpers } from "@/lib/config/database";
import { prisma } from "@/lib/utils/prisma";
import { authService } from "@/lib/services/auth";
import { NextRequest, NextResponse } from "next/server";


// GET /api/users/[id] - Get specific user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify authentication
    const authResult = await authService.verifyToken(token);
    if (!authResult.valid || !authResult.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the user with related application data
    const user = await dbHelpers.getUserById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Since dbHelpers.getUserById might not include pitchIdea/investorProfile, we'll fetch them separately to be safe and merge
    const pitchIdea = await prisma.pitchIdea.findUnique({ where: { userId: id } });
    const investorProfile = await prisma.investorProfile.findUnique({ where: { userId: id } });

    if (pitchIdea) {
      (user as any).pitchIdea = pitchIdea;
    }
    if (investorProfile) {
      (user as any).investorProfile = investorProfile;
    }

    // Only show approved users (except for admins viewing any user or users viewing their own profile)
    if (
      user.approvalStatus !== "APPROVED" &&
      authResult.user.role !== "ADMIN" &&
      authResult.user.id !== id
    ) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove sensitive information
    const { password, ...userResponse } = user;

    return NextResponse.json({
      success: true,
      data: userResponse,
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

