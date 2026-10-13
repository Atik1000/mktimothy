/**
 * run-migration.js
 *
 * 1. Creates the MinIO 'images' bucket with public-read policy
 * 2. Pushes the Prisma schema to the new PostgreSQL database
 * 3. Lists all tables and row counts to confirm data
 */

require('dotenv').config();
const Minio = require('minio');
const { Client } = require('pg');
const { execSync } = require('child_process');
const path = require('path');

const BUCKET = 'images';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT,
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

async function setupMinioBucket() {
  console.log('\n📦 Step 1: Setting up MinIO bucket...');
  const exists = await minioClient.bucketExists(BUCKET);
  if (exists) {
    console.log(`   ✅ Bucket "${BUCKET}" already exists.`);
  } else {
    await minioClient.makeBucket(BUCKET, 'us-east-1');
    console.log(`   ✅ Bucket "${BUCKET}" created.`);
  }

  // Set public-read policy so all stored URLs work without signed tokens
  const policy = JSON.stringify({
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: { AWS: ['*'] },
        Action: ['s3:GetObject'],
        Resource: [`arn:aws:s3:::${BUCKET}/*`],
      },
    ],
  });
  await minioClient.setBucketPolicy(BUCKET, policy);
  console.log(`   ✅ Public-read policy applied to "${BUCKET}".`);

  // List all buckets for confirmation
  const buckets = await minioClient.listBuckets();
  console.log(`   📋 All MinIO buckets: ${buckets.map(b => b.name).join(', ')}`);
}

async function verifyDatabase() {
  console.log('\n🗄️  Step 2: Verifying PostgreSQL database...');
  const pgClient = new Client({ connectionString: process.env.DATABASE_URL });
  await pgClient.connect();

  // Get all tables and row counts
  const res = await pgClient.query(`
    SELECT 
      table_name,
      (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I', table_name), false, true, '')))[1]::text::int AS row_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  console.log(`   ✅ Connected to: ${process.env.DATABASE_URL.split('@')[1]}`);
  console.log(`   📋 Tables and row counts:`);
  if (res.rows.length === 0) {
    console.log('      (no tables found — run prisma db push first)');
  } else {
    res.rows.forEach(row => {
      console.log(`      ${row.table_name.padEnd(40)} ${row.row_count} rows`);
    });
  }

  await pgClient.end();
}

async function pushSchema() {
  console.log('\n🏗️  Step 3: Ensuring Prisma schema is in sync...');
  try {
    execSync('npx prisma db push --skip-generate', {
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
  } catch (e) {
    console.error('   ❌ prisma db push failed:', e.message);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Starting migration to PostgreSQL + MinIO');
  console.log('='.repeat(50));

  try {
    await setupMinioBucket();
    await pushSchema();
    await verifyDatabase();

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Migration complete!');
    console.log('\n📌 Summary:');
    console.log(`   Database : postgresql://...@${process.env.DATABASE_URL.split('@')[1]}`);
    console.log(`   MinIO    : http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${BUCKET}`);
    console.log(`   Public URL example: ${process.env.MINIO_PUBLIC_URL}/${BUCKET}/avatars/your-file.jpg`);
    console.log('\n✅ Your app is ready to use. Run: npm run dev\n');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();

