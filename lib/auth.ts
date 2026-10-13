import { NextRequest } from "next/server";
import { User } from "./config/database";
import { extractTokenFromRequest, verifyAuthToken } from "./middleware/auth";

/**
 * Simple auth function for API routes
 * Returns the authenticated user or null if not authenticated
 */
export async function auth(request?: NextRequest): Promise<User | null> {
  try {
    // If no request is provided, check for cookies in the current context
    let token: string | null = null;

    if (request) {
      token = extractTokenFromRequest(request);
    } else {
      // For server-side usage, try to get token from headers/cookies
      // This might need to be adjusted based on your setup
      const { headers, cookies } = await import("next/headers");

      try {
        const authHeader = headers().get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7);
        } else {
          const cookieStore = cookies();
          const tokenCookie = cookieStore.get("auth-token");
          if (tokenCookie) {
            token = tokenCookie.value;
          }
        }
      } catch (error) {
        // Headers/cookies might not be available in some contexts
        console.log("Could not access headers/cookies:", error);
        return null;
      }
    }

    if (!token) {
      return null;
    }

    const { valid, user } = await verifyAuthToken(token);

    if (!valid || !user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

/**
 * Auth function that requires authentication and throws if not authenticated
 */
export async function requireAuth(request?: NextRequest): Promise<User> {
  const user = await auth(request);

  if (!user) {
    throw new Error("Authentication required");
  }

  return user;
}

/**
 * Get current user from request in API routes
 */
export async function getCurrentUser(
  request: NextRequest
): Promise<User | null> {
  return await auth(request);
}
