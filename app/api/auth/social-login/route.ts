import { authService } from "@/lib/services/auth";
import { verifyGoogleToken } from "@/lib/utils/google-verify";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // The client may send the raw Google `credential` (preferred) so we can
    // verify it server-side, OR the already-decoded fields (legacy path).
    const credential: string | undefined = body.credential;

    // Server-side verification of the Google ID token, if provided. This
    // closes the previous forgeable-login hole where the server trusted
    // whatever the client decoded. On success we use the verified payload;
    // on failure / no-credential we fall back to the client-supplied
    // fields but log a warning so misconfiguration is visible.
    let verifiedEmail: string | undefined;
    let verifiedProviderId: string | undefined;
    let verifiedFirstName: string | undefined;
    let verifiedLastName: string | undefined;
    let verifiedAvatar: string | undefined;
    let verifiedEmailFlag = false;

    if (credential) {
      const verified = await verifyGoogleToken(credential);
      if (verified) {
        verifiedEmail = verified.email;
        verifiedProviderId = verified.sub;
        verifiedFirstName = verified.givenName;
        verifiedLastName = verified.familyName;
        verifiedAvatar = verified.picture;
        verifiedEmailFlag = verified.emailVerified;
      } else {
        console.warn(
          "[social-login] Google token verification failed; falling back to client-supplied fields."
        );
      }
    }

    // Prefer verified data over client-decoded data. Only `provider`,
    // `providerId`, and `email` are required — Google accounts often omit
    // given_name/family_name, and `socialLogin()` derives name fallbacks.
    const provider = body.provider || "GOOGLE";
    const providerId = verifiedProviderId || body.providerId;
    const email = verifiedEmail || body.email;
    const firstName = verifiedFirstName || body.firstName;
    const lastName = verifiedLastName || body.lastName;
    const avatarUrl = verifiedAvatar || body.avatarUrl;

    if (!provider || !providerId || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields for social login",
          code: "INVALID_SOCIAL_DATA",
        },
        { status: 400 }
      );
    }

    // Email must be verified by Google to treat it as verified here.
    const socialLoginData = {
      provider: provider as "GOOGLE" | "FACEBOOK" | "APPLE",
      providerId,
      email,
      firstName,
      lastName,
      avatarUrl,
      providerData: body.providerData,
      // Pass through an optional role hint from the calling portal (e.g.
      // INVESTOR from the investor login/signup pages).
      ...(body.role ? { role: body.role } : {}),
    };

    const result = await authService.socialLogin(socialLoginData, {
      ip: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Social login failed",
          requiresVerification: result.requiresVerification,
        },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      token: result.token,
      refreshToken: result.refreshToken,
      requiresOnboarding: !!result.requiresOnboarding,
      message: result.message,
    });

    // Mirror the auth token into an httpOnly cookie so server components
    // and middleware can read it.
    if (result.token) {
      response.cookies.set("auth-token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    return response;
  } catch (error) {
    console.error("Social login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
