import { prisma } from "@/lib/utils/prisma";
import {
  generateFilePath,
  getPublicUrl,
  STORAGE_FOLDERS,
  uploadFile,
} from "@/lib/utils/minio";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      );
    }

    // Verify and decode token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (jwtError: any) {
      console.error("JWT verification error:", jwtError.message);
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token payload" },
        { status: 401 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const verificationType = formData.get("verificationType") as string;
    const reason = formData.get("reason") as string;
    const documentFiles = formData.getAll("documents") as File[];

    // Validate verification type
    const validTypes = ["BLUE", "GREEN", "GOLD"];
    if (!validTypes.includes(verificationType)) {
      return NextResponse.json(
        { success: false, error: "Invalid verification type" },
        { status: 400 }
      );
    }

    // Validate reason
    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          error: "Please provide a detailed reason (minimum 10 characters)",
        },
        { status: 400 }
      );
    }

    // Validate documents
    if (!documentFiles || documentFiles.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload at least one supporting document",
        },
        { status: 400 }
      );
    }

    // Check if user already has a pending verification request
    const existingRequest = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isVerified: true,
        verificationBadge: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!existingRequest) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    if (
      existingRequest.isVerified &&
      existingRequest.verificationBadge === verificationType
    ) {
      return NextResponse.json(
        { success: false, error: "Already verified with this badge type" },
        { status: 400 }
      );
    }

    // Upload documents to Supabase Storage
    const documentUrls: string[] = [];
    const timestamp = Date.now();

    for (let i = 0; i < documentFiles.length; i++) {
      const file = documentFiles[i];

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Invalid file type. Only PNG, JPG, and PDF files are allowed.",
          },
          { status: 400 }
        );
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            error: "File size too large. Maximum 10MB per file.",
          },
          { status: 400 }
        );
      }

      // Generate unique file path in verification-documents folder with subfolder
      const filePath = generateFilePath(
        userId,
        file.name,
        STORAGE_FOLDERS.VERIFICATION_DOCS,
        `${verificationType.toLowerCase()}_${timestamp}`
      );

      // Convert File to Buffer for MinIO upload
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to MinIO Storage
      await uploadFile(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

      // Get public URL
      const documentUrl = getPublicUrl(filePath);
      documentUrls.push(documentUrl);
    }

    // Create verification request in activity log
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: "VERIFICATION_REQUEST",
        description: `User requested ${verificationType} verification`,
        data: {
          verificationType,
          documents: documentUrls,
          reason,
          status: "PENDING",
          submittedAt: new Date(),
        },
      },
    });

    // Send notification to admins
    await prisma.notification.create({
      data: {
        title: "New Verification Request",
        message: `${existingRequest.firstName} ${existingRequest.lastName} (${existingRequest.email}) requested ${verificationType} verification`,
        type: "SYSTEM",
        priority: "HIGH",
        isGlobal: false,
        data: {
          userId,
          verificationType,
          userEmail: existingRequest.email,
          userName: `${existingRequest.firstName} ${existingRequest.lastName}`,
          documents: documentUrls,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Verification request submitted successfully. You will be notified once reviewed.",
      data: {
        verificationType,
        status: "PENDING",
        submittedAt: new Date(),
        documentsUploaded: documentUrls.length,
      },
    });
  } catch (error) {
    console.error("Verification request error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit verification request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      );
    }

    // Verify and decode token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Get user's verification status and history
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        isVerified: true,
        verificationBadge: true,
        verificationDate: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get verification requests from activity log
    const verificationHistory = await prisma.activityLog.findMany({
      where: {
        userId,
        action: {
          in: [
            "VERIFICATION_REQUEST",
            "VERIFICATION_APPROVED",
            "VERIFICATION_REJECTED",
          ],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      data: {
        currentStatus: {
          isVerified: user.isVerified,
          verificationBadge: user.verificationBadge,
          verificationDate: user.verificationDate,
        },
        history: verificationHistory,
      },
    });
  } catch (error) {
    console.error("Verification status fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch verification status" },
      { status: 500 }
    );
  }
}
