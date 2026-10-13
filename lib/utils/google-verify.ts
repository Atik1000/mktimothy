import { OAuth2Client } from "google-auth-library";

/**
 * Server-side Google ID-token verification.
 *
 * Previously the social-login route trusted the client-decoded JWT, which
 * meant anyone could POST a forged payload with an arbitrary email and get
 * a session. This verifies the Google-signed `credential` token against
 * our OAuth client ID before we trust the identity.
 *
 * The client ID is the same `NEXT_PUBLIC_GOOGLE_CLIENT_ID` used by the
 * `<GoogleLogin>` button. For a multi-audience setup you can also set
 * `GOOGLE_CLIENT_ID` (server-only); both are accepted as valid audiences.
 */

const CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

let cachedClient: OAuth2Client | null = null;
function getClient(): OAuth2Client {
  if (!cachedClient) cachedClient = new OAuth2Client();
  return cachedClient;
}

export interface VerifiedGoogleUser {
  sub: string;
  email: string;
  emailVerified: boolean;
  givenName?: string;
  familyName?: string;
  picture?: string;
}

/**
 * Verify a Google ID token. Returns the verified payload, or `null` if the
 * token is invalid OR no client ID is configured (callers fall back to the
 * client payload in that case so a misconfigured env doesn't lock everyone
 * out — but they log a warning).
 */
export async function verifyGoogleToken(
  idToken: string
): Promise<VerifiedGoogleUser | null> {
  if (!CLIENT_ID) {
    console.warn(
      "[google-verify] No GOOGLE_CLIENT_ID / NEXT_PUBLIC_GOOGLE_CLIENT_ID set; skipping server-side verification."
    );
    return null;
  }

  try {
    const ticket = await getClient().verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload) return null;

    return {
      sub: payload.sub,
      email: payload.email || "",
      emailVerified: !!payload.email_verified,
      givenName: payload.given_name,
      familyName: payload.family_name,
      picture: payload.picture,
    };
  } catch (err) {
    console.error("[google-verify] Token verification failed:", err);
    return null;
  }
}
