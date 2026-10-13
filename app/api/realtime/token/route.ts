import { auth } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/realtime/token
 *
 * Mints a short-lived token for the realtime gateway (Socket.IO relay)
 * handshake. The gateway validates the signature with the shared
 * GATEWAY_JWT_SECRET and reads the user id from the `sub` claim — it then
 * auto-joins the socket to `user:<id>` (personal notification channel).
 *
 * We mint a dedicated token (instead of reusing the app's auth-token) so the
 * gateway secret stays independent of the main JWT_SECRET.
 */
export async function GET(request: NextRequest) {
  try {
    const currentUser = await auth(request);
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const secret = process.env.GATEWAY_JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "Realtime gateway not configured" },
        { status: 503 }
      );
    }

    const token = jwt.sign(
      { sub: currentUser.id, userId: currentUser.id },
      secret,
      { expiresIn: "12h" }
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error("[realtime/token] error:", error);
    return NextResponse.json(
      { error: "Failed to mint realtime token" },
      { status: 500 }
    );
  }
}
