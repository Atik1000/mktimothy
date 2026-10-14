import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import https from "node:https";

// Server-side proxy to the WhatsApp chatbot backend. The API key never reaches
// the browser. Env: CHATBOT_BASE_URL, CHATBOT_API_KEY, CHATBOT_API_KEY_HEADER.
const BASE_URL = (process.env.CHATBOT_BASE_URL || "https://ai.mktimothy.com").replace(/\/$/, "");

function upstreamHeaders(extra: Record<string, string> = {}) {
  const headers: Record<string, string> = { ...extra };
  if (process.env.CHATBOT_API_KEY) {
    headers[process.env.CHATBOT_API_KEY_HEADER || "x-api-key"] = process.env.CHATBOT_API_KEY;
  }
  return headers;
}

// The backend expects a JSON body on some GET endpoints (see Postman). fetch()
// forbids GET bodies, so those go through node:https.
function getWithBody(path: string, body: unknown): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = https.request(
      BASE_URL + path,
      {
        method: "GET",
        headers: upstreamHeaders({
          "Content-Type": "application/json",
          "Content-Length": String(Buffer.byteLength(payload)),
        }),
      },
      (res) => {
        let raw = "";
        res.on("data", (c) => (raw += c));
        res.on("end", () => {
          let data: any = raw;
          try { data = JSON.parse(raw); } catch {}
          resolve({ status: res.statusCode || 500, data });
        });
      }
    );
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function parse(res: Response) {
  const text = await res.text();
  try { return JSON.parse(text); } catch { return text; }
}

const GET_ROUTES: Record<string, string> = {
  contacts: "/get_all_contacts",
  templates: "/get_all_templates",
};
const GET_WITH_BODY_ROUTES: Record<string, string> = {
  history: "/get_message_history",
  autoBotStatus: "/check_auto_bot_status",
  timeframe: "/check_last_message_timeframe",
};

export async function POST(request: NextRequest) {
  try {
    const user = await auth(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";

    // Admin message (text/media) — multipart form-data, forwarded as-is.
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const res = await fetch(`${BASE_URL}/admin/whatsapp/send`, {
        method: "POST",
        headers: upstreamHeaders(),
        body: form,
      });
      return NextResponse.json(await parse(res), { status: res.status });
    }

    const { action, ...payload } = await request.json();

    if (GET_ROUTES[action]) {
      const res = await fetch(BASE_URL + GET_ROUTES[action], { headers: upstreamHeaders() });
      return NextResponse.json(await parse(res), { status: res.status });
    }

    if (GET_WITH_BODY_ROUTES[action]) {
      const { status, data } = await getWithBody(GET_WITH_BODY_ROUTES[action], {
        wp_number: payload.wp_number,
      });
      return NextResponse.json(data, { status });
    }

    if (action === "sendTemplate" || action === "toggleAutoBot") {
      const path = action === "sendTemplate" ? "/send_template_message" : "/turn_off_on_auto_bot";
      const res = await fetch(BASE_URL + path, {
        method: "POST",
        headers: upstreamHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(
          action === "toggleAutoBot"
            ? { wp_number: payload.wp_number, action: payload.bot_action }
            : payload
        ),
      });
      return NextResponse.json(await parse(res), { status: res.status });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("[admin/whatsapp-chatbot] error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
