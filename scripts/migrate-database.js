/**
 * migrate-database.js
 *
 * Step-by-step guide + automation helper for migrating the PostgreSQL database
 * from Supabase to the new PostgreSQL host.
 *
 * This script uses `pg_dump` / `pg_restore` (must be installed locally).
 * It also rewrites Supabase Storage URLs in the database to MinIO URLs after
 * the data is imported.
 *
 * Usage:
 *   node scripts/migrate-database.js
 *
 * Required env vars (add to .env or export before running):
 *   SUPABASE_DB_URL   — postgres connection string to your Supabase DB
 *                       e.g. postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
 *   DATABASE_URL      — postgres connection string to the NEW host
 *   SUPABASE_PUBLIC_URL_BASE   — base URL of Supabase Storage public files
 *                                e.g. https://xxxx.supabase.co/storage/v1/object/public/images
 *   MINIO_PUBLIC_URL  — MinIO public base URL
 *                       e.g. http://84.247.131.188:9000
 */

require("dotenv").config();
const { execSync } = require("child_process");
const { Client } = require("pg");
const path = require("path");
const fs = require("fs");

const DUMP_FILE = path.join(__dirname, "supabase_dump.sql");

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
const NEW_DB_URL = process.env.DATABASE_URL;
const SUPABASE_STORAGE_BASE = process.env.SUPABASE_PUBLIC_URL_BASE; // e.g. https://xxx.supabase.co/storage/v1/object/public/images
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || "http://84.247.131.188:9000";
const MINIO_BUCKET = "images";

async function run() {
  // ── 1. Dump Supabase DB ───────────────────────────────────────────────────
  if (!SUPABASE_DB_URL) {
    console.error("❌  Set SUPABASE_DB_URL to your Supabase PostgreSQL connection string.");
    process.exit(1);
  }

  console.log("📦  Step 1: Dumping Supabase database...");
  try {
    execSync(
      `pg_dump --no-owner --no-acl --schema=public "${SUPABASE_DB_URL}" -f "${DUMP_FILE}"`,
      { stdio: "inherit" }
    );
    console.log(`    ✅  Dump saved to: ${DUMP_FILE}\n`);
  } catch (err) {
    console.error("    ❌  pg_dump failed. Make sure pg_dump is installed and SUPABASE_DB_URL is correct.");
    process.exit(1);
  }

  // ── 2. Apply schema to new DB via Prisma ─────────────────────────────────
  console.log("🏗️   Step 2: Pushing Prisma schema to the new database...");
  try {
    execSync(`npx prisma db push --skip-generate`, {
      stdio: "inherit",
      cwd: path.join(__dirname, ".."),
    });
    console.log("    ✅  Schema applied.\n");
  } catch (err) {
    console.error("    ❌  prisma db push failed.");
    process.exit(1);
  }

  // ── 3. Restore data into the new DB ──────────────────────────────────────
  console.log("📥  Step 3: Restoring data into the new PostgreSQL database...");
  if (!NEW_DB_URL) {
    console.error("    ❌  DATABASE_URL is not set.");
    process.exit(1);
  }
  try {
    execSync(`psql "${NEW_DB_URL}" -f "${DUMP_FILE}"`, { stdio: "inherit" });
    console.log("    ✅  Data restored.\n");
  } catch (err) {
    console.error("    ❌  psql restore failed.");
    process.exit(1);
  }

  // ── 4. Rewrite Supabase Storage URLs → MinIO URLs ─────────────────────────
  if (!SUPABASE_STORAGE_BASE) {
    console.log(
      "⏭️   Step 4: Skipping URL rewrite (SUPABASE_PUBLIC_URL_BASE not set).\n" +
      "    Set this variable to automatically rewrite stored file URLs.\n"
    );
    return;
  }

  console.log("🔗  Step 4: Rewriting Supabase Storage URLs to MinIO URLs in the database...");
  const newBase = `${MINIO_PUBLIC_URL}/${MINIO_BUCKET}`;
  const oldBase = SUPABASE_STORAGE_BASE; // e.g. https://xxx.supabase.co/storage/v1/object/public/images

  const client = new Client({ connectionString: NEW_DB_URL });
  await client.connect();

  // Tables and columns that may contain file URLs
  const urlColumns = [
    { table: '"User"',              columns: ["avatar"] },
    { table: '"Listing"',           columns: ["images"] },      // text[] — use array replacement
    { table: '"Blog"',              columns: ['"coverImage"'] },
    { table: '"Message"',           columns: ['"imageUrl"', '"videoUrl"', '"documentUrl"', '"audioUrl"'] },
    { table: '"File"',              columns: ["url"] },
  ];

  for (const { table, columns } of urlColumns) {
    for (const col of columns) {
      try {
        // For array columns (text[]) use array_replace logic
        const isArray = col === "images";
        let sql;
        if (isArray) {
          // Replace each element of the array
          sql = `
            UPDATE ${table}
            SET ${col} = ARRAY(
              SELECT REPLACE(elem, '${oldBase}', '${newBase}')
              FROM UNNEST(${col}) AS elem
            )
            WHERE EXISTS (
              SELECT 1 FROM UNNEST(${col}) AS elem WHERE elem LIKE '${oldBase}%'
            );
          `;
        } else {
          sql = `
            UPDATE ${table}
            SET ${col} = REPLACE(${col}::text, '${oldBase}', '${newBase}')
            WHERE ${col}::text LIKE '${oldBase}%';
          `;
        }
        const res = await client.query(sql);
        console.log(`    ✅  ${table}.${col}: ${res.rowCount} row(s) updated.`);
      } catch (err) {
        console.warn(`    ⚠️   ${table}.${col}: ${err.message} (skipped)`);
      }
    }
  }

  // Also rewrite JSON/JSONB columns (e.g. ActivityLog.data, Notification.data)
  const jsonbColumns = [
    { table: '"ActivityLog"',    col: "data" },
    { table: '"Notification"',   col: "data" },
  ];
  for (const { table, col } of jsonbColumns) {
    try {
      const sql = `
        UPDATE ${table}
        SET ${col} = REPLACE(${col}::text, '${oldBase}', '${newBase}')::jsonb
        WHERE ${col}::text LIKE '%${oldBase}%';
      `;
      const res = await client.query(sql);
      console.log(`    ✅  ${table}.${col}: ${res.rowCount} row(s) updated.`);
    } catch (err) {
      console.warn(`    ⚠️   ${table}.${col}: ${err.message} (skipped)`);
    }
  }

  await client.end();
  console.log("\n🏁  Database migration complete!\n");
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

