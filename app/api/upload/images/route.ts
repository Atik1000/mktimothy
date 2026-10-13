import { getCurrentUser } from "@/lib/auth";
import {
  generateFilePath,
  getPublicUrl,
  STORAGE_FOLDERS,
  uploadFile,
} from "@/lib/utils/minio";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const data = await request.formData();

    // Handle both single image/video and multiple images
    let files: File[] = [];

    // Try to get files from 'images' field (multiple files)
    const imagesField = data.getAll("images") as unknown as File[];
    if (imagesField && imagesField.length > 0) {
      files = imagesField;
    } else {
      // Try to get file from 'image' field (single file)
      const imageField = data.get("image") as unknown as File;
      if (imageField) {
        files = [imageField];
      } else {
        // Try to get file from 'video' field (single file)
        const videoField = data.get("video") as unknown as File;
        if (videoField) {
          files = [videoField];
        } else {
          // Try to get file from 'document' field (single file)
          const documentField = data.get("document") as unknown as File;
          if (documentField) {
            files = [documentField];
          } else {
            // Try to get file from 'audio' field (single file)
            const audioField = data.get("audio") as unknown as File;
            if (audioField) {
              files = [audioField];
            } else {
              // Try to get file from 'sticker' field (single file)
              const stickerField = data.get("sticker") as unknown as File;
              if (stickerField) {
                files = [stickerField];
              }
            }
          }
        }
      }
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files uploaded" },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        // Validate file type and size
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const isAudio = file.type.startsWith("audio/");
        const isSticker = file.type === "image/webp"; // Stickers must be .webp format
        const isDocument = !isImage && !isVideo && !isAudio && !isSticker;

        // Check if document type is allowed
        if (isDocument) {
          const allowedDocTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain",
            "text/csv",
          ];

          if (!allowedDocTypes.includes(file.type)) {
            console.error(`Unsupported document type: ${file.type}`);
            continue;
          }
        } else if (!isImage && !isVideo && !isAudio && !isSticker) {
          console.error(`Invalid file type: ${file.type}`);
          continue;
        }

        // Check file size limits
        if (isImage && file.size > 5 * 1024 * 1024) {
          // 5MB for images
          console.error(`Image file too large: ${file.size} bytes`);
          continue;
        }

        if (isVideo && file.size > 16 * 1024 * 1024) {
          // 16MB for videos
          console.error(`Video file too large: ${file.size} bytes`);
          continue;
        }

        if (isAudio && file.size > 16 * 1024 * 1024) {
          // 16MB for audio files
          console.error(`Audio file too large: ${file.size} bytes`);
          continue;
        }

        if (isSticker && file.size > 500 * 1024) {
          // 500KB for stickers
          console.error(`Sticker file too large: ${file.size} bytes`);
          continue;
        }

        if (isDocument && file.size > 50 * 1024 * 1024) {
          // 50MB for documents
          console.error(`Document file too large: ${file.size} bytes`);
          continue;
        }

        // Validate video format
        if (isVideo) {
          const allowedVideoTypes = [
            "video/mp4",
            "video/3gpp",
            "video/quicktime",
          ];
          if (!allowedVideoTypes.includes(file.type)) {
            console.error(`Unsupported video format: ${file.type}`);
            continue;
          }
        }

        // Generate unique filename using utility function
        const filename = generateFilePath(
          user.id,
          file.name,
          STORAGE_FOLDERS.LISTINGS
        );

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to MinIO storage using utility function
        await uploadFile(filename, buffer, {
          contentType: file.type,
          cacheControl: "3600",
        });

        // Get public URL using utility function
        const publicUrl = getPublicUrl(filename);

        if (publicUrl) {
          uploadedUrls.push(publicUrl);
        }
      } catch (error) {
        console.error("MinIO upload error:", error);
        continue; // Skip this file and continue with others
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json(
        { success: false, error: "Failed to upload any files" },
        { status: 500 }
      );
    }

    // For single image upload (from chat), return the URL directly
    // For multiple images, return the array
    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0], // For backward compatibility with single image uploads
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload files" },
      { status: 500 }
    );
  }
}
