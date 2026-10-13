/**
 * Smoke test — verifies the full socket chain without the app:
 *   1. Signs a gateway token with JWT_SECRET (same as /api/realtime/token)
 *   2. Connects to REALTIME_URL with auth.token (websocket-only)
 *   3. Joins a room (acknowledged)
 *
 * Usage:
 *   JWT_SECRET=<gateway secret> node smoke-test.js
 *   JWT_SECRET=... REALTIME_URL=https://relay.quickwebs.site node smoke-test.js
 *
 * Exit 0 + "join: { ok: true }"  → auth + rooms working.
 */
const jwt = require("jsonwebtoken");
const { io } = require("socket.io-client");

const secret = process.env.JWT_SECRET;
const url = process.env.REALTIME_URL || "https://relay.quickwebs.site";

if (!secret) {
  console.error("JWT_SECRET env var is required");
  process.exit(1);
}

const token = jwt.sign({ sub: "smoke-test-user" }, secret, { expiresIn: "5m" });
const socket = io(url, {
  auth: { token },
  transports: ["websocket"],
  reconnection: false,
});

const timeout = setTimeout(() => {
  console.error("FAIL: timed out waiting for connect (10s)");
  process.exit(1);
}, 10000);

socket.on("connect", () => {
  console.log("connected as", socket.id);
  socket.emit("room:join", "room:smoke-test", (res) => {
    console.log("join:", JSON.stringify(res));
    clearTimeout(timeout);
    socket.disconnect();
    process.exit(res && res.ok ? 0 : 1);
  });
});

socket.on("connect_error", (err) => {
  console.error("FAIL connect_error:", err.message);
  process.exit(1);
});
