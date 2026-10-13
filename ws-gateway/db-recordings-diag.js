// Diagnostic: today's call sessions vs recording rows — did production
// calls even reach the "complete" step (row creation)?
const fs = require("fs");
const path = require("path");
for (const line of fs.readFileSync(path.join(__dirname, "..", ".env"), "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const since = new Date(Date.now() - 36 * 3600 * 1000);
  const sessions = await prisma.callSession.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    include: { schedule: { select: { callType: true } } },
  });
  console.log(`=== Call sessions (last 36h): ${sessions.length} ===`);
  for (const s of sessions) {
    console.log(
      `${s.createdAt.toISOString()} ${s.id} status=${s.status} reason=${s.endReason ?? "-"} type=${s.schedule.callType} duration=${s.durationSec ?? "-"}s`
    );
  }

  const recs = await prisma.callRecording.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  console.log(`\n=== Recording rows (all, newest first): ${recs.length} ===`);
  for (const r of recs) {
    console.log(
      `${r.createdAt.toISOString()} ${r.id} session=${r.sessionId} type=${r.callType} size=${r.fileSize ?? "-"} key=${r.storageKey ?? "NULL!"}`
    );
  }
})();
