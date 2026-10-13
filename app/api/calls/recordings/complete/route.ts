import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { completeMultipart } from "@/lib/storage/minio";
import { enforceRecordingsQuota } from "@/lib/storage/recordings-quota";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/calls/recordings/complete
 * Body: { sessionId, key, mimeType, callType, durationSec, sizeBytes }
 *
 * Step 2 of the auto-recording upload: after the browser PUTs the blob to
 * MinIO, this persists the CallRecording row so the recording appears in
 * the /calls/recordings list with view + download buttons.
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
    const key = String(body?.key ?? "");
    if (!sessionId || !key) {
      return NextResponse.json(
        { error: "sessionId and key required" },
        { status: 400 }
      );
    }

    // Caller/callee/admin can complete a recording for a session they can
    // see; the recorder is normally the caller.
    const session = await prisma.callSession.findUnique({
      where: { id: sessionId },
      include: { schedule: { select: { callerId: true, calleeId: true } } },
    });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    const allowed =
      session.schedule.callerId === currentUser.id ||
      session.schedule.calleeId === currentUser.id ||
      currentUser.role === "ADMIN";
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const callType = body?.callType === "AUDIO" ? "AUDIO" : "VIDEO";
    const publicUrl = process.env.MINIO_PUBLIC_URL
      ? `${process.env.MINIO_PUBLIC_URL}/${process.env.MINIO_BUCKET || "call-recordings"}/${key}`
      : null;

    // Multipart finalize: stitch the uploaded parts into the single object
    // BEFORE the row exists, so a row is only ever created for a recording
    // that is fully stored.
    if (body?.uploadId && Array.isArray(body?.parts)) {
      try {
        await completeMultipart(
          key,
          String(body.uploadId),
          body.parts.map((p: any) => ({
            part: Number(p?.part),
            etag: p?.etag ? String(p.etag) : undefined,
          }))
        );
      } catch (mpErr) {
        console.error("[recordings/complete] multipart finalize failed:", mpErr);
        return NextResponse.json(
          { error: "Failed to finalize multipart recording" },
          { status: 500 }
        );
      }
    }

    const recording = await prisma.callRecording.create({
      data: {
        sessionId,
        recordedById: currentUser.id,
        callType,
        durationSec: Number(body?.durationSec ?? 0) || null,
        mimeType: String(body?.mimeType ?? "video/webm"),
        fileSize: Number(body?.sizeBytes ?? 0) || null,
        storageKey: key,
        storageUrl: publicUrl,
      },
    });

    // Keep the recordings bucket under its cap: evict OLDEST recordings
    // (MinIO object + DB row) until the total fits again. Non-fatal — a
    // quota failure never breaks the call or the recording that just saved.
    try {
      await enforceRecordingsQuota();
    } catch (quotaErr) {
      console.error("[recordings/complete] quota enforcement failed:", quotaErr);
    }

    return NextResponse.json({ success: true, recording });
  } catch (error) {
    console.error("[recordings/complete] error:", error);
    return NextResponse.json(
      { error: "Failed to save recording" },
      { status: 500 }
    );
  }
}
