import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { objectExists, presignDownload } from "@/lib/storage/minio";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/calls/recordings/[id]/url?download=1
 *
 * Returns a presigned MinIO URL for streaming playback (?download=0) or
 * forced download (?download=1). Authorized for the session participants
 * and admins — same visibility as the recordings list.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await auth(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const recording = await prisma.callRecording.findUnique({
      where: { id: params.id },
      include: { session: { include: { schedule: { select: { callerId: true, calleeId: true } } } } },
    });
    if (!recording || !recording.storageKey) {
      return NextResponse.json({ error: "Recording not found" }, { status: 404 });
    }

    const s = recording.session;
    const allowed =
      s?.schedule.callerId === currentUser.id ||
      s?.schedule.calleeId === currentUser.id ||
      currentUser.role === "ADMIN";
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Storage is the source of truth: if the object was removed directly
    // (e.g. bucket cleared in the MinIO console), drop the stale row too.
    if (!(await objectExists(recording.storageKey))) {
      await prisma.callRecording
        .delete({ where: { id: recording.id } })
        .catch(() => {});
      return NextResponse.json(
        { error: "Recording file no longer exists in storage" },
        { status: 404 }
      );
    }

    const download = request.nextUrl.searchParams.get("download") === "1";
    const url = await presignDownload(recording.storageKey, {
      download,
      filename: `call-${recording.sessionId.slice(-6)}-${(recording.callType || "AUDIO").toLowerCase()}.webm`,
    });
    if (!url) {
      return NextResponse.json(
        { error: "Storage not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json({ success: true, url, expiresIn: 86400 });
  } catch (error) {
    console.error("[recordings/url] error:", error);
    return NextResponse.json({ error: "Failed to sign URL" }, { status: 500 });
  }
}
