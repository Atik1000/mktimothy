/**
 * Diagnostic dump — recent call sessions + their signaling traffic.
 * Shows exactly how far each call got: OFFER created? delivered? ANSWER back?
 * Run: node ws-gateway/db-calls-diag.js [sessionId]
 */
const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) {
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const wanted = process.argv[2];
  const sessions = await prisma.callSession.findMany({
    orderBy: { createdAt: "desc" },
    take: wanted ? 50 : 6,
    include: { schedule: true },
  });
  const target = wanted
    ? sessions.find((s) => s.id === wanted || s.schedule.id === wanted)
    : sessions[0];

  if (!target) {
    console.log("No sessions found.");
    return;
  }

  console.log("=== Latest session ===");
  console.log("id:            ", target.id);
  console.log("status:        ", target.status, target.endReason ? `(${target.endReason})` : "");
  console.log("callType:      ", target.schedule.callType);
  console.log("createdAt:     ", target.createdAt.toISOString());
  console.log("callerId:      ", target.schedule.callerId);
  console.log("calleeId:      ", target.schedule.calleeId);
  console.log("participants:  ", JSON.stringify(target.participants));
  console.log(
    "initiator is LOWER id (caller initiates if callerId < calleeId):",
    target.schedule.callerId < target.schedule.calleeId ? "CALLER" : "CALLEE"
  );

  const signals = await prisma.callSignal.findMany({
    where: { sessionId: target.id },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  console.log(`\n=== Signals (${signals.length}) ===`);
  if (signals.length === 0) {
    console.log("NO SIGNALS AT ALL — nobody ever posted an offer. PC creation failed on both sides.");
    return;
  }
  for (const s of signals) {
    const desc = s.payload?.description
      ? `type=${s.payload.description?.type}`
      : s.payload?.candidate
        ? `cand=${String(s.payload.candidate?.candidate ?? "").split(" ")[4] ?? "?"}`
        : "";
    console.log(
      `${s.createdAt.toISOString().slice(11, 23)}  ${String(s.type).padEnd(7)} from=${s.fromId.slice(-6)} → ${s.targetId ? s.targetId.slice(-6) : "ALL"}  ${desc}  ${s.deliveredAt ? "delivered" : "NOT-DELIVERED"}`
    );
  }

  const counts = {};
  for (const s of signals) counts[s.type] = (counts[s.type] ?? 0) + 1;
  console.log("\nSummary:", JSON.stringify(counts));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
