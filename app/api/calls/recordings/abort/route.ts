import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { abortMultipart } from "@/lib/storage/minio";
import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/calls/recordings/abort
 * Body: { sessionId, key, uploadId }
 *
 * Best-effort cleanup when a multipart recording upload fails partway —
 * aborts the upload so the already-uploaded parts don't linger on disk
 * forever (incomplete multipart parts count against storage otherwise).
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
    const key = String(body?.key ?? "");
    const uploadId = String(body?.uploadId ?? "");
    if (!key || !uploadId) {
      return NextResponse.json(
        { error: "key and uploadId required" },
        { status: 400 }
      );
    }

    // Only abort uploads under the caller's own key namespace or for
    // participants of the session (keys look like
    // recordings/<sessionId>/<ts>-<userId>.webm).
    const sessionId = String(body?.sessionId ?? key.split("/")[1] ?? "");
    const session = await prisma.callSession.findUnique({
      where: { id: sessionId },
      include: { schedule: { select: { callerId: true, calleeId: true } } },
    }).catch(() => null);
    const allowed =
      key.includes(`-${currentUser.id}.webm`) ||
      session?.schedule.callerId === currentUser.id ||
      session?.schedule.calleeId === currentUser.id ||
      currentUser.role === "ADMIN";
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      await abortMultipart(key, uploadId);
    } catch (err) {
      console.warn("[recordings/abort] abort failed:", err);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[recordings/abort] error:", error);
    return NextResponse.json({ error: "Failed to abort" }, { status: 500 });
  }
}
