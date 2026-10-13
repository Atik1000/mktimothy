import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ─── Domain Configuration ──────────────────────────────────────────────────
// The hostname(s) that belong to the admin panel.
// Update this list when you add the Vercel domain.
const ADMIN_HOSTNAMES = [
  "1420.mktimothy.com",
  "1420-mktimothy.vercel.app",
  "localhost:3000",
  // Add more admin domains here if needed
];

// Dashboard path prefix (the route group folder is "(dashboard)" but Next.js
// exposes pages inside it at real path segments like /dashboard, /analytics, etc.)
const DASHBOARD_PATHS = [
  "/dashboard",
  "/analytics",
  "/categories",
  "/listings",
  "/comments",
  "/blog",
  "/users",
  "/moderator-assignments",
  "/chats",
  "/whatsapp-chatbot",
  "/calls",
  "/filters",
  "/history",
  "/moderation",
  "/saved"
];

// ─── Route Categories ───────────────────────────────────────────────────────
const ADMIN_API_PATHS = ["/api/admin"];

const PUBLIC_API_PATHS = [
  "/api/listings",
  "/api/blogs",
  "/api/categories",
  "/api/sectors",
  "/api/search",
  "/api/debug",
  "/api/image-proxy",
  "/api/auth",
  "/api/otp",
  "/api/pitch-idea",
  "/api/investors",
  "/api/whatsapp/webhook",
];

// ─── Helpers ────────────────────────────────────────────────────────────────
function isAdminHost(request: NextRequest): boolean {
  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    "";
  // Strip port for local dev comparison
  const hostname = host.split(":")[0];
  return ADMIN_HOSTNAMES.some((h) => hostname === h);
}

function isDashboardPath(pathname: string): boolean {
  return DASHBOARD_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
}

function getAdminRole(token: string): string | null {
  // Lightweight decode of the JWT payload (no verification — the API routes
  // still verify the full signature). We just need the role claim here.
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const payload = JSON.parse(
      Buffer.from(payloadBase64, "base64url").toString("utf-8")
    );
    return payload?.role ?? null;
  } catch {
    return null;
  }
}

// ─── Middleware ──────────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow static assets and Next.js internals through
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot)$/)
  ) {
    return NextResponse.next();
  }

  // Always allow webhook through (no auth required)
  if (pathname.startsWith("/api/whatsapp/webhook")) {
    return NextResponse.next();
  }

  // ── Get token ───────────────────────────────────────────────────────────
  const token =
    request.cookies.get("auth-token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  const isAuthenticated = !!token;
  const role = token ? getAdminRole(token) : null;
  const isAdmin = role === "ADMIN" || role === "MODERATOR";

  // ── ADMIN DOMAIN RULES ───────────────────────────────────────────────────
  if (isAdminHost(request)) {
    // /api/admin routes: require auth, allow through for admin checks
    if (pathname.startsWith("/api/admin")) {
      if (!isAuthenticated) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      return addAuthHeader(request, token!);
    }

    // All other API routes: allow
    if (pathname.startsWith("/api/")) {
      return addAuthHeader(request, token);
    }

    // /login on admin domain: if already logged in as admin → dashboard
    if (pathname === "/login") {
      if (isAuthenticated && isAdmin) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      // Not logged in → show the login page
      return NextResponse.next();
    }

    // Dashboard pages: must be logged in AND be an admin/moderator
    if (isDashboardPath(pathname)) {
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      if (!isAdmin) {
        // Logged in but not an admin — kick back to login with an error hint
        return NextResponse.redirect(
          new URL("/login?error=forbidden", request.url)
        );
      }
      return addAuthHeader(request, token!);
    }

    // Any other page on the admin domain: redirect unauthenticated to /login,
    // and authenticated admins to /dashboard (they shouldn't be browsing the
    // main site on the admin domain). Exceptions made for profile, project, and blog viewing.
    if (
      pathname.startsWith("/profile") ||
      pathname.startsWith("/project") ||
      pathname.startsWith("/blog-details")
    ) {
      if (!isAuthenticated) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
      return addAuthHeader(request, token!);
    }

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ── MAIN DOMAIN RULES ────────────────────────────────────────────────────

  // Allow admin/moderator to access dashboard pages on the main domain.
  // Block dashboard pages on the main domain for normal users.
  if (isDashboardPath(pathname)) {
    if (isAuthenticated && isAdmin) {
      return addAuthHeader(request, token!);
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Allow /api/admin on the main domain ONLY for admins/moderators
  if (ADMIN_API_PATHS.some((p) => pathname.startsWith(p))) {
    if (isAuthenticated && isAdmin) {
      return addAuthHeader(request, token!);
    }
    return NextResponse.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  // Auth routes (/login, /sign-up, /otp): if already logged in redirect home
  const authRoutes = ["/login", "/sign-up", "/otp"];
  if (authRoutes.some((r) => pathname.startsWith(r)) && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protected routes that need auth
  const protectedRoutes = ["/profile", "/api/auth/logout"];
  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r));
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Public API routes: always allow
  if (PUBLIC_API_PATHS.some((p) => pathname.startsWith(p))) {
    return addAuthHeader(request, token);
  }

  // Other API routes: require auth
  if (pathname.startsWith("/api/") && !isAuthenticated) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  return addAuthHeader(request, token);
}

// Injects the Bearer token into the forwarded request headers so API routes
// don't have to re-read the cookie themselves.
function addAuthHeader(
  request: NextRequest,
  token: string | null | undefined
): NextResponse {
  if (token && !request.headers.get("authorization")) {
    const headers = new Headers(request.headers);
    headers.set("authorization", `Bearer ${token}`);
    return NextResponse.next({ request: { headers } });
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)",
  ],
};
