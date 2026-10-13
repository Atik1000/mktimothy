import { auth } from "@/lib/auth";
import {
  initiateMultipart,
  MULTIPART_PART_SIZE,
  MULTIPART_THRESHOLD,
  presignPartPut,
  presignUpload,
  RECORDINGS_BUCKET,
} from "@/lib/storage/minio";
import {
  RECORDINGS_MAX_TOTAL_BYTES,
  RECORDINGS_UPLOAD_HEADROOM,
  enforceRecordingsQuota,
  totalRecordingsBytes,
} from "@/lib/storage/recordings-quota";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/calls/recordings/presign
 * Body: { sessionId, mimeType, callType }
 *
 * Step 1 of the auto-recording upload: returns a presigned PUT URL the
 * browser uses to upload the recording DIRECTLY to MinIO (big blobs never
 * touch Vercel). Followed by POST /api/calls/recordings/complete.
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await auth(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const sessionId = String(body?.sessionId ?? "");
    const mimeType = String(body?.mimeType ?? "video/webm");
    const sizeBytes = Number(body?.sizeBytes ?? 0) || 0;
    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    const key = `recordings/${sessionId}/${Date.now()}-${currentUser.id}.webm`;

    // Quota subsystem — BEST-EFFORT, never allowed to kill a presign: any
    // failure here logs and is skipped (fail-open), upload proceeds.
    let total = 0;
    try {
      await enforceRecordingsQuota(RECORDINGS_UPLOAD_HEADROOM);
      total = await totalRecordingsBytes();
    } catch (quotaErr) {
      console.error("[recordings/presign] quota check failed (fail-open):", quotaErr);
    }

    // Hard safety valve — only reachable if eviction physically can't free
    // enough (e.g. a single file larger than the whole cap).
    if (total >= RECORDINGS_MAX_TOTAL_BYTES) {
      return NextResponse.json(
        {
          error: `Recording storage is full (${(
            RECORDINGS_MAX_TOTAL_BYTES / 1024 ** 3
          ).toFixed(0)}GB cap). Oldest recordings must be removed first.`,
        },
        { status: 507 }
      );
    }

    // Large recording → multipart: Cloudflare caps a single proxied request
    // body at 100MB (verified — a 101MB PUT gets 413), so the client PUTs
    // 64MB parts and the parts are stitched on complete.
    if (sizeBytes >= MULTIPART_THRESHOLD) {
      const uploadId = await initiateMultipart(key, mimeType);
      if (!uploadId) {
        return NextResponse.json(
          { error: "Storage not configured" },
          { status: 503 }
        );
      }
      const partCount = Math.ceil(sizeBytes / MULTIPART_PART_SIZE);
      const urls: string[] = [];
      for (let n = 1; n <= partCount; n++) {
        const u = await presignPartPut(key, uploadId, n);
        if (!u) {
          return NextResponse.json(
            { error: "Failed to presign part " + n },
            { status: 500 }
          );
        }
        urls.push(u);
      }
      return NextResponse.json({
        success: true,
        mode: "multipart",
        key,
        uploadId,
        partSize: MULTIPART_PART_SIZE,
        urls,
      });
    }

    const url = await presignUpload(key, mimeType);
    if (!url) {
      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      mode: "single",
      uploadUrl: url,
      key,
      bucket: RECORDINGS_BUCKET,
    });
  } catch (error) {
    console.error("[recordings/presign] error:", error);
    return NextResponse.json({ error: "Presign failed" }, { status: 500 });
  }
}
