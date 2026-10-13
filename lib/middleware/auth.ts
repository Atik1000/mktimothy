import { NextRequest, NextResponse } from "next/server";
import { dbHelpers, type User } from "../config/database";
import { authService } from "../services/auth";

// Types
export interface AuthenticatedRequest extends NextRequest {
  user?: User;
  token?: string;
}

export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  requireVerification?: boolean;
  allowedRoles?: string[];
  requireTwoFactor?: boolean;
}

// JWT token extraction from request
export function extractTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Check cookies
  const tokenCookie = request.cookies.get("auth-token");
  if (tokenCookie) {
    return tokenCookie.value;
  }

  return null;
}

// Verify JWT token and get user
export async function verifyAuthToken(token: string): Promise<{
  valid: boolean;
  user?: User;
  error?: string;
}> {
  try {
    const result = await authService.verifyToken(token);
    return result;
  } catch (error) {
    console.error("Token verification error:", error);
    return { valid: false, error: "Invalid token" };
  }
}

// Main authentication middleware
export async function authMiddleware(
  request: NextRequest,
  options: AuthMiddlewareOptions = {}
): Promise<{
  success: boolean;
  user?: User;
  response?: NextResponse;
  error?: string;
}> {
  const {
    requireAuth = true,
    requireVerification = true,
    allowedRoles = [],
    requireTwoFactor = false,
  } = options;

  try {
    // Extract token
    const token = extractTokenFromRequest(request);

    if (!token) {
      if (requireAuth) {
        return {
          success: false,
          error: "Authentication required",
          response: NextResponse.json(
            { error: "Authentication required", code: "AUTH_REQUIRED" },
            { status: 401 }
          ),
        };
      }
      return { success: true };
    }

    // Verify token
    const { valid, user, error } = await verifyAuthToken(token);

    if (!valid || !user) {
      return {
        success: false,
        error: error || "Invalid token",
        response: NextResponse.json(
          { error: "Invalid or expired token", code: "INVALID_TOKEN" },
          { status: 401 }
        ),
      };
    }

    // Check account status
    if (!user.isActive) {
      return {
        success: false,
        error: "Account inactive",
        response: NextResponse.json(
          {
            error: "Account is suspended or inactive",
            code: "ACCOUNT_INACTIVE",
          },
          { status: 403 }
        ),
      };
    }

    // Check email verification
    if (requireVerification && !user.emailVerified) {
      return {
        success: false,
        error: "Email verification required",
        response: NextResponse.json(
          {
            error: "Email verification required",
            code: "EMAIL_VERIFICATION_REQUIRED",
            userId: user.id,
          },
          { status: 403 }
        ),
      };
    }

    // Check role-based access
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return {
        success: false,
        error: "Insufficient permissions",
        response: NextResponse.json(
          {
            error: "Insufficient permissions",
            code: "INSUFFICIENT_PERMISSIONS",
          },
          { status: 403 }
        ),
      };
    }

    // Check two-factor authentication
    // Note: The current User type doesn't have a two_factor_enabled field
    // This functionality can be added later when 2FA is implemented
    if (requireTwoFactor) {
      // This would need additional logic to check if 2FA was completed in this session
      // For now, we'll assume it's handled during login
    }

    return { success: true, user };
  } catch (error) {
    console.error("Auth middleware error:", error);
    return {
      success: false,
      error: "Authentication failed",
      response: NextResponse.json(
        { error: "Authentication failed", code: "AUTH_FAILED" },
        { status: 500 }
      ),
    };
  }
}

// Role-based middleware helpers
export const requireAdmin = (request: NextRequest) =>
  authMiddleware(request, { allowedRoles: ["ADMIN", "SUPER_ADMIN"] });

export const requireModerator = (request: NextRequest) =>
  authMiddleware(request, {
    allowedRoles: ["ADMIN", "SUPER_ADMIN", "MODERATOR"],
  });

export const requireBusinessOwner = (request: NextRequest) =>
  authMiddleware(request, {
    allowedRoles: ["ADMIN", "SUPER_ADMIN", "BUSINESS_OWNER"],
  });

export const requireVerifiedUser = (request: NextRequest) =>
  authMiddleware(request, { requireVerification: true });

// Optional authentication (for public endpoints that can benefit from user context)
export const optionalAuth = (request: NextRequest) =>
  authMiddleware(request, { requireAuth: false });

// Rate limiting middleware
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> =
    new Map();

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier);

    if (!userRequests || now > userRequests.resetTime) {
      // Reset or initialize
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    if (userRequests.count >= this.maxRequests) {
      return false;
    }

    userRequests.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const userRequests = this.requests.get(identifier);
    if (!userRequests || Date.now() > userRequests.resetTime) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - userRequests.count);
  }

  getResetTime(identifier: string): number {
    const userRequests = this.requests.get(identifier);
    if (!userRequests || Date.now() > userRequests.resetTime) {
      return Date.now() + this.windowMs;
    }
    return userRequests.resetTime;
  }
}

// Global rate limiters
export const authRateLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 requests per 15 minutes
export const apiRateLimiter = new RateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes
export const uploadRateLimiter = new RateLimiter(10, 60 * 1000); // 10 uploads per minute

// Rate limiting middleware
export function rateLimitMiddleware(
  request: NextRequest,
  limiter: RateLimiter,
  identifier?: string
): NextResponse | null {
  const clientId =
    identifier ||
    request.ip ||
    request.headers.get("x-forwarded-for") ||
    "unknown";

  if (!limiter.isAllowed(clientId)) {
    const resetTime = limiter.getResetTime(clientId);
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

    return NextResponse.json(
      {
        error: "Too many requests",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": limiter["maxRequests"].toString(),
          "X-RateLimit-Remaining": limiter
            .getRemainingRequests(clientId)
            .toString(),
          "X-RateLimit-Reset": resetTime.toString(),
        },
      }
    );
  }

  return null;
}

// CORS middleware
export function corsMiddleware(request: NextRequest): NextResponse | null {
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGINS || "*",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  return null;
}

// Security headers middleware
export function securityHeadersMiddleware(): Record<string, string> {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  };
}

// Device fingerprinting for security
export function getDeviceFingerprint(request: NextRequest): {
  userAgent: string;
  ip: string;
  acceptLanguage: string;
  acceptEncoding: string;
} {
  return {
    userAgent: request.headers.get("user-agent") || "unknown",
    ip: request.ip || request.headers.get("x-forwarded-for") || "unknown",
    acceptLanguage: request.headers.get("accept-language") || "unknown",
    acceptEncoding: request.headers.get("accept-encoding") || "unknown",
  };
}

// Session validation
export async function validateSession(
  userId: string,
  token: string
): Promise<boolean> {
  try {
    const session = await dbHelpers.getSessionByToken(token);
    return !!(session && session.userId === userId);
  } catch (error) {
    console.error("Session validation error:", error);
    return false;
  }
}

// Logout from all devices
export async function logoutAllDevices(userId: string): Promise<void> {
  try {
    await dbHelpers.invalidateAllUserSessions(userId);
  } catch (error) {
    console.error("Logout all devices error:", error);
    throw error;
  }
}

// Check if user has permission for resource
export function hasPermission(
  user: User,
  resource: string,
  action: string
): boolean {
  // Basic role-based permissions
  const rolePermissions: Record<string, string[]> = {
    SUPER_ADMIN: ["*"],
    ADMIN: ["users:*", "listings:*", "categories:*", "whatsapp:*"],
    MODERATOR: ["listings:read", "listings:update", "users:read"],
    BUSINESS_OWNER: ["listings:own", "whatsapp:own"],
    USER: ["listings:read", "profile:own"],
  };

  const permissions = rolePermissions[user.role] || [];

  // Check for wildcard permission
  if (permissions.includes("*")) {
    return true;
  }

  // Check for specific permission
  const permission = `${resource}:${action}`;
  if (permissions.includes(permission)) {
    return true;
  }

  // Check for resource wildcard
  const resourceWildcard = `${resource}:*`;
  if (permissions.includes(resourceWildcard)) {
    return true;
  }

  return false;
}
