/**
 * Realtime Gateway — Socket.IO relay for mktimothy.com
 * =====================================================
 * Deploy on the VPS behind Nginx (wss://relay.quickwebs.site).
 *
 * Contract (matches the frontend integration brief):
 *  - Auth: JWT in handshake `auth.token`; user id read from `sub`/`userId`/`id`.
 *    Invalid token → connection refused with connect_error "unauthorized".
 *  - Auto-join: every socket joins its own `user:<id>` room. Clients never
 *    join anyone else's.
 *  - room:join / room:leave (acknowledged) for `room:<id>` chat channels.
 *    Max 64 chars, [a-zA-Z0-9/_-], max 32 rooms per socket.
 *  - Clients are RECEIVE-ONLY: emitting any broadcast event from a client
 *    is rejected. All fan-out happens server-side via POST /emit.
 *  - POST /emit (x-api-key auth): { room, event, payload } → pushes to every
 *    socket in that room. Payload cap 32KB. THIS is the endpoint the app's
 *    API routes (lib/realtime/emit.ts) call.
 *  - Heartbeat 25s ping / 20s timeout; connection-state-recovery < 2 min.
 *  - GET /health: browser-pingable status.
 */

// Loads .env from this folder (see .env.example) — not needed if you inject
// env vars via PM2/systemd instead.
require("dotenv").config();

const express = require("express");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");

const PORT = Number(process.env.PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET || "";
const API_KEY = process.env.API_KEY || "";
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

if (!JWT_SECRET) {
  console.error("FATAL: JWT_SECRET env var is required (must match the app's GATEWAY_JWT_SECRET)");
  process.exit(1);
}
if (!API_KEY) {
  console.error("FATAL: API_KEY env var is required (must match the app's REALTIME_API_KEY)");
  process.exit(1);
}

/** Events the gateway may broadcast. Anything else is rejected on /emit
 *  AND rejected if a client tries to emit it. */
const ALLOWED_EVENTS = new Set([
  // Chat
  "message:new",
  "message:updated",
  "message:deleted",
  "room:updated",
  "unread:updated",
  // Typing / presence (wired in the future, allowed from day one)
  "typing:start",
  "typing:stop",
  "presence:updated",
  // Calls
  "call:incoming",
  "call:cancelled",
  // WebRTC signaling
  "webrtc:offer",
  "webrtc:answer",
  "webrtc:ice",
  "webrtc:media-state",
  "webrtc:end",
]);

/** Client-joinable rooms: room:<id> where id = [a-zA-Z0-9/_-], ≤64 chars. */
const CLIENT_ROOM_RE = /^room:[a-zA-Z0-9/_-]{1,64}$/;
/** Server-publishable rooms: room:<id> or user:<id>. */
const EMIT_ROOM_RE = /^(room|user):[a-zA-Z0-9/_-]{1,64}$/;
const MAX_ROOMS_PER_SOCKET = 32;
const MAX_PAYLOAD_BYTES = 32 * 1024;

const app = express();
app.use(express.json({ limit: "256kb" }));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ALLOWED_ORIGINS,
    credentials: true,
  },
  // Brief §6: heartbeat 25s ping / 20s timeout.
  pingInterval: 25000,
  pingTimeout: 20000,
  // Brief §6: recovery for brief disconnects (<2 min) where possible.
  connectionStateRecovery: {
    maxDisconnectionDuration: 120000,
    skipMiddlewares: false,
  },
  // Transport cap consistent with the 32KB payload rule.
  maxHttpBufferSize: MAX_PAYLOAD_BYTES,
});

/* ------------------------------------------------------------------ */
/* Socket auth                                                         */
/* ------------------------------------------------------------------ */
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("unauthorized"));
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err || !decoded) return next(new Error("unauthorized"));
    const userId = decoded.sub || decoded.userId || decoded.id;
    if (!userId) return next(new Error("unauthorized"));
    socket.data.userId = String(userId);
    next();
  });
});

/* ------------------------------------------------------------------ */
/* Connection lifecycle                                                */
/* ------------------------------------------------------------------ */
io.on("connection", (socket) => {
  const userId = socket.data.userId;

  // Personal notification channel — auto-joined, never client-joinable.
  socket.join(`user:${userId}`);
  console.log(`[gw] connect ${socket.id} user:${userId}`);

  socket.on("room:join", (room, ack) => {
    const done = typeof ack === "function" ? ack : () => {};
    if (typeof room !== "string" || !CLIENT_ROOM_RE.test(room)) {
      return done({ ok: false, error: "invalid room id" });
    }
    // Count only client-joined rooms (exclude socket's own sid room + user:<id>).
    let joined = 0;
    for (const r of socket.rooms) {
      if (r !== socket.id && r !== `user:${userId}`) joined++;
    }
    if (joined >= MAX_ROOMS_PER_SOCKET) {
      return done({ ok: false, error: "room limit reached (32)" });
    }
    socket.join(room, (err) => {
      if (err) return done({ ok: false, error: err.message });
      done({ ok: true });
    });
  });

  socket.on("room:leave", (room) => {
    if (typeof room === "string" && CLIENT_ROOM_RE.test(room)) {
      socket.leave(room);
    }
  });

  // Clients are receive-only: reject any attempt to emit a broadcast event.
  socket.onAny((event) => {
    if (ALLOWED_EVENTS.has(event) || event === "room:join" || event === "room:leave") {
      // room:join/leave are handled above; anything else in the allowlist
      // arriving as a client emit is forbidden.
      if (event !== "room:join" && event !== "room:leave") {
        console.warn(`[gw] REJECTED client emit "${event}" from ${socket.id}`);
        socket.emit("error:forbidden", { event });
      }
      return;
    }
    // Unknown events: ignore silently.
  });

  socket.on("disconnect", (reason) => {
    console.log(`[gw] disconnect ${socket.id} user:${userId} (${reason})`);
  });
});

/* ------------------------------------------------------------------ */
/* HTTP endpoints                                                      */
/* ------------------------------------------------------------------ */

/** Health check — browser-pingable. */
app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    uptime: Math.floor(process.uptime()),
    sockets: io.engine.clientsCount,
    rooms: io.sockets.adapter.rooms.size,
    time: new Date().toISOString(),
  });
});

/**
 * POST /emit — the publish endpoint the app's API routes call
 * (lib/realtime/emit.ts → REALTIME_EMIT_URL).
 *
 * Headers: x-api-key: <API_KEY>
 * Body:    { room: "room:<id>" | "user:<id>", event: string, payload: any }
 * Returns: { ok: true, recipients: <socket count in room> }
 */
app.post("/emit", (req, res) => {
  // Accept either auth style (the live gateway uses Bearer).
  const authHeader = req.get("authorization") || "";
  const bearerKey = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : null;
  const providedKey = bearerKey || req.get("x-api-key");
  if (providedKey !== API_KEY) {
    return res.status(401).json({ ok: false, error: "unauthorized" });
  }

  const { room, event, payload } = req.body || {};
  if (typeof room !== "string" || !EMIT_ROOM_RE.test(room)) {
    return res.status(400).json({ ok: false, error: "invalid room" });
  }
  if (typeof event !== "string" || !ALLOWED_EVENTS.has(event)) {
    return res
      .status(400)
      .json({ ok: false, error: `event "${event}" not in ALLOWED_EVENTS` });
  }
  const size = Buffer.byteLength(JSON.stringify(payload ?? null));
  if (size > MAX_PAYLOAD_BYTES) {
    return res
      .status(413)
      .json({ ok: false, error: `payload too large (${size} > 32768 bytes)` });
  }

  io.to(room).emit(event, payload);
  const recipients = io.sockets.adapter.rooms.get(room)?.size ?? 0;
  res.json({ ok: true, recipients });
});

/** 404 for anything else — the gateway serves nothing else by design. */
app.use((_req, res) => res.status(404).json({ ok: false, error: "not found" }));

httpServer.listen(PORT, () => {
  console.log(`[gw] realtime gateway listening on :${PORT}`);
  console.log(`[gw] allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
  console.log(`[gw] allowed events: ${Array.from(ALLOWED_EVENTS).join(", ")}`);
});
