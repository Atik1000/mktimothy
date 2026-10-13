import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { objectExists } from "@/lib/storage/minio";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/calls/recordings
 * Admin-only list of call recordings (newest first).
 *
 * Self-healing: rows whose underlying object no longer exists in storage
 * (e.g. the bucket was cleared directly in the MinIO console) are pruned —
 * the DB is only the index; storage is the source of truth.
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await auth(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    if (currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const recordings = await prisma.callRecording.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      include: {
        session: {
          include: {
            schedule: {
              include: {
                caller: {
                  select: { id: true, firstName: true, lastName: true },
                },
                callee: {
                  select: { id: true, firstName: true, lastName: true },
                },
              },
            },
          },
        },
        recordedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    // Verify stored objects still exist; prune rows whose file is gone.
    const missingIds: string[] = [];
    await Promise.all(
      recordings
        .filter((r) => r.storageKey)
        .map(async (r) => {
          if (!(await objectExists(r.storageKey as string))) {
            missingIds.push(r.id);
          }
        })
    );
    let list = recordings;
    if (missingIds.length > 0) {
      console.log(
        `[recordings] pruning ${missingIds.length} row(s) whose object was removed from storage`
      );
      await prisma.callRecording
        .deleteMany({ where: { id: { in: missingIds } } })
        .catch(() => {});
      const gone = new Set(missingIds);
      list = recordings.filter((r) => !gone.has(r.id));
    }

    return NextResponse.json({ success: true, recordings: list });
  } catch (error) {
    console.error("[calls/recordings] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load recordings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/calls/recordings  (multipart/form-data)
 * Admin-only. Saves metadata about a recording. The audio file itself is
 * downloaded to the admin's local machine by the CallView component; this
 * route records the metadata (duration, size, filename) for the library.
 *
 * Fields: sessionId, recordedById (defaults to caller), durationSec, fileSize,
 *         localFilename, mimeType
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
    if (currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Admin only" }, { status: 403 });
    }

    const form = await request.formData();
    const sessionId = String(form.get("sessionId") || "");
    const durationSec = Number(form.get("durationSec")) || null;
    const fileSize = Number(form.get("fileSize")) || null;
    const localFilename = String(form.get("localFilename") || "");
    const mimeType = String(form.get("mimeType") || "audio/webm");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const session = await prisma.callSession.findUnique({
      where: { id: sessionId },
      select: { id: true },
    });
    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    const recording = await prisma.callRecording.create({
      data: {
        sessionId,
        recordedById: currentUser.id,
        mimeType,
        durationSec,
        fileSize,
        localFilename: localFilename || null,
      },
    });

    return NextResponse.json({ success: true, recording });
  } catch (error) {
    console.error("[calls/recordings] POST error:", error);
    return NextResponse.json(
      { error: "Failed to save recording" },
      { status: 500 }
    );
  }
}
