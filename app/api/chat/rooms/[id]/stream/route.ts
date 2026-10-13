import { auth } from "@/lib/auth";
import { prisma } from "@/lib/config/database";
import { canAccessRoom } from "@/lib/utils/chat";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type RouteParams = { params: { id: string } };

/**
 * GET /api/chat/rooms/[id]/stream
 * Server-Sent Events stream of new/edited messages in a room.
 *
 * The server polls the database every 2s for messages newer than the last
 * delivered timestamp and pushes them as `event: message` frames. On
 * platforms that cap request duration (e.g. Vercel), EventSource reconnects
 * automatically and re-issues this request; the client sends `?after=<ts>`
 * so we resume from where we left off.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const currentUser = await auth(request);
  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const room = await prisma.chatRoom.findUnique({
    where: { id: params.id },
  });

  if (!room || !room.isActive) {
    return new Response("Not found", { status: 404 });
  }

  if (!canAccessRoom(currentUser, room.participants)) {
    return new Response("Forbidden", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const afterParam = searchParams.get("after");
  let lastDeliveredAt = afterParam ? new Date(afterParam) : new Date(0);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Initial hello — confirms auth + gives client the resume cursor.
      send("ready", { serverTime: new Date().toISOString() });

      // Periodic keep-alive comment so intermediaries don't close idle conns.
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: keep-alive\n\n`));
        } catch {
          /* closed */
        }
      }, 15000);

      // Poll loop.
      const poll = setInterval(async () => {
        try {
          const messages = await prisma.chatMessage.findMany({
            where: { roomId: room.id, updatedAt: { gt: lastDeliveredAt } },
            orderBy: { updatedAt: "asc" },
            take: 100,
            include: {
              sender: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                  role: true,
                },
              },
              replyTo: {
                select: {
                  id: true,
                  content: true,
                  type: true,
                  sender: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          });

          let filteredMessages = messages.filter((m) => {
            const deletedFor = (m.deletedFor as string[]) || [];
            return !deletedFor.includes(currentUser.id);
          });

          filteredMessages = filteredMessages.map((m) => {
            if (m.isDeletedForEveryone && currentUser.role !== "ADMIN") {
              return {
                ...m,
                content: "",
                fileUrl: null,
                fileName: null,
              };
            }
            return m;
          });

          for (const m of filteredMessages) {
            send("message", m);
          }
          
          for (const m of messages) {
            if (m.updatedAt > lastDeliveredAt) {
              lastDeliveredAt = m.updatedAt;
            }
          }
        } catch (err) {
          console.error("[chat/stream] poll error:", err);
        }
      }, 2000);

      // Clean up when the client disconnects (EventSource closes).
      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive);
        clearInterval(poll);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable nginx buffering
    },
  });
}
