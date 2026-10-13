import { prisma } from "@/lib/utils/prisma";
import {
  deleteFile,
  generateFilePath,
  getPublicUrl,
  STORAGE_FOLDERS,
  uploadFile,
} from "@/lib/utils/minio";
import { getImageDimensions } from "@/lib/utils/image-dimensions";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(request: NextRequest) {
  try {
    // Extract token from Authorization header or cookies
    const authHeader = request.headers.get("authorization");
    let token = authHeader?.replace("Bearer ", "");

    // If no authorization header, try to get from cookies
    if (!token) {
      const cookies = request.headers.get("cookie");
      if (cookies) {
        const tokenMatch = cookies.match(/auth-token=([^;]+)/);
        token = tokenMatch ? tokenMatch[1] : undefined;
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      );
    }

    // Clean token (remove any extra whitespace or quotes)
    token = token.trim().replace(/^["']|["']$/g, "");

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
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type. Only images are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "File size too large. Max 5MB allowed." },
        { status: 400 }
      );
    }

    // Read the file into a buffer once — used for both dimension validation
    // and the MinIO upload below.
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Validate that the image is square (width === height). This is the
    // authoritative guard — it blocks non-square uploads from any client.
    const dims = getImageDimensions(buffer);
    if (!dims) {
      return NextResponse.json(
        {
          success: false,
          error: "Could not read image dimensions. Please upload a valid image.",
        },
        { status: 400 }
      );
    }
    if (Math.abs(dims.width - dims.height) > 2) {
      return NextResponse.json(
        {
          success: false,
          error: `Profile photo must be square (1:1). Your image is ${dims.width}×${dims.height}px. Please crop it to a square.`,
        },
        { status: 400 }
      );
    }

    // Minimum resolution so avatars aren't blurry
    const MIN_AVATAR_SIZE = 200;
    if (dims.width < MIN_AVATAR_SIZE || dims.height < MIN_AVATAR_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `Image is too small. Minimum size is ${MIN_AVATAR_SIZE}×${MIN_AVATAR_SIZE}px (yours is ${dims.width}×${dims.height}px).`,
        },
        { status: 400 }
      );
    }

    // Get current user to check for existing avatar
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // Delete old avatar if exists
    if (currentUser?.avatar) {
      try {
        // Extract file path from the MinIO URL
        // MinIO URL format: http://host:port/images/avatars/file.jpg
        const url = new URL(currentUser.avatar);
        const pathParts = url.pathname.split("/");
        // pathname is /images/avatars/file.jpg — skip the leading "" and bucket name
        const filePathIndex = pathParts.findIndex((part) => part === "images") + 1;
        const filePath = pathParts.slice(filePathIndex).join("/");
        if (filePath) await deleteFile(filePath);
      } catch (deleteError) {
        console.warn("Failed to delete old avatar:", deleteError);
        // Continue with upload even if delete fails
      }
    }

    // Generate unique file path in avatars folder
    const filePath = generateFilePath(
      userId,
      file.name,
      STORAGE_FOLDERS.AVATARS
    );

    // Upload to MinIO Storage
    await uploadFile(filePath, buffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: true,
    });

    // Get public URL
    const avatarUrl = getPublicUrl(filePath);

    // Update user's avatar in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: avatarUrl,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        avatar: updatedUser.avatar,
        url: avatarUrl,
      },
      message: "Profile picture updated successfully",
    });
  } catch (error) {
    console.error("Avatar upload error:", error);

    // Log environment variables status (without exposing values)
    console.error("Environment check:", {
      hasMinioEndpoint: !!process.env.MINIO_ENDPOINT,
      hasMinioAccessKey: !!process.env.MINIO_ACCESS_KEY,
      hasJwtSecret: !!process.env.JWT_SECRET,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload avatar",
        // Only in development, include more details
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Extract token from Authorization header or cookies
    const authHeader = request.headers.get("authorization");
    let token = authHeader?.replace("Bearer ", "");

    // If no authorization header, try to get from cookies
    if (!token) {
      const cookies = request.headers.get("cookie");
      if (cookies) {
        const tokenMatch = cookies.match(/auth-token=([^;]+)/);
        token = tokenMatch ? tokenMatch[1] : undefined;
      }
    }

    if (!token) {
      return NextResponse.json(
        { success: false, error: "No token provided" },
        { status: 401 }
      );
    }

    // Clean token (remove any extra whitespace or quotes)
    token = token.trim().replace(/^["']|["']$/g, "");

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
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    // Get current user to find avatar file
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // Delete avatar file from MinIO Storage if exists
    if (currentUser?.avatar) {
      try {
        // Extract file path from the MinIO URL
        const url = new URL(currentUser.avatar);
        const pathParts = url.pathname.split("/");
        // pathname is /images/avatars/file.jpg
        const filePathIndex = pathParts.findIndex((part) => part === "images") + 1;
        const filePath = pathParts.slice(filePathIndex).join("/");
        if (filePath) await deleteFile(filePath);
      } catch (deleteError) {
        console.warn("Failed to delete avatar file:", deleteError);
        // Continue with database update even if file delete fails
      }
    }

    // Remove avatar from database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        avatar: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: { avatar: null },
      message: "Profile picture removed successfully",
    });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to remove avatar" },
      { status: 500 }
    );
  }
}

