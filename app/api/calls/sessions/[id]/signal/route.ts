import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { emitToRoom } from "@/lib/realtime/emit";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: { id: string } };

/**
 * GET /api/calls/sessions/[id]/signal
 * SSE stream of CallSignal rows. If ?mode=rest is passed, returns existing rows
 * as JSON immediately.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const currentUser = await auth(request);
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const session = await prisma.callSession.findUnique({
    where: { id: params.id },
    include: { schedule: true },
  });
  if (!session) {
    return new Response("Not found", { status: 404 });
  }

    const isAdmin = currentUser.role === "ADMIN";
    const isParty =
      session.schedule.callerId === currentUser.id ||
      session.schedule.calleeId === currentUser.id;
    // Admins may join as monitors; share-link guests (recorded in
    // session.participants by the join action) need the mailbox too —
    // without this their offers/answers/polls 403 and no media ever flows.
    const isGuest = ((session.participants as any[]) ?? []).some(
      (p) => p?.id === currentUser.id
    );
    if (!isAdmin && !isParty && !isGuest) {
      return new Response("Forbidden", { status: 403 });
    }

  const isRest = request.nextUrl.searchParams.get("mode") === "rest";

  if (isRest) {
    const signals = await prisma.callSignal.findMany({
      where: {
        sessionId: session.id,
        fromId: { not: currentUser.id },
        OR: [{ targetId: null }, { targetId: currentUser.id }],
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });
    
    if (signals.length > 0) {
      const signalIds = signals.map((s) => s.id);
      await prisma.callSignal.updateMany({
        where: { id: { in: signalIds } },
        data: { deliveredAt: new Date() },
      }).catch(() => {});
    }
    
    return NextResponse.json({ success: true, signals });
  }

  const encoder = new TextEncoder();
  let lastDeliveredId: string | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      send("ready", {
        userId: currentUser.id,
        role: currentUser.role,
        serverTime: new Date().toISOString(),
      });

      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keep-alive\n\n`));
        } catch {
          /* closed */
        }
      }, 12000);

      const poll = setInterval(async () => {
        try {
          // If the session has ended server-side, notify and stop.
          const fresh = await prisma.callSession.findUnique({
            where: { id: session.id },
            select: { status: true, endReason: true },
          });
          if (fresh && ["ENDED", "FAILED", "DECLINED"].includes(fresh.status)) {
            send("session-ended", {
              status: fresh.status,
              endReason: fresh.endReason,
            });
            clearInterval(poll);
            clearInterval(keepAlive);
            try {
              controller.close();
            } catch {}
            return;
          }

          // Fetch signals meant for THIS user: from someone else, and either
          // untargeted (broadcast) or targeted specifically to me. Filtering
          // target in the DB query (not just the loop) avoids skipped signals
          // clogging the result window and starving real deliveries.
          const where: any = {
            sessionId: session.id,
            fromId: { not: currentUser.id },
            OR: [{ targetId: null }, { targetId: currentUser.id }],
          };
          if (lastDeliveredId) {
            where.id = { gt: lastDeliveredId };
          } else {
            // First poll: only undelivered signals.
            where.deliveredAt = null;
          }

          const signals = await prisma.callSignal.findMany({
            where,
            orderBy: { createdAt: "asc" },
            take: 100,
          });

          // Batch the deliveredAt stamps instead of one UPDATE per signal
          // (which is slow and causes polling to lag behind signal creation).
          const signalIds = signals.map((s) => s.id);
          for (const s of signals) {
            send("signal", s);
            lastDeliveredId = s.id;
          }
          if (signalIds.length > 0) {
            await prisma.callSignal
              .updateMany({
                where: { id: { in: signalIds } },
                data: { deliveredAt: new Date() },
              })
              .catch(() => {});
          }

          // Clean up: delete delivered signals older than 2 minutes so the
          // table doesn't grow unbounded and clog the polling query.
          if (signals.length > 0) {
            prisma.callSignal
              .deleteMany({
                where: {
                  sessionId: session.id,
                  deliveredAt: { not: null, lt: new Date(Date.now() - 2 * 60 * 1000) },
                },
              })
              .catch(() => {});
          }
        } catch (err) {
          console.error("[calls/signal] poll error:", err);
        }
      }, 1000);

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        clearInterval(poll);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

/**
 * POST /api/calls/sessions/[id]/signal
 * Write a signaling message to the mailbox.
 * Body: { type: "OFFER"|"ANSWER"|"ICE"|"RENEGOTIATE"|"MEDIA_STATE",
 *         payload: any, targetId?: string }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await auth(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const session = await prisma.callSession.findUnique({
      where: { id: params.id },
      include: { schedule: true },
    });
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const isAdmin = currentUser.role === "ADMIN";
    const isParty =
      session.schedule.callerId === currentUser.id ||
      session.schedule.calleeId === currentUser.id;
    // Guests (share-link joiners in session.participants) may post signals —
    // their OFFER/ANSWER/ICE/leave broadcasts are legitimate call traffic.
    const isGuest = ((session.participants as any[]) ?? []).some(
      (p) => p?.id === currentUser.id
    );
    if (!isAdmin && !isParty && !isGuest) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const type = body?.type as string | undefined;
    if (!type) {
      return NextResponse.json({ error: "type is required" }, { status: 400 });
    }

    const signal = await prisma.callSignal.create({
      data: {
        sessionId: session.id,
        fromId: currentUser.id,
        targetId: body?.targetId ?? null,
        type: type as any,
        payload: body?.payload ?? {},
      },
    });

    // Realtime relay: push the signal to the recipient(s)' personal channel
    // (`user:<id>`) via the gateway. No-ops when the gateway publish endpoint
    // isn't configured — the CallSignal row above remains the fallback
    // mailbox for any client still reading via SSE.
    const gatewayEvent =
      type === "OFFER" || type === "RENEGOTIATE"
        ? "webrtc:offer"
        : type === "ANSWER"
          ? "webrtc:answer"
          : type === "ICE"
            ? "webrtc:ice"
            : type === "MEDIA_STATE"
              ? "webrtc:media-state"
              : type === "END"
                ? "webrtc:end"
                : null;

    if (gatewayEvent) {
      const pushPayload = {
        callId: session.id,
        fromId: currentUser.id,
        data: body?.payload ?? {},
        sigId: signal.id,
      };
      const recipients = new Set<string>();
      if (body?.targetId) {
        recipients.add(String(body.targetId));
      } else {
        // Broadcast: both parties + any joined admin monitors, minus sender.
        recipients.add(session.schedule.callerId);
        recipients.add(session.schedule.calleeId);
        const parts = session.participants as any[];
        if (Array.isArray(parts)) {
          parts.forEach((p) => p?.id && recipients.add(p.id));
        }
      }
      recipients.delete(currentUser.id);
      // Awaited — Vercel drops un-awaited work after the response is sent,
      // and signaling must be delivered.
      for (const userId of Array.from(recipients)) {
        await emitToRoom(`user:${userId}`, gatewayEvent, pushPayload);
      }
    }

    return NextResponse.json({ success: true, signal });
  } catch (error) {
    console.error("[calls/signal] POST error:", error);
    return NextResponse.json(
      { error: "Failed to write signal" },
      { status: 500 }
    );
  }
}
