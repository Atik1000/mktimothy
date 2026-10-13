import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { dbHelpers, type User } from "../config/database";
import { notificationService } from "./notification";
import { smsService } from "./sms";

// Types
export interface RegisterData {
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: "USER" | "ADMIN" | "MODERATOR" | "INVESTOR";
  skipVerificationEmail?: boolean;
  markEmailVerified?: boolean;
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password: string;
  remember?: boolean;
  twoFactorCode?: string;
}

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  requiresTwoFactor?: boolean;
  requiresVerification?: boolean;
  /** True when a brand-new social-login user still needs to complete the
   *  post-signup onboarding screen (phone/country/city/role). */
  requiresOnboarding?: boolean;
  message?: string;
  error?: string;
}

export interface VerificationResult {
  success: boolean;
  message?: string;
  error?: string;
}

export interface SocialLoginData {
  provider: "GOOGLE" | "FACEBOOK" | "APPLE";
  providerId: string;
  email: string;
  // Optional: Google accounts often omit given_name / family_name, so the
  // service derives fallbacks (name-from-email / "User") when these are blank.
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  providerData?: any;
  /** Optional role hint from the calling portal (e.g. INVESTOR). New Google
   *  users are created with this role when provided; otherwise USER. */
  role?: "USER" | "ADMIN" | "MODERATOR" | "INVESTOR";
}

// Authentication service class
export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || "your-secret-key";
  private jwtRefreshSecret =
    process.env.JWT_REFRESH_SECRET || "your-refresh-secret";
  private saltRounds = 12;

  // User registration
  async register(data: RegisterData): Promise<AuthResult> {
    try {
      // Validate input
      const validation = this.validateRegistrationData(data);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Check if user already exists
      const existingUser = await dbHelpers.getUserByEmail(data.email);
      if (existingUser) {
        return { success: false, error: "User already exists with this email" };
      }

      // Check phone number if provided
      if (data.phone) {
        const existingPhoneUser = await dbHelpers.getUserByPhone(data.phone);
        if (existingPhoneUser) {
          return {
            success: false,
            error: "User already exists with this phone number",
          };
        }
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, this.saltRounds);

      // Create user
      const user = await dbHelpers.createUser({
        email: data.email.toLowerCase(),
        phone: data.phone,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        emailVerified: data.markEmailVerified || false,
        phoneVerified: false,
        role: data.role || "USER",
        isActive: true,
      });

      // Send verification email/SMS - with error handling
      try {
        const verificationCode = this.generateVerificationCode();
        await this.createVerificationCode(
          user.id,
          verificationCode,
          "EMAIL_VERIFICATION"
        );

        if (!data.skipVerificationEmail) {
          await notificationService.sendVerificationCode(
            user.email,
            user.phone || undefined,
            `${user.firstName} ${user.lastName}`,
            verificationCode
          );
        }
      } catch (emailError) {
        console.warn("Failed to send verification email:", emailError);
        // Continue with registration even if email fails
        // In production, you might want to handle this differently
      }

      return {
        success: true,
        user,
        requiresVerification: true,
        message:
          "Registration successful. Please check your email/SMS for verification code.",
      };
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        error: "Registration failed. Please try again.",
      };
    }
  }

  // User login
  async login(
    credentials: LoginCredentials,
    deviceInfo?: any
  ): Promise<AuthResult> {
    try {
      // Find user by email or phone
      let user: User | null = null;

      if (credentials.email) {
        user = await dbHelpers.getUserByEmail(credentials.email.toLowerCase());
      } else if (credentials.phone) {
        user = await dbHelpers.getUserByPhone(credentials.phone);
      }

      if (!user) {
        return { success: false, error: "Invalid credentials" };
      }

      // Check account status
      if (!user.isActive) {
        return { success: false, error: "Account is suspended or inactive" };
      }

      // Check admin approval status for roles that require it (like INVESTOR)
      if (user.approvalStatus === "PENDING" && user.role !== "USER") {
        return { success: false, error: "Your account is pending admin approval." };
      }

      // Verify password
      const passwordValid = await bcrypt.compare(
        credentials.password,
        user.password
      );
      if (!passwordValid) {
        await this.handleFailedLogin(user.id, deviceInfo);
        return { success: false, error: "Invalid credentials" };
      }

      // Check if email verification is required
      if (!user.emailVerified) {
        return {
          success: false,
          requiresVerification: true,
          error: "Please verify your email address before logging in",
        };
      }

      // For now, skip 2FA implementation - can be added later
      // TODO: Implement 2FA when needed

      // Generate tokens
      const { token, refreshToken } = this.generateTokens(
        user,
        credentials.remember
      );

      // Create session
      await this.createSession(
        user.id,
        token,
        refreshToken,
        deviceInfo,
        credentials.remember
      );

      // Update last login
      try {
        await dbHelpers.updateUser(user.id, {
          lastLoginAt: new Date(),
        });
        console.log(`Successfully updated lastLoginAt for user ${user.id}`);
      } catch (loginUpdateError) {
        console.error("Failed to update lastLoginAt:", loginUpdateError);
        // Don't fail the login if this update fails
      }

      // Send login alert if enabled
      if (deviceInfo) {
        await notificationService.sendLoginAlert(
          user.email,
          user.phone || undefined,
          `${user.firstName} ${user.lastName}`,
          deviceInfo.userAgent || "Unknown device",
          deviceInfo.location
        );
      }

      return {
        success: true,
        user,
        token,
        refreshToken,
        message: "Login successful",
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed. Please try again." };
    }
  }

  // Email verification
  async verifyEmail(userId: string, code: string): Promise<VerificationResult> {
    try {
      const isValid = await this.verifyCode(userId, code, "EMAIL_VERIFICATION");

      if (!isValid) {
        return {
          success: false,
          error: "Invalid or expired verification code",
        };
      }

      // Update user as verified
      const user = await dbHelpers.updateUser(userId, {
        emailVerified: true,
      });

      // Send welcome notification
      await notificationService.sendWelcomeNotification(
        user.email,
        user.phone || undefined,
        `${user.firstName} ${user.lastName}`
      );

      return { success: true, message: "Email verified successfully" };
    } catch (error) {
      console.error("Email verification error:", error);
      return {
        success: false,
        error: "Verification failed. Please try again.",
      };
    }
  }

  // Get user by email (helper method for verification)
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await dbHelpers.getUserByEmail(email.toLowerCase());
    } catch (error) {
      console.error("Get user by email error:", error);
      return null;
    }
  }

  // Phone verification
  async verifyPhone(userId: string, code: string): Promise<VerificationResult> {
    try {
      const isValid = await this.verifyCode(userId, code, "PHONE_VERIFICATION");

      if (!isValid) {
        return {
          success: false,
          error: "Invalid or expired verification code",
        };
      }

      // Update user as verified
      await dbHelpers.updateUser(userId, {
        phoneVerified: true,
      });

      return { success: true, message: "Phone number verified successfully" };
    } catch (error) {
      console.error("Phone verification error:", error);
      return {
        success: false,
        error: "Verification failed. Please try again.",
      };
    }
  }

  // Send verification code
  async sendVerificationCode(
    userId: string,
    type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION"
  ): Promise<VerificationResult> {
    try {
      const user = await dbHelpers.getUserById(userId);
      if (!user) {
        return { success: false, error: "User not found" };
      }

      const code = this.generateVerificationCode();
      await this.createVerificationCode(user.id, code, type);

      if (type === "EMAIL_VERIFICATION") {
        await notificationService.sendVerificationCode(
          user.email,
          user.phone || undefined,
          `${user.firstName} ${user.lastName}`,
          code,
          "EMAIL_VERIFICATION"
        );
      } else {
        if (!user.phone) {
          return { success: false, error: "Phone number not provided" };
        }

        await notificationService.sendVerificationCode(
          user.email,
          user.phone,
          `${user.firstName} ${user.lastName}`,
          code,
          "PHONE_VERIFICATION"
        );
      }

      return { success: true, message: "Verification code sent successfully" };
    } catch (error) {
      console.error("Send verification code error:", error);
      return { success: false, error: "Failed to send verification code" };
    }
  }

  // Password reset request
  async requestPasswordReset(email: string): Promise<VerificationResult> {
    try {
      const user = await dbHelpers.getUserByEmail(email.toLowerCase());
      if (!user) {
        // Don't reveal if user exists or not
        return {
          success: true,
          message: "If an account exists, a reset code has been sent",
        };
      }

      const resetCode = this.generateVerificationCode();
      await this.createVerificationCode(user.id, resetCode, "PASSWORD_RESET");

      await notificationService.sendPasswordResetCode(
        user.email,
        user.phone || undefined,
        `${user.firstName} ${user.lastName}`,
        resetCode
      );

      return {
        success: true,
        message: "Password reset code sent successfully",
      };
    } catch (error) {
      console.error("Password reset request error:", error);
      return { success: false, error: "Failed to send reset code" };
    }
  }

  // Reset password
  async resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): Promise<VerificationResult> {
    try {
      const user = await dbHelpers.getUserByEmail(email.toLowerCase());
      if (!user) {
        return { success: false, error: "Invalid reset code" };
      }

      const isValid = await this.verifyCode(user.id, code, "PASSWORD_RESET");
      if (!isValid) {
        return { success: false, error: "Invalid or expired reset code" };
      }

      // Validate new password
      if (!this.validatePassword(newPassword)) {
        return { success: false, error: "Password does not meet requirements" };
      }

      // Hash and store new password
      const hashedPassword = await bcrypt.hash(newPassword, this.saltRounds);
      await dbHelpers.updateUser(user.id, { password: hashedPassword });

      // Invalidate all sessions
      await dbHelpers.invalidateAllUserSessions(user.id);

      // Send notification
      await notificationService.sendPasswordChangedNotification(
        user.email,
        user.phone || undefined,
        `${user.firstName} ${user.lastName}`
      );

      return { success: true, message: "Password reset successfully" };
    } catch (error) {
      console.error("Password reset error:", error);
      return { success: false, error: "Password reset failed" };
    }
  }

  // Logout
  async logout(token: string): Promise<VerificationResult> {
    try {
      await dbHelpers.invalidateSession(token);
      return { success: true, message: "Logged out successfully" };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: "Logout failed" };
    }
  }

  // Refresh token
  async refreshToken(
    refreshToken: string,
    remember?: boolean
  ): Promise<AuthResult> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as any;

      // Get user
      const user = await dbHelpers.getUserById(decoded.userId);
      if (!user) {
        return { success: false, error: "Invalid refresh token" };
      }

      // Generate new tokens
      const tokens = this.generateTokens(user, remember);

      return {
        success: true,
        user,
        token: tokens.token,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      console.error("Refresh token error:", error);
      return { success: false, error: "Invalid refresh token" };
    }
  }

  // Verify session token
  async verifyToken(token: string): Promise<{
    valid: boolean;
    user?: User;
  }> {
    try {
      console.log("Verifying token...");

      // First verify the JWT token itself
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      console.log("JWT decoded successfully:", {
        userId: decoded.userId,
        email: decoded.email,
      });

      // Get session from database
      const session = await dbHelpers.getSessionByToken(token);
      console.log("Session lookup result:", session ? "Found" : "Not found");

      if (!session) {
        console.log(
          "No session found, checking if user exists and creating session if needed"
        );
        // If no session found, try to get user directly
        const user = await dbHelpers.getUserById(decoded.userId);
        if (user && user.isActive) {
          console.log("User found, attempting to create new session");
          // Create a new session for this token
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours default

          try {
            // Check if session already exists (race condition protection)
            const existingSession = await dbHelpers.getSessionByToken(token);
            if (!existingSession) {
              await dbHelpers.createSession({
                userId: user.id,
                token,
                expiresAt,
              });
              console.log("New session created successfully");
            } else {
              console.log(
                "Session was created by another request, using existing session"
              );
            }
          } catch (sessionError: any) {
            // If it's a unique constraint error, that's fine - session already exists
            if (
              sessionError.code === "P2002" ||
              sessionError.message?.includes("unique constraint")
            ) {
              console.log(
                "Session already exists (unique constraint), continuing with JWT verification"
              );
            } else {
              console.log(
                "Failed to create session, but user is valid:",
                sessionError
              );
            }
            // Continue anyway since JWT is valid
          }

          return {
            valid: true,
            user,
          };
        } else {
          console.log("User not found or inactive");
          return { valid: false };
        }
      }

      if (session.expiresAt < new Date()) {
        console.log("Session expired:", session.expiresAt);
        return { valid: false };
      }

      console.log("Token verification successful");
      return {
        valid: true,
        user: session.user,
      };
    } catch (error) {
      console.error("Token verification error:", error);
      return { valid: false };
    }
  }

  // Private helper methods
  private validateRegistrationData(data: RegisterData): {
    valid: boolean;
    error?: string;
  } {
    if (!data.email || !this.validateEmail(data.email)) {
      return { valid: false, error: "Invalid email address" };
    }

    if (!data.firstName || data.firstName.trim().length < 2) {
      return {
        valid: false,
        error: "First name must be at least 2 characters",
      };
    }

    if (data.lastName && data.lastName.trim().length > 0 && data.lastName.trim().length < 2) {
      return { valid: false, error: "Last name must be at least 2 characters if provided" };
    }

    if (!data.password || !this.validatePassword(data.password)) {
      return {
        valid: false,
        error:
          "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
      };
    }

    if (data.phone && !smsService.validatePhoneNumber(data.phone)) {
      return { valid: false, error: "Invalid phone number format" };
    }

    return { valid: true };
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/;
    return passwordRegex.test(password);
  }

  private generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateTokens(user: User, remember?: boolean) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, this.jwtSecret, {
      expiresIn: remember ? "30d" : "7d",  // 7 days default, 30 days with remember me
    });
    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: "30d",
    });

    return { token, refreshToken };
  }

  private async createVerificationCode(
    userId: string,
    code: string,
    type:
      | "EMAIL_VERIFICATION"
      | "PHONE_VERIFICATION"
      | "PASSWORD_RESET"
      | "LOGIN_VERIFICATION"
  ) {
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() + (type === "LOGIN_VERIFICATION" ? 10 : 15)
    );

    return dbHelpers.createOtpCode({
      userId,
      code,
      type,
      expiresAt,
    });
  }

  private async verifyCode(
    userId: string,
    code: string,
    type:
      | "EMAIL_VERIFICATION"
      | "PHONE_VERIFICATION"
      | "PASSWORD_RESET"
      | "LOGIN_VERIFICATION"
  ): Promise<boolean> {
    try {
      const otpCode = await dbHelpers.getOtpCode(userId, code, type);

      if (!otpCode) {
        return false;
      }

      // Mark as used
      await dbHelpers.markOtpCodeAsUsed(otpCode.id);

      return true;
    } catch (error) {
      console.error("Verify code error:", error);
      return false;
    }
  }

  private async createSession(
    userId: string,
    token: string,
    refreshToken: string,
    deviceInfo?: any,
    remember?: boolean
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + (remember ? 30 : 7)); // 30 days with remember me, 7 days default

    try {
      const session = await dbHelpers.createSession({
        userId,
        token,
        expiresAt,
      });
      return session;
    } catch (error: any) {
      // If it's a unique constraint error, check if session already exists
      if (
        error.code === "P2002" ||
        error.message?.includes("unique constraint")
      ) {
        console.log("Session already exists, retrieving existing session");
        try {
          const existingSession = await dbHelpers.getSessionByToken(token);
          if (existingSession) {
            return existingSession;
          }
        } catch (retrieveError) {
          console.error("Failed to retrieve existing session:", retrieveError);
        }
      }

      console.error("Failed to create session:", error);
      throw error;
    }
  }

  private async handleFailedLogin(userId: string, deviceInfo?: any) {
    // Implement failed login tracking and account locking logic
    console.log("Handle failed login for user:", userId);
    // TODO: Add rate limiting and account locking logic
  }
  // Social login method
  async socialLogin(
    data: SocialLoginData,
    deviceInfo?: any
  ): Promise<AuthResult> {
    try {
      // Check if user already exists with this email
      let user = await dbHelpers.getUserByEmail(data.email.toLowerCase());

      if (user) {
        // User exists, check if they have this social provider linked
        // For now, we'll just log them in if the email matches

        // Update avatar if provided and user doesn't have one
        if (data.avatarUrl && !user.avatar) {
          user = await dbHelpers.updateUser(user.id, {
            avatar: data.avatarUrl,
          });
        }

        // Check account status
        if (!user.isActive) {
          return { success: false, error: "Account is suspended or inactive" };
        }

        // Check admin approval status for roles that require it (like INVESTOR)
        if (user.approvalStatus === "PENDING" && user.role !== "USER") {
          return { success: false, error: "Your account is pending admin approval." };
        }

        // For social login, we'll consider email as verified if it comes from a trusted provider
        if (!user.emailVerified && data.provider === "GOOGLE") {
          user = await dbHelpers.updateUser(user.id, {
            emailVerified: true,
          });
        }

        // Generate tokens
        const { token, refreshToken } = this.generateTokens(user, true);

        // Create session
        await this.createSession(
          user.id,
          token,
          refreshToken,
          deviceInfo,
          true
        );

        // Update last login
        try {
          await dbHelpers.updateUser(user.id, {
            lastLoginAt: new Date(),
          });
          console.log(
            `Successfully updated lastLoginAt for social login user ${user.id}`
          );
        } catch (loginUpdateError) {
          console.error(
            "Failed to update lastLoginAt in social login:",
            loginUpdateError
          );
          // Don't fail the login if this update fails
        }

        // Send login alert if enabled
        if (deviceInfo) {
          await notificationService.sendLoginAlert(
            user.email,
            user.phone || undefined,
            `${user.firstName} ${user.lastName}`,
            deviceInfo.userAgent || "Unknown device",
            deviceInfo.location
          );
        }

        return {
          success: true,
          user,
          token,
          refreshToken,
          message: "Social login successful",
        };
      } else {
        // User doesn't exist, create new account.
        // Google accounts often omit given_name/family_name, so derive
        // fallback names rather than failing on empty strings.
        const emailLocalPart = data.email.split("@")[0] || "User";
        const firstName =
          (data.firstName && data.firstName.trim()) ||
          emailLocalPart.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) =>
            c.toUpperCase()
          ) ||
          "User";
        const lastName = (data.lastName && data.lastName.trim()) || "";

        let newUser = await dbHelpers.createUser({
          email: data.email.toLowerCase(),
          firstName,
          lastName,
          password: await bcrypt.hash(
            Math.random().toString(36),
            this.saltRounds
          ), // Random password for social accounts
          avatar: data.avatarUrl,
          emailVerified: data.provider === "GOOGLE", // Trust Google's email verification
          // Honor the role hint from the calling portal (e.g. INVESTOR from
          // the investor portal) so the user isn't created as USER and then
          // rejected by that same portal's role check.
          role: data.role || "USER",
          // Flag the new social-login user as needing onboarding (phone,
          // country, city, role). Existing/manual users keep the schema
          // default of true, so only brand-new social signups are gated.
          onboardingComplete: false,
        });

        // Note: Social login users also get PENDING approval status by default
        // They will need admin approval like regular users

        // Update last login for new user
        try {
          newUser = await dbHelpers.updateUser(newUser.id, {
            lastLoginAt: new Date(),
          });
          console.log(
            `Successfully updated lastLoginAt for new social login user ${newUser.id}`
          );
        } catch (loginUpdateError) {
          console.error(
            "Failed to update lastLoginAt for new social login user:",
            loginUpdateError
          );
          // Don't fail the login if this update fails
        }

        // Generate tokens
        const { token, refreshToken } = this.generateTokens(newUser, true);

        // Create session
        await this.createSession(
          newUser.id,
          token,
          refreshToken,
          deviceInfo,
          true
        );

        // Send welcome notification
        await notificationService.sendWelcomeNotification(
          newUser.email,
          newUser.phone || undefined,
          `${newUser.firstName} ${newUser.lastName}`
        );

        return {
          success: true,
          user: newUser,
          token,
          refreshToken,
          requiresOnboarding: true,
          message: "Account created and logged in successfully",
        };
      }
    } catch (error) {
      console.error("Social login error:", error);
      return {
        success: false,
        error: "Social login failed. Please try again.",
      };
    }
  }

  // Hash password method
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }
}

// Create singleton instance
export const authService = new AuthService();
