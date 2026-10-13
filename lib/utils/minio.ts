import * as Minio from "minio";
import { Readable } from "stream";

// Lazy initialization to avoid build-time errors
let minioClient: Minio.Client | null = null;

function getMinioClient(): Minio.Client {
  if (!minioClient) {
    const endpoint = process.env.MINIO_ENDPOINT;
    const port = process.env.MINIO_PORT;
    const accessKey = process.env.MINIO_ACCESS_KEY;
    const secretKey = process.env.MINIO_SECRET_KEY;
    const useSSL = process.env.MINIO_USE_SSL === "true";

    if (!endpoint || !accessKey || !secretKey) {
      throw new Error("Missing MinIO environment variables");
    }

    minioClient = new Minio.Client({
      endPoint: endpoint,
      port: port ? parseInt(port, 10) : 9000,
      useSSL: useSSL,
      accessKey: accessKey,
      secretKey: secretKey,
    });
  }
  return minioClient;
}

// Storage bucket name - single bucket for all files
export const STORAGE_BUCKET = "images";

// Folder structure within the bucket
export const STORAGE_FOLDERS = {
  AVATARS: "avatars",
  VERIFICATION_DOCS: "verification-documents",
  LISTINGS: "listings",
  BLOGS: "blogs",
} as const;

/**
 * Ensure the bucket exists. Creates it with public read policy if missing.
 */
async function ensureBucket(bucketName: string): Promise<void> {
  const client = getMinioClient();
  const exists = await client.bucketExists(bucketName);
  if (!exists) {
    await client.makeBucket(bucketName, "us-east-1");
    // Set a public read policy so files are publicly accessible via URL
    const policy = JSON.stringify({
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${bucketName}/*`],
        },
      ],
    });
    await client.setBucketPolicy(bucketName, policy);
  }
}

/**
 * Upload a file (Buffer or stream) to MinIO.
 * Returns an object with the path (equivalent to Supabase's data.path).
 */
export async function uploadFile(
  filePath: string,
  file: Buffer | NodeJS.ReadableStream | ReadableStream,
  options?: {
    contentType?: string;
    cacheControl?: string;
    upsert?: boolean;
  }
): Promise<{ path: string }> {
  try {
    const client = getMinioClient();
    await ensureBucket(STORAGE_BUCKET);

    const metaData: Record<string, string> = {};
    if (options?.contentType) {
      metaData["Content-Type"] = options.contentType;
    }
    if (options?.cacheControl) {
      metaData["Cache-Control"] = options.cacheControl;
    }

    if (Buffer.isBuffer(file)) {
      await client.putObject(STORAGE_BUCKET, filePath, file, file.length, metaData);
    } else {
      // Convert to a concrete Node.js Readable so MinIO's types are satisfied
      const nodeStream: Readable =
        file instanceof ReadableStream
          ? Readable.fromWeb(file as import("stream/web").ReadableStream)
          : Readable.from(file as NodeJS.ReadableStream);
      // size is unknown for streams — pass undefined so metaData lands in the correct slot
      await client.putObject(STORAGE_BUCKET, filePath, nodeStream, undefined, metaData);
    }

    return { path: filePath };
  } catch (error) {
    console.error("MinIO upload error:", error);
    throw error;
  }
}

/**
 * Delete a file from MinIO.
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    const client = getMinioClient();
    await client.removeObject(STORAGE_BUCKET, filePath);
    return true;
  } catch (error) {
    console.error("MinIO delete error:", error);
    throw error;
  }
}

/**
 * Get the public URL for a file stored in MinIO.
 * On production (HTTPS), routes through /api/image-proxy to avoid
 * browser mixed-content blocking (HTTP image on HTTPS page).
 * On localhost, returns the direct MinIO URL.
 */
export function getPublicUrl(filePath: string): string {
  const minioUrl =
    process.env.MINIO_PUBLIC_URL ||
    `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT || 9000}`;
  const directUrl = `${minioUrl}/${STORAGE_BUCKET}/${filePath}`;

  // On production, proxy through Next.js API to serve over HTTPS
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const isProduction = appUrl.startsWith("https://");
  if (isProduction) {
    return `${appUrl}/api/image-proxy?path=${encodeURIComponent(directUrl)}`;
  }

  return directUrl;
}


/**
 * Extract the MinIO object path from a full MinIO public URL.
 * e.g. "http://84.247.131.188:9000/images/avatars/user_123.jpg" -> "avatars/user_123.jpg"
 */
export function extractFilePathFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split("/");
    // pathname is like /images/avatars/file.jpg
    // find the bucket name and take everything after it
    const bucketIndex = pathParts.findIndex((p) => p === STORAGE_BUCKET);
    if (bucketIndex === -1) return null;
    return pathParts.slice(bucketIndex + 1).join("/");
  } catch {
    return null;
  }
}

/**
 * Generate a unique file path with folder structure.
 */
export function generateFilePath(
  userId: string,
  fileName: string,
  folder: string,
  subfolder?: string
): string {
  const timestamp = Date.now();
  const extension = fileName.split(".").pop();
  const uniqueName = `${userId}_${timestamp}.${extension}`;

  if (subfolder) {
    return `${folder}/${subfolder}/${uniqueName}`;
  }

  return `${folder}/${uniqueName}`;
}

