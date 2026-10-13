# Realtime WebSocket Implementation — Complete Guide

**Status:** App side implemented & type-checked. Gateway reference implementation in [`../ws-gateway/`](../ws-gateway/README.md). This document contains everything needed to finish, deploy, test, and operate the system.

---

## 1. Architecture

```
Browser (Next.js app on Vercel)
  │ 1 persistent Socket.IO connection (wss://) ──────────────┐
  │    auth: short-lived gateway JWT (sub = userId)           │
  │    receives ONLY: message/call/webrtc events              ▼
  │                                        VPS — ws-gateway (PM2 + Nginx)
  │  REST POSTs (send/edit/delete/signal)          │ rooms: user:<id>, room:<id>
  ▼                                                ▲
Vercel API routes (auth → validate → Postgres)     │ POST /emit (x-api-key)
  └─ after every mutation → lib/realtime/emit.ts ──┘
```

**Principles**

1. **DB is the source of truth.** Sockets only carry notifications; on every reconnect clients backfill from the API (`?after=<lastTs>`), so missed events never lose data.
2. **Clients are receive-only.** The gateway rejects client emits. All fan-out happens server-side via `POST /emit` with an API key.
3. **Zero polling.** All former pollers (5s messages, 3s ring, 10s unread, 10s rooms, 1s WebRTC-signal SSE) are deleted. Vercel load drops to real mutations only.

---

## 2. Component map

### Already in the app (done)

| File | Role |
|---|---|
| `lib/realtime/socket.ts` | Shared client socket: lazy connect, `/api/realtime/token` handshake, auto room re-join on reconnect, token refresh on `unauthorized`. Exports `useRealtime()`, `joinRoom()`, `leaveRoom()`, `disconnectRealtime()` |
| `app/api/realtime/token/route.ts` | Mints 12h `{ sub: userId }` JWT with `GATEWAY_JWT_SECRET` |
| `lib/realtime/emit.ts` | Server publish helper: `emitToRoom()` + chat fan-out helpers (`pushNewMessage`, `pushMessageUpdated`, `pushMessageDeleted`, `pushRoomCleared`). **No-ops until `REALTIME_EMIT_URL` + `REALTIME_API_KEY` are set** |
| `components/chat/hooks/useChat.ts` | Room messages: `room:join` + `message:new/updated/deleted` + backfill on reconnect. `useRooms`: `room:updated` + focus refresh (10s poll deleted) |
| `components/chat/hooks/useIncomingCall.ts` | `call:incoming` doorbell → hydrate full session via API; `webrtc:end` clears ring; stale-ring re-check only while ringing (3s poll + TEMP_FIX deleted — calls ring on every page again) |
| `components/chat/hooks/useMessageNotification.ts` | `unread:updated` push → badge + chime (10s poll + TEMP_FIX deleted) |
| `components/chat/hooks/useCallSignaling.ts` | WebRTC signaling receive: `webrtc:offer/answer/ice/media-state/end` on `user:<id>` (SSE EventSource deleted). Sending still POSTs to `/api/calls/sessions/[id]/signal` |
| `app/api/chat/rooms/[id]/messages/route.ts` | POST → `pushNewMessage` |
| `app/api/chat/messages/[messageId]/route.ts` | PATCH / DELETE(everyone) → `pushMessageUpdated` |
| `app/api/calls/sessions/route.ts` | POST (RINGING created) → `call:incoming` to other party |
| `app/api/calls/sessions/[id]/signal/route.ts` | POST → relays each signal as `webrtc:*` to `user:<targetId>` (broadcast: caller+callee+joined monitors) |

### Gateway (VPS) — `ws-gateway/`

| File | Role |
|---|---|
| `server.js` | The full gateway: JWT handshake auth, auto-join `user:<id>`, `room:join/leave` (regex `room:[a-zA-Z0-9/_-]{1,64}`, max 32 rooms), event allowlist, 32KB payload cap, heartbeat 25s/20s, connection-state-recovery <2min, **`POST /emit`** (Bearer **or** x-api-key) — the publish endpoint the app calls, `GET /health` |
| `package.json` / `.env.example` / `ecosystem.config.js` (PM2) / `nginx-relay.conf` / `README.md` | Deploy kit — see README for the exact command sequence |

> If `relay.quickwebs.site` is already run by your DevOps team, hand them `ws-gateway/server.js` — it implements the brief exactly **plus the `/emit` endpoint, which the brief never documented.** That missing endpoint is why pushes don't work yet.

---

## 3. Environment variables

| Var | Where | Value | Status |
|---|---|---|---|
| `NEXT_PUBLIC_REALTIME_URL` | app (local `.env` + Vercel) | `https://relay.quickwebs.site` | ✅ set locally — **add to Vercel, then redeploy** (NEXT_PUBLIC_* is inlined at build time) |
| `GATEWAY_JWT_SECRET` | app (Vercel) + gateway (`JWT_SECRET`) | the shared secret | ✅ set locally — add to Vercel; must match gateway's `JWT_SECRET` |
| `REALTIME_EMIT_URL` | app (Vercel) | `https://relay.quickwebs.site/emit` | ⏳ add once gateway `/emit` exists |
| `REALTIME_API_KEY` | app (Vercel) + gateway (`API_KEY`) | `openssl rand -base64 36` | ⏳ generate once, set on both sides |
| `ALLOWED_ORIGINS` | gateway `.env` | `http://localhost:3000,https://mktimothy.com,https://www.mktimothy.com` (+ any Vercel preview domains you test on) | set in gateway `.env` |

---

## 4. Event contract

| Event | Room | Payload | Producer (API route) | Consumer (client) |
|---|---|---|---|---|
| `message:new` | `room:<roomId>` | full message row (with `sender`, `replyTo`) | POST `/api/chat/rooms/[id]/messages` | `useChat` → append/dedupe |
| `message:updated` | `room:<roomId>` | updated/tombstone row | PATCH / DELETE(everyone) `/api/chat/messages/[messageId]` | `useChat` → replace |
| `message:deleted` | `room:<roomId>` | `{ id }` — or `{ id: null, roomId }` = cleared chat | (helper ready; clear-chat is per-user today) | `useChat` → remove / clear |
| `room:updated` | `user:<userId>` | `{ roomId }` | POST message (per other participant) | `useRooms` → refresh list |
| `unread:updated` | `user:<userId>` | `{ count }` (total, same math as GET /api/chat/rooms) | POST message (per other participant) | `useMessageNotification` → badge + chime |
| `call:incoming` | `user:<userId>` | `{ callId, from, callType }` — doorbell; client hydrates via API | POST `/api/calls/sessions` (RINGING created) | `useIncomingCall` → hydrate → ring |
| `webrtc:offer` | `user:<peerId>` | `{ callId, fromId, data: SDP, sigId? }` | POST `.../signal` (OFFER/RENEGOTIATE) | `useCallSignaling` |
| `webrtc:answer` | `user:<peerId>` | `{ callId, fromId, data: SDP, sigId? }` | POST `.../signal` (ANSWER) | `useCallSignaling` |
| `webrtc:ice` | `user:<peerId>` | `{ callId, fromId, data: candidate, sigId? }` | POST `.../signal` (ICE) | `useCallSignaling` |
| `webrtc:media-state` | `user:<peerId>` | `{ callId, fromId, data: { audio?, video? } }` | POST `.../signal` (MEDIA_STATE) | `useCallSignaling` → custom event |
| `webrtc:end` | `user:<peerId>` | `{ callId, data: { reason? } }` | POST `.../signal` (END) | `useCallSignaling` → teardown; `useIncomingCall` → clear ring |
| `typing:start/stop`, `presence:updated`, `call:cancelled` | room / user | reserved | future wiring | future |

**Payload cap:** 32KB — send references (ids), never blobs. Media never crosses the gateway.

---

## 5. Key flows

**Send a message**
```
A: POST /api/chat/rooms/:id/messages → 201 row in Postgres
route → POST /emit room:room:<id>  message:new      → B's open ChatWindow appends instantly
route → POST /emit user:<B>        unread:updated   → B's badge updates (+ chime)
route → POST /emit user:<B>        room:updated     → B's chat list re-sorts
```

**Incoming call**
```
A starts call → POST /api/calls/sessions creates RINGING
route → POST /emit user:<B> call:incoming   → B's useIncomingCall hydrates via
        GET /api/calls/sessions?status=RINGING → IncomingCallOverlay rings on ANY page
B accepts → CallView → useCallSignaling:
   OFFER/ANSWER/ICE  : POST .../signal → /emit user:<peer> webrtc:* → other side applies
   media stays P2P (RTCPeerConnection, STUN only) — gateway never touches it
```

**Reconnect (laptop sleep, network drop)**
```
socket.io auto-reconnects (token auto-refreshed if expired)
gateway: connection-state-recovery restores missed events <2min where possible
client  : on "connect" → GET messages?after=<lastTs> + GET rooms + GET sessions
           → DB is truth; UI catches up in one round-trip
```

---

## 6. Deploy order (do it in this sequence)

1. **VPS gateway** — follow `ws-gateway/README.md` (Node → npm i → `.env` → PM2 → Nginx → certbot → ufw).
2. **Verify gateway alone:**
   ```bash
   curl https://relay.quickwebs.site/health          # {"ok":true,...}
   # NOTE: the live gateway authenticates /emit with a Bearer token (verified)
   curl -X POST https://relay.quickwebs.site/emit \
     -H "Authorization: Bearer <REALTIME_API_KEY>" -H "Content-Type: application/json" \
     -d '{"room":"user:test","event":"webrtc:end","payload":{"callId":"x"}}'
   # {"ok":true,...}   ← auth + allowlist working
   ```
3. **Vercel env vars:** `NEXT_PUBLIC_REALTIME_URL`, `GATEWAY_JWT_SECRET`, `REALTIME_EMIT_URL`, `REALTIME_API_KEY` → **redeploy** (client env is baked at build).
4. **Local test** (localhost:3000 is already an allowed origin).
5. **Staging/prod E2E** — checklist below.
6. **Watch:** Vercel function invocations (should collapse), `pm2 logs ws-gateway`.

## 7. Test plan (two browsers, A and B, different accounts)

| # | Action | Expected |
|---|---|---|
| 1 | Load app, devtools → Network → WS | One connection to `relay.quickwebs.site`, stays 101 Switching Protocols, frames only on activity |
| 2 | A → B: send message (B on /messages, chat open) | Appears instantly, no network request to `/messages` poller |
| 3 | B on the **homepage** | FloatingChatButton badge increments + chime (TEMP_FIX era is over) |
| 4 | A edits / deletes-for-everyone | B's open chat updates within ~1s |
| 5 | A → new chat with B | B's chat list re-sorts via `room:updated` |
| 6 | A starts a video call | B gets the full-screen ring on a **non**-/messages page; accept → audio/video flows (P2P) |
| 7 | During call: mute, hang up | MEDIA_STATE + END propagate; both sides tear down |
| 8 | Kill B's wifi 10s, restore | Socket reconnects; B's chat backfills everything missed |
| 9 | Leave B idle 10+ min | No periodic requests in B's network tab — only heartbeats on the WS frame |
| 10 | DevTools console on both | Zero `[realtime] emit ... failed` logs; zero `connect_error unauthorized` |

## 8. Rollback

Everything degrades gracefully: unset `REALTIME_EMIT_URL`/`REALTIME_API_KEY` → pushes stop but the app keeps working (initial loads, focus refresh, all REST actions). To fully revert, `git revert` the integration commit — no schema changes were made.

## 9. Troubleshooting

| Symptom | Cause → fix |
|---|---|
| `connect_error: unauthorized` | `GATEWAY_JWT_SECRET` ≠ gateway `JWT_SECRET` → make them identical; also check `/api/realtime/token` returns 200 (is `GATEWAY_JWT_SECRET` set on Vercel?) |
| Socket connects, nothing arrives | `REALTIME_EMIT_URL`/`REALTIME_API_KEY` unset → API pushes silently no-op (by design). Set them + redeploy |
| `/emit` returns `event "..." not in ALLOWED_EVENTS` | Event not in the gateway allowlist → add to `ALLOWED_EVENTS` in `server.js` + `pm2 restart` |
| Handshake fails cross-origin | Add the site origin to `ALLOWED_ORIGINS` in gateway `.env` (matters for polling fallback + recovery; pure websocket transport ignores CORS) |
| Works local, not prod | `NEXT_PUBLIC_*` is build-time → env var added after build requires a redeploy |
| Dropped events after long offline | Expected >2min — client backfills from DB on reconnect; verify `lastTsRef` backfill ran |
| Ring appears but no session data | Doorbell arrived but hydrate failed → check `/api/calls/sessions?status=RINGING` response in the network tab |

## 10. After stabilization (1–2 weeks clean)

- Delete the now-unused SSE routes: `app/api/chat/rooms/[id]/stream/route.ts` and the **GET** handler in `app/api/calls/sessions/[id]/signal/route.ts` (these were the Vercel CPU killers).
- Decide the `CallSignal` table's fate: POSTs still write rows as a fallback mailbox. Either keep + add a cleanup cron, or stop writing when you trust the gateway (one-line change in the signal route).
- `grep -r "TEMP_FIX"` should return nothing.

## 11. Future wiring (already allowed by the gateway)

- **Typing indicators:** `POST /api/chat/rooms/:id/typing` route → `/emit room:<room> typing:start/stop { userId }`; `useChat` renders "typing…" (debounce 3s).
- **Presence:** on connect/disconnect the gateway can `/emit` presence per room, or the app tracks `presence:updated` on `user:<id>`; chat header shows online/last-seen.
- **Multi-tab:** the singleton already shares one socket across tabs per browser session.
