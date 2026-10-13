/**
 * migrate-storage.js
 *
 * One-time migration script: copies every object from a Supabase Storage bucket
 * to MinIO, preserving folder structure.
 *
 * Prerequisites:
 *   npm install @supabase/supabase-js minio --legacy-peer-deps
 *
 * Usage:
 *   node scripts/migrate-storage.js
 *
 * Environment variables required (can be set in .env or exported before running):
 *   SUPABASE_URL            — your Supabase project URL
 *   SUPABASE_SERVICE_KEY    — Supabase service-role key
 *   MINIO_ENDPOINT          — MinIO host (e.g. 84.247.131.188)
 *   MINIO_PORT              — MinIO port  (e.g. 9000)
 *   MINIO_USE_SSL           — "true" or "false"
 *   MINIO_ACCESS_KEY        — MinIO access key
 *   MINIO_SECRET_KEY        — MinIO secret key
 *   MINIO_PUBLIC_URL        — public base URL of MinIO
 *   SOURCE_BUCKET           — Supabase bucket name to migrate (default: "images")
 *   DEST_BUCKET             — MinIO bucket name to migrate into (default: "images")
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const Minio = require("minio");

// ── Configuration ─────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SOURCE_BUCKET = process.env.SOURCE_BUCKET || "images";
const DEST_BUCKET = process.env.DEST_BUCKET || "images";

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "84.247.131.188";
const MINIO_PORT = parseInt(process.env.MINIO_PORT || "9000", 10);
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === "true";
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || "admin";
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || "quicktumbupassword";

// ── Clients ───────────────────────────────────────────────────────────────────

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(
    "❌  Set SUPABASE_URL and SUPABASE_SERVICE_KEY before running this script."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const minio = new Minio.Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: MINIO_USE_SSL,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function ensureMinioBucket(bucketName) {
  const exists = await minio.bucketExists(bucketName);
  if (!exists) {
    console.log(`🪣  Creating MinIO bucket: ${bucketName}`);
    await minio.makeBucket(bucketName, "us-east-1");
  }
  // Set public-read policy
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
  await minio.setBucketPolicy(bucketName, policy);
  console.log(`✅  MinIO bucket "${bucketName}" is ready with public-read policy.`);
}

/**
 * Recursively list all objects in a Supabase Storage folder.
 */
async function listAllSupabaseObjects(bucket, prefix = "") {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    offset: 0,
  });

  if (error) {
    throw new Error(`Failed to list Supabase objects at "${prefix}": ${error.message}`);
  }

  const files = [];

  for (const item of data || []) {
    if (item.id === null) {
      // It's a folder — recurse
      const subPath = prefix ? `${prefix}/${item.name}` : item.name;
      const subFiles = await listAllSupabaseObjects(bucket, subPath);
      files.push(...subFiles);
    } else {
      // It's a file
      const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
      files.push(fullPath);
    }
  }

  return files;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function migrate() {
  console.log(`\n🚀  Starting storage migration`);
  console.log(`    Source : Supabase bucket "${SOURCE_BUCKET}"`);
  console.log(`    Target : MinIO bucket "${DEST_BUCKET}" @ ${MINIO_ENDPOINT}:${MINIO_PORT}\n`);

  await ensureMinioBucket(DEST_BUCKET);

  console.log(`📂  Listing objects in Supabase bucket "${SOURCE_BUCKET}"...`);
  const files = await listAllSupabaseObjects(SOURCE_BUCKET);
  console.log(`    Found ${files.length} file(s).\n`);

  if (files.length === 0) {
    console.log("ℹ️   Nothing to migrate.");
    return;
  }

  let succeeded = 0;
  let failed = 0;

  for (const filePath of files) {
    process.stdout.write(`  ⬇️  ${filePath} ... `);

    try {
      // Download from Supabase
      const { data: blobData, error: downloadError } = await supabase.storage
        .from(SOURCE_BUCKET)
        .download(filePath);

      if (downloadError) {
        throw new Error(downloadError.message);
      }

      // Convert Blob to Buffer
      const arrayBuffer = await blobData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Determine content-type (best-effort from extension)
      const ext = filePath.split(".").pop()?.toLowerCase() || "";
      const contentTypeMap = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        gif: "image/gif",
        webp: "image/webp",
        pdf: "application/pdf",
        mp4: "video/mp4",
        mp3: "audio/mpeg",
        ogg: "audio/ogg",
        aac: "audio/aac",
        wav: "audio/wav",
        doc: "application/msword",
        docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        xls: "application/vnd.ms-excel",
        xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        csv: "text/csv",
        txt: "text/plain",
      };
      const contentType = contentTypeMap[ext] || "application/octet-stream";

      // Upload to MinIO
      await minio.putObject(DEST_BUCKET, filePath, buffer, buffer.length, {
        "Content-Type": contentType,
      });

      process.stdout.write(`✅\n`);
      succeeded++;
    } catch (err) {
      process.stdout.write(`❌  ${err.message}\n`);
      failed++;
    }
  }

  console.log(`\n🏁  Migration complete!`);
  console.log(`    ✅  Succeeded : ${succeeded}`);
  console.log(`    ❌  Failed    : ${failed}`);

  if (failed > 0) {
    console.log(`\n⚠️   Some files failed to migrate. Re-run the script to retry only the failed ones,`);
    console.log(`    or check the errors above and handle them manually.`);
  }
}

migrate().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

