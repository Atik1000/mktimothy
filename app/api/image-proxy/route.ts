import { NextRequest, NextResponse } from "next/server";

const MINIO_PUBLIC_URL =
  process.env.MINIO_PUBLIC_URL ||
  `${process.env.MINIO_USE_SSL === "true" ? "https" : "http"}://${
    process.env.MINIO_ENDPOINT || "localhost"
  }${process.env.MINIO_USE_SSL === "true" ? "" : `:${process.env.MINIO_PORT || 9000}`}`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return NextResponse.json({ error: "Missing path parameter" }, { status: 400 });
  }

  // Build the upstream MinIO URL.
  // Old DB rows store absolute URLs against the bare-IP HTTP endpoint
  // (http://84.247.131.188:9000/...). Rewrite ANY http origin to the HTTPS
  // public URL so old and new rows fetch identically through the tunnel —
  // which is what eventually makes firewalled port 9000 safe.
  let minioUrl: string;
  if (path.startsWith("http://")) {
    const u = new URL(path);
    minioUrl = `${MINIO_PUBLIC_URL.replace(/\/+$/, "")}${u.pathname}${u.search}`;
  } else if (path.startsWith("https://")) {
    minioUrl = path;
  } else {
    // path like "avatars/user_123.jpg" → full MinIO URL
    minioUrl = `${MINIO_PUBLIC_URL}/images/${path}`;
  }

  try {
    const response = await fetch(minioUrl, { cache: "force-cache" });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // cache for 1 year
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}
