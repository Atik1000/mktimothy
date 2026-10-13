import * as Minio from "minio";

/**
 * MinIO storage helper (S3-compatible) — call recordings.
 *
 * Browser uploads/downloads go DIRECTLY to MinIO via presigned URLs so the
 * media never passes through Vercel (serverless body limit is 4.5MB; call
 * recordings are 10–500MB).
 *
 * Env: MINIO_ENDPOINT, MINIO_PORT, MINIO_USE_SSL, MINIO_ACCESS_KEY,
 *      MINIO_SECRET_KEY, MINIO_BUCKET (default: call-recordings)
 */

export const RECORDINGS_BUCKET =
  process.env.MINIO_BUCKET || "call-recordings";

// Cold-start config trace (no secrets) — makes env mistakes like an https://
// MINIO_DIRECT_URL or a bare-IP endpoint visible in the function logs
// instead of a mystery 500 deep in a presign call.
console.log(
  `[minio] config — public: ${process.env.MINIO_ENDPOINT || "(unset)"}:${
    process.env.MINIO_PORT || 9000
  } ssl=${process.env.MINIO_USE_SSL === "true"} | direct: ${
    process.env.MINIO_DIRECT_URL || "(none → falls back to public)"
  } | bucket: ${RECORDINGS_BUCKET}`
);

let client: Minio.Client | null = null;
let directClient: Minio.Client | null = null;

/**
 * PUBLIC client — signs URLs the BROWSER will fetch (uploads/downloads).
 * Must point at the HTTPS endpoint (tunnel) so the URLs aren't
 * mixed-content blocked on production.
 */
export function minioClient(): Minio.Client | null {
  if (!process.env.MINIO_ENDPOINT || !process.env.MINIO_ACCESS_KEY) {
    return null; // storage not configured — recording upload is skipped
  }
  if (!client) {
    client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: Number(process.env.MINIO_PORT || 9000),
      useSSL: process.env.MINIO_USE_SSL === "true",
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
  }
  return client;
}

/**
 * API client — SERVER-side S3 operations (multipart control plane, deletes,
 * bucket checks). Goes DIRECT to the origin via MINIO_DIRECT_URL
 * (e.g. http://84.247.131.188:9000): plain HTTP is fine server-to-server,
 * and the tunnel proved unreliable for S3 API semantics (stale/cached
 * responses). Falls back to the public client when not configured.
 *
 * Env: MINIO_DIRECT_URL (server-side only)
 */
function apiClient(): Minio.Client | null {
  const raw = process.env.MINIO_DIRECT_URL;
  if (!raw) return minioClient();
  if (!directClient) {
    try {
      const u = new URL(raw);
      directClient = new Minio.Client({
        endPoint: u.hostname,
        port: Number(u.port || (u.protocol === "https:" ? 443 : 80)),
        useSSL: u.protocol === "https:",
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY,
      });
    } catch {
      return minioClient();
    }
  }
  return directClient;
}

/** Presigned PUT — browser uploads the recording blob straight to MinIO.
 *  Signed with the PUBLIC client (browser-facing, must be the HTTPS host);
 *  only the bucket check goes via the direct api client. */
export async function presignUpload(
  key: string,
  contentType: string
): Promise<string | null> {
  const c = minioClient();
  if (!c) return null;

  const api = apiClient();
  if (api) {
    try {
      const exists = await api.bucketExists(RECORDINGS_BUCKET);
      if (!exists) {
        await api.makeBucket(RECORDINGS_BUCKET, "us-east-1");
        console.log(`[minio] Created bucket: ${RECORDINGS_BUCKET}`);
      }
    } catch (err) {
      console.error(`[minio] Failed to check/create bucket ${RECORDINGS_BUCKET}:`, err);
    }
  }

  return c.presignedPutObject(RECORDINGS_BUCKET, key, 60 * 60); // 1h
}

/**
 * Presigned GET — playback & download links.
 * `download=true` forces the browser to save the file instead of playing it.
 */
export async function presignDownload(
  key: string,
  opts: { download?: boolean; filename?: string } = {}
): Promise<string | null> {
  const c = minioClient();
  if (!c) return null;
  if (opts.download) {
    const params = {
      "response-content-disposition": `attachment; filename="${opts.filename || key.split("/").pop()}"`,
    } as any;
    return c.presignedGetObject(
      RECORDINGS_BUCKET,
      key,
      24 * 60 * 60,
      params
    );
  }
  return c.presignedGetObject(RECORDINGS_BUCKET, key, 24 * 60 * 60);
}

/** Delete one object — used by the recordings quota (oldest-first
 *  eviction). Server-side, so it goes via the direct api client. */
export async function deleteObject(key: string): Promise<void> {
  const c = apiClient();
  if (!c) return;
  await c.removeObject(RECORDINGS_BUCKET, key);
}

/** Does the object exist? Used to prune DB rows whose file was removed
 *  directly in storage (e.g. cleared via the MinIO console). FAILS OPEN:
 *  only a definitive Not Found counts as missing — network/config errors
 *  report "exists" so a blip can never cause row deletion. */
export async function objectExists(key: string): Promise<boolean> {
  const c = apiClient();
  if (!c) return true; // storage unconfigured — assume present
  try {
    await c.statObject(RECORDINGS_BUCKET, key);
    return true;
  } catch (err: any) {
    const notFound =
      err?.code === "NotFound" ||
      /not found|nosuchkey/i.test(String(err?.message ?? err));
    return !notFound;
  }
}

// ── Multipart uploads ───────────────────────────────────────────────────────
// The HTTPS path to MinIO goes through Cloudflare, which caps a single
// request body at 100MB (verified: a 101MB PUT returns 413). Video call
// recordings exceed that after ~10 minutes, so larger uploads are split
// into parts — each part is a plain presigned PUT well under the cap, and
// the parts are stitched into one object server-side on complete.
//
// Transport note: initiate/complete/abort use fetch() against presigned
// URLs. Presigning is a LOCAL operation in minio-js (no network), and
// fetch proved fully reliable through the tunnel — minio-js's own request
// methods intermittently died there with TLS EPROTO errors.

/** Recordings at or above this size upload as multipart. */
export const MULTIPART_THRESHOLD = 90 * 1024 * 1024;
/** Per-part PUT size — safely under Cloudflare's 100MB cap. */
export const MULTIPART_PART_SIZE = 64 * 1024 * 1024;

/** Presign locally, transport via fetch — but sign with the DIRECT api
 *  client so the server fetches these control-plane URLs origin-side,
 *  bypassing the tunnel entirely. */
async function presignedFetch(
  method: string,
  key: string,
  query: Record<string, string>,
  body?: string
): Promise<Response> {
  const c = apiClient();
  if (!c) throw new Error("storage not configured");
  const url = await c.presignedUrl(method, RECORDINGS_BUCKET, key, 10 * 60, query);
  return fetch(url, {
    method,
    body,
    headers: body !== undefined ? { "Content-Type": "application/xml" } : undefined,
  });
}

export async function presignPartPut(
  key: string,
  uploadId: string,
  partNumber: number
): Promise<string | null> {
  const c = minioClient();
  if (!c) return null;
  return c.presignedUrl("PUT", RECORDINGS_BUCKET, key, 60 * 60, {
    PartNumber: String(partNumber),
    UploadId: uploadId,
  });
}

export async function initiateMultipart(
  key: string,
  _contentType: string
): Promise<string | null> {
  const c = minioClient();
  if (!c) return null;
  const res = await presignedFetch("POST", key, { uploads: "" }, "");
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`multipart initiate failed: ${res.status} ${text.slice(0, 200)}`);
  }
  const m = text.match(/<UploadId>([^<]+)<\/UploadId>/);
  if (!m) throw new Error("no UploadId in initiate response");
  return m[1];
}

/** Ground-truth part list straight from MinIO (ListParts). */
async function listMultipartParts(
  key: string,
  uploadId: string
): Promise<{ part: number; etag?: string }[]> {
  const res = await presignedFetch("GET", key, { uploadId });
  const text = await res.text();
  if (!res.ok) return [];
  const parts: { part: number; etag?: string }[] = [];
  for (const blob of text.match(/<Part>[\s\S]*?<\/Part>/g) ?? []) {
    const etag = blob.match(/<ETag>([^<]*)<\/ETag>/)?.[1];
    const num = blob.match(/<PartNumber>(\d+)<\/PartNumber>/)?.[1];
    if (num) parts.push({ part: Number(num), etag });
  }
  return parts.sort((a, b) => a.part - b.part);
}

function completeBody(etags: { part: number; etag?: string }[]): string {
  return (
    `<?xml version="1.0" encoding="UTF-8"?><CompleteMultipartUpload>` +
    etags
      .map(
        (p) =>
          `<Part><PartNumber>${p.part}</PartNumber><ETag>${p.etag ?? ""}</ETag></Part>`
      )
      .join("") +
    `</CompleteMultipartUpload>`
  );
}

export async function completeMultipart(
  key: string,
  uploadId: string,
  etags: { part: number; etag?: string }[]
): Promise<void> {
  let res = await presignedFetch("POST", key, { uploadId }, completeBody(etags));
  let text = await res.text();
  // S3 may even return 200 with an <Error> body, hence the explicit check.
  if (!res.ok || /<Error>/.test(text)) {
    // The client-collected ETags can be mangled by the proxy (e.g. quotes
    // stripped from the ETag response header). Retry once with the parts
    // as MinIO itself knows them.
    const truth = await listMultipartParts(key, uploadId);
    if (truth.length > 0) {
      res = await presignedFetch("POST", key, { uploadId }, completeBody(truth));
      text = await res.text();
    }
  }
  if (!res.ok || /<Error>/.test(text)) {
    throw new Error(
      `multipart complete failed: ${res.status} ${text.slice(0, 300)}`
    );
  }
}

export async function abortMultipart(
  key: string,
  uploadId: string
): Promise<void> {
  const c = minioClient();
  if (!c) return;
  try {
    await presignedFetch("DELETE", key, { uploadId });
  } catch (err) {
    console.warn(`[minio] multipart abort failed for ${key}:`, err);
  }
}
