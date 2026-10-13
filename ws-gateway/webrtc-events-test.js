/**
 * WebRTC signaling allowlist test — verifies the LIVE gateway relays the
 * webrtc:* events the call system depends on:
 *
 *   1. Signs a gateway token with GATEWAY_JWT_SECRET (same as the app).
 *   2. Connects + joins room user:<test-id> (auto-joined via JWT sub anyway).
 *   3. POSTs /emit for each webrtc:* event to that user room.
 *   4. Reports, per event: HTTP status/body from /emit AND whether the socket
 *      actually received it. If /emit returns 400 "not in ALLOWED_EVENTS" or
 *      the socket never receives the event, WebRTC signaling is dead on the
 *      live gateway → every call hangs at "connecting peer-to-peer".
 *
 * Usage (reads secrets from ../.env automatically):
 *   node webrtc-events-test.js
 */
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const { io } = require("socket.io-client");

// --- Load .env from the project root (no dotenv dep needed) ---
const envPath = path.join(__dirname, "..", ".env");
for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m && !process.env[m[1]]) {
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}

const URL = process.env.NEXT_PUBLIC_REALTIME_URL || "https://relay.quickwebs.site";
const EMIT_URL = process.env.REALTIME_EMIT_URL || `${URL}/emit`;
const SECRET = process.env.GATEWAY_JWT_SECRET;
const API_KEY = process.env.REALTIME_API_KEY;

if (!SECRET || !API_KEY) {
  console.error("Missing GATEWAY_JWT_SECRET or REALTIME_API_KEY in .env");
  process.exit(1);
}

const TEST_USER = `wrtest-${Date.now()}`;
const EVENTS = [
  "webrtc:offer",
  "webrtc:answer",
  "webrtc:ice",
  "webrtc:media-state",
  "webrtc:end",
  // Control events — these are known-working (chat uses them live).
  "call:incoming",
  "message:new",
];

const token = jwt.sign({ sub: TEST_USER }, SECRET, { expiresIn: "5m" });
const socket = io(URL, {
  auth: { token },
  transports: ["websocket"],
  reconnection: false,
});

const received = new Set();
const httpResults = []; // { event, status, body }

const timeout = setTimeout(() => {
  console.error("\n=== TIMEOUT waiting for events ===");
  report();
  process.exit(1);
}, 20000);

function report() {
  clearTimeout(timeout);
  console.log("\n=== RESULTS ===");
  let allOk = true;
  for (const ev of EVENTS) {
    const http = httpResults.find((r) => r.event === ev);
    const got = received.has(ev);
    const ok = http && http.status === 200 && got;
    if (!ok) allOk = false;
    console.log(
      `${ok ? "PASS" : "FAIL"}  ${ev.padEnd(20)} /emit=${http ? http.status : "n/a"} received=${got}` +
        (http && http.status !== 200 ? `  body=${http.body}` : "")
    );
  }
  console.log(allOk ? "\nAll events relayed — gateway is NOT the problem." : "\nSome events FAILED — gateway config issue.");
  process.exit(allOk ? 0 : 1);
}

socket.on("connect", async () => {
  console.log("connected as", socket.id, `(${TEST_USER})`);
  // Personal room is auto-joined via JWT sub, but join explicitly for parity
  // with what a second client would do.
  socket.emit("room:join", `user:${TEST_USER}`, async (res) => {
    console.log("join user room:", JSON.stringify(res));

    // Emit one event at a time so we can attribute receipt precisely.
    for (const ev of EVENTS) {
      try {
        const r = await fetch(EMIT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_KEY}`,
          },
          body: JSON.stringify({
            room: `user:${TEST_USER}`,
            event: ev,
            payload: { callId: "test-call", fromId: "other-user", data: { marker: ev } },
          }),
        });
        const body = await r.text();
        httpResults.push({ event: ev, status: r.status, body: body.slice(0, 120) });
        console.log(`/emit ${ev} → ${r.status} ${body.slice(0, 80)}`);
      } catch (err) {
        httpResults.push({ event: ev, status: 0, body: String(err) });
        console.log(`/emit ${ev} → FETCH ERROR ${err.message}`);
      }
      // Give the socket a moment to receive each event.
      await new Promise((r) => setTimeout(r, 700));
    }
    // Small grace period for the last event.
    setTimeout(report, 1500);
  });
});

for (const ev of EVENTS) {
  socket.on(ev, (payload) => {
    if (payload?.data?.marker === ev) {
      received.add(ev);
      console.log(`↳ socket RECEIVED ${ev}`);
    }
  });
}

socket.on("connect_error", (err) => {
  console.error("FAIL connect_error:", err.message);
  process.exit(1);
});
