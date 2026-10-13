/**
 * do-full-migration.js
 * Migrates ALL data from Supabase (DB + Storage) → new PostgreSQL + MinIO
 * Run: node scripts/do-full-migration.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { createClient } = require('@supabase/supabase-js');
const Minio = require('minio');
const { Client } = require('pg');

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
const NEW_DB_URL = process.env.DATABASE_URL;
const SUPABASE_STORAGE_BASE = process.env.SUPABASE_PUBLIC_URL_BASE;
const MINIO_PUBLIC_URL = process.env.MINIO_PUBLIC_URL || 'http://84.247.131.188:9000';
const SOURCE_BUCKET = 'images';
const DEST_BUCKET = 'images';

function log(msg) { process.stdout.write(msg + '\n'); }
function logErr(msg) { process.stderr.write('❌ ' + msg + '\n'); }

// ── Supabase client ───────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── MinIO client ──────────────────────────────────────────────────────────────
const minio = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function ensureMinioBucket() {
  const exists = await minio.bucketExists(DEST_BUCKET);
  if (!exists) {
    await minio.makeBucket(DEST_BUCKET, 'us-east-1');
    log(`   🪣 Created bucket: ${DEST_BUCKET}`);
  } else {
    log(`   ✅ Bucket "${DEST_BUCKET}" already exists.`);
  }
  const policy = JSON.stringify({
    Version: '2012-10-17',
    Statement: [{
      Effect: 'Allow',
      Principal: { AWS: ['*'] },
      Action: ['s3:GetObject'],
      Resource: [`arn:aws:s3:::${DEST_BUCKET}/*`],
    }],
  });
  await minio.setBucketPolicy(DEST_BUCKET, policy);
  log(`   ✅ Public-read policy set on "${DEST_BUCKET}".`);
}

async function listAllSupabaseObjects(bucket, prefix = '') {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    offset: 0,
  });
  if (error) throw new Error(`List error at "${prefix}": ${error.message}`);
  const files = [];
  for (const item of data || []) {
    if (item.id === null) {
      const subPath = prefix ? `${prefix}/${item.name}` : item.name;
      const sub = await listAllSupabaseObjects(bucket, subPath);
      files.push(...sub);
    } else {
      files.push(prefix ? `${prefix}/${item.name}` : item.name);
    }
  }
  return files;
}

const EXT_TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf',
  mp4: 'video/mp4', mp3: 'audio/mpeg', ogg: 'audio/ogg',
  aac: 'audio/aac', wav: 'audio/wav', doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv', txt: 'text/plain',
};

// ═════════════════════════════════════════════════════════════════════════════
// STEP 1 — Migrate Storage (Supabase bucket → MinIO)
// ═════════════════════════════════════════════════════════════════════════════
async function migrateStorage() {
  log('\n🗂️  STEP 1: Migrating Supabase Storage → MinIO');
  log('─'.repeat(50));

  await ensureMinioBucket();

  log(`\n   📂 Listing files in Supabase bucket "${SOURCE_BUCKET}"...`);
  const files = await listAllSupabaseObjects(SOURCE_BUCKET);
  log(`   Found ${files.length} file(s).\n`);

  if (files.length === 0) {
    log('   ℹ️  No files to migrate in storage.');
    return;
  }

  let ok = 0, fail = 0;
  for (const filePath of files) {
    process.stdout.write(`   ⬇️  ${filePath} ... `);
    try {
      const { data: blob, error: dlErr } = await supabase.storage
        .from(SOURCE_BUCKET)
        .download(filePath);
      if (dlErr) throw new Error(dlErr.message);

      const buf = Buffer.from(await blob.arrayBuffer());
      const ext = (filePath.split('.').pop() || '').toLowerCase();
      const ct = EXT_TYPES[ext] || 'application/octet-stream';

      await minio.putObject(DEST_BUCKET, filePath, buf, buf.length, { 'Content-Type': ct });
      process.stdout.write('✅\n');
      ok++;
    } catch (e) {
      process.stdout.write(`❌ ${e.message}\n`);
      fail++;
    }
  }

  log(`\n   Storage migration: ✅ ${ok} succeeded, ❌ ${fail} failed`);
}

// ═════════════════════════════════════════════════════════════════════════════
// STEP 2 — Migrate Database (Supabase PostgreSQL → new PostgreSQL)
// ═════════════════════════════════════════════════════════════════════════════

// All tables in the schema (ordered to respect FK constraints)
const TABLES = [
  'users',
  'sessions',
  'otp_codes',
  'categories',
  'tags',
  'filters',
  'listings',
  'listing_likes',
  'saved_listings',
  'blogs',
  'blog_tags',
  'blog_likes',
  'saved_blogs',
  'comments',
  'notifications',
  'notification_preferences',
  'activity_logs',
  'analytics',
  'search_queries',
  'files',
  'messages',
  'chat_rooms',
  'chat_messages',
  'whatsapp_businesses',
  'whatsapp_conversations',
  'whatsapp_messages',
  'whatsapp_analytics',
  'whatsapp_webhooks',
  'whatsapp_flows',
  'flow_sessions',
  'message_templates',
  'broadcast_campaigns',
  'campaign_recipients',
  'business_contacts',
  'business_verifications',
  'product_catalogs',
  'products',
  'invoices',
  'subscriptions',
  'support_tickets',
  'ticket_messages',
  'reviews',
  'pages',
  'settings',
];

async function migrateDatabase() {
  log('\n🗄️  STEP 2: Migrating Supabase Database → new PostgreSQL');
  log('─'.repeat(50));

  const src = new Client({ connectionString: SUPABASE_DB_URL });
  const dst = new Client({ connectionString: NEW_DB_URL });

  await src.connect();
  log('   ✅ Connected to Supabase PostgreSQL');
  await dst.connect();
  log('   ✅ Connected to new PostgreSQL');

  // Get actual tables that exist in source
  const existsRes = await src.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);
  const existingTables = existsRes.rows.map(r => r.table_name);
  log(`   📋 Found ${existingTables.length} tables in source DB\n`);

  // Disable triggers/FK checks on destination during insert
  await dst.query('SET session_replication_role = replica;');

  let totalRows = 0;

  for (const table of existingTables) {
    try {
      // Count source rows
      const countRes = await src.query(`SELECT COUNT(*) FROM "${table}"`);
      const count = parseInt(countRes.rows[0].count, 10);

      if (count === 0) {
        log(`   ⏭️  ${table}: 0 rows — skipping`);
        continue;
      }

      // Fetch all rows
      const dataRes = await src.query(`SELECT * FROM "${table}"`);
      const rows = dataRes.rows;

      if (rows.length === 0) continue;

      // Get column names
      const cols = Object.keys(rows[0]);
      const colList = cols.map(c => `"${c}"`).join(', ');

      // Truncate destination table first
      await dst.query(`TRUNCATE TABLE "${table}" CASCADE`);

      // Batch insert (500 rows at a time)
      const BATCH = 500;
      let inserted = 0;

      for (let i = 0; i < rows.length; i += BATCH) {
        const batch = rows.slice(i, i + BATCH);
        const valuePlaceholders = batch.map((_, bi) =>
          `(${cols.map((_, ci) => `$${bi * cols.length + ci + 1}`).join(', ')})`
        ).join(', ');
        const flatValues = batch.flatMap(row => cols.map(c => row[c]));

        await dst.query(
          `INSERT INTO "${table}" (${colList}) VALUES ${valuePlaceholders} ON CONFLICT DO NOTHING`,
          flatValues
        );
        inserted += batch.length;
      }

      log(`   ✅ ${table}: ${inserted} rows copied`);
      totalRows += inserted;

    } catch (err) {
      log(`   ⚠️  ${table}: ${err.message} (skipped)`);
    }
  }

  // Re-enable triggers
  await dst.query('SET session_replication_role = DEFAULT;');

  // Reset sequences so new inserts don't conflict
  log('\n   🔄 Resetting sequences...');
  try {
    const seqRes = await dst.query(`
      SELECT sequence_name FROM information_schema.sequences
      WHERE sequence_schema = 'public';
    `);
    for (const { sequence_name } of seqRes.rows) {
      // Extract table name from sequence (e.g. users_id_seq → users)
      const tableName = sequence_name.replace(/_id_seq$/, '').replace(/_seq$/, '');
      try {
        await dst.query(`
          SELECT setval(
            '"${sequence_name}"',
            COALESCE((SELECT MAX(id) FROM "${tableName}"), 1)
          );
        `);
      } catch (_) { /* ignore — not all sequences map to tables */ }
    }
    log('   ✅ Sequences reset');
  } catch (e) {
    log(`   ⚠️  Could not reset sequences: ${e.message}`);
  }

  log(`\n   Database migration: ✅ ${totalRows} total rows copied`);

  // ── Step 3: Rewrite Supabase Storage URLs → MinIO URLs ──────────────────
  if (SUPABASE_STORAGE_BASE) {
    log('\n🔗  STEP 3: Rewriting Supabase Storage URLs → MinIO URLs');
    log('─'.repeat(50));

    const oldBase = SUPABASE_STORAGE_BASE;
    const newBase = `${MINIO_PUBLIC_URL}/${DEST_BUCKET}`;

    const urlColumns = [
      { table: 'users',    cols: ['avatar'] },
      { table: 'listings', cols: ['images'],  isArray: true },
      { table: 'blogs',    cols: ['"coverImage"'] },
      { table: 'messages', cols: ['"imageUrl"', '"videoUrl"', '"documentUrl"', '"audioUrl"'] },
      { table: 'files',    cols: ['url'] },
    ];

    for (const { table, cols, isArray } of urlColumns) {
      for (const col of cols) {
        try {
          let sql;
          if (isArray) {
            sql = `
              UPDATE "${table}"
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
              UPDATE "${table}"
              SET ${col} = REPLACE(${col}::text, '${oldBase}', '${newBase}')
              WHERE ${col}::text LIKE '${oldBase}%';
            `;
          }
          const res = await dst.query(sql);
          log(`   ✅ ${table}.${col}: ${res.rowCount} URL(s) updated`);
        } catch (e) {
          log(`   ⚠️  ${table}.${col}: ${e.message} (skipped)`);
        }
      }
    }

    // JSONB columns
    for (const { table, col } of [
      { table: 'activity_logs', col: 'data' },
      { table: 'notifications', col: 'data' },
    ]) {
      try {
        const res = await dst.query(`
          UPDATE "${table}"
          SET "${col}" = REPLACE("${col}"::text, '${oldBase}', '${newBase}')::jsonb
          WHERE "${col}"::text LIKE '%${oldBase}%';
        `);
        log(`   ✅ ${table}.${col}: ${res.rowCount} URL(s) updated`);
      } catch (e) {
        log(`   ⚠️  ${table}.${col}: ${e.message} (skipped)`);
      }
    }
  }

  await src.end();
  await dst.end();
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════════════════
async function main() {
  log('\n🚀 FULL MIGRATION: Supabase → PostgreSQL + MinIO');
  log('='.repeat(50));

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    logErr('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env'); process.exit(1);
  }
  if (!SUPABASE_DB_URL) {
    logErr('SUPABASE_DB_URL must be set in .env'); process.exit(1);
  }
  if (!NEW_DB_URL) {
    logErr('DATABASE_URL must be set in .env'); process.exit(1);
  }

  try {
    await migrateStorage();
    await migrateDatabase();

    log('\n' + '='.repeat(50));
    log('🎉 ALL MIGRATIONS COMPLETE!');
    log('');
    log('📌 New setup:');
    log(`   PostgreSQL : ${NEW_DB_URL.split('@')[1]}`);
    log(`   MinIO      : ${MINIO_PUBLIC_URL}/${DEST_BUCKET}`);
    log('');
    log('✅ Run: npm run dev');
    log('');
  } catch (err) {
    logErr('Migration failed: ' + err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();

