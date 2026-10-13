import { prisma } from "@/lib/config/database";
import { deleteObject } from "./minio";

/**
 * Recordings storage quota — a rolling window over the call-recordings
 * bucket. After every successful upload the total is trimmed back under
 * RECORDINGS_MAX_GB (default 15) by evicting the OLDEST recordings first
 * (object deleted from MinIO, row deleted from the DB, so the recordings
 * list shrinks too). A pre-upload check also refuses new recordings if the
 * cap is somehow already exceeded (e.g. a failed eviction).
 *
 * Env: RECORDINGS_MAX_GB (default 15). Sizes come from the DB (fileSize,
 * sent by the uploader) — no S3 bucket listing needed.
 */
export const RECORDINGS_MAX_TOTAL_BYTES =
  (Number(process.env.RECORDINGS_MAX_GB) || 15) * 1024 * 1024 * 1024;

/** Room made BEFORE an upload (evict oldest until total <= cap − headroom),
 *  so a new recording lands inside the cap. Two steps: this pre-eviction
 *  frees space for the incoming file, and the post-upload trim
 *  (headroom = 0) guarantees the final state never exceeds the cap. */
export const RECORDINGS_UPLOAD_HEADROOM = 2 * 1024 * 1024 * 1024;

/** Sum of fileSize over all recordings actually stored in MinIO. */
export async function totalRecordingsBytes(): Promise<number> {
  const agg = await prisma.callRecording.aggregate({
    _sum: { fileSize: true },
    where: { storageKey: { not: null } },
  });
  return agg._sum.fileSize ?? 0;
}

/**
 * Evict oldest recordings until the stored total is <= (cap − headroom).
 * Best-effort: an object-delete failure still removes the DB row (an
 * orphaned object wastes disk but never blocks recordings).
 */
export async function enforceRecordingsQuota(
  headroomBytes = 0
): Promise<{ evicted: number; totalBytes: number }> {
  const limit = RECORDINGS_MAX_TOTAL_BYTES - headroomBytes;
  let total = await totalRecordingsBytes();
  if (total <= limit) return { evicted: 0, totalBytes: total };

  const victims = await prisma.callRecording.findMany({
    where: { storageKey: { not: null } },
    orderBy: { createdAt: "asc" }, // oldest first
    select: { id: true, storageKey: true, fileSize: true },
  });

  let freed = 0;
  let evicted = 0;
  const toDelete: string[] = [];
  for (const v of victims) {
    if (total - freed <= limit) break;
    freed += v.fileSize ?? 0;
    toDelete.push(v.id);
    evicted++;
    if (v.storageKey) {
      try {
        await deleteObject(v.storageKey);
      } catch (err) {
        console.warn(
          `[recordings-quota] object delete failed for ${v.storageKey}:`,
          err
        );
      }
    }
  }
  if (toDelete.length > 0) {
    await prisma.callRecording.deleteMany({ where: { id: { in: toDelete } } });
    console.log(
      `[recordings-quota] evicted ${evicted} recording(s), freed ~${(
        freed /
        1024 ** 3
      ).toFixed(2)}GB to stay under the ${(
        RECORDINGS_MAX_TOTAL_BYTES /
        1024 ** 3
      ).toFixed(0)}GB cap`
    );
  }
  return { evicted, totalBytes: total - freed };
}
