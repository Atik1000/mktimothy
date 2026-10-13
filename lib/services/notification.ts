import { dbHelpers } from "@/lib/config/database";
import { emailService } from "./email";
import { smsService } from "./sms";

// Notification types
export type NotificationType =
  | "EMAIL_VERIFICATION"
  | "PHONE_VERIFICATION"
  | "PASSWORD_RESET"
  | "TWO_FACTOR"
  | "LOGIN_ALERT"
  | "ACCOUNT_LOCKED"
  | "WELCOME"
  | "PASSWORD_CHANGED"
  | "TWO_FACTOR_ENABLED"
  | "TWO_FACTOR_DISABLED";

// Notification channels
export type NotificationChannel = "EMAIL" | "SMS" | "BOTH";

// Notification options
export interface NotificationOptions {
  type: NotificationType;
  channel: NotificationChannel;
  recipient: {
    email?: string;
    phone?: string;
    name: string;
  };
  data: {
    code?: string;
    expiresIn?: number;
    deviceInfo?: string;
    location?: string;
    unlockTime?: string;
  };
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  retryAttempts?: number;
}

// Delivery result
export interface DeliveryResult {
  success: boolean;
  channel: NotificationChannel;
  emailSent?: boolean;
  smsSent?: boolean;
  errors?: string[];
  messageIds?: {
    email?: string;
    sms?: string;
  };
}

export interface NotificationPayload {
  title: string;
  message: string;
  type: "SYSTEM" | "USER_ACTION" | "MARKETING" | "SECURITY" | "REMINDER";
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  userId?: string | null;
  isGlobal?: boolean;
  data?: any;
  actionUrl?: string | null;
}

// Notification service class
export class NotificationService {
  private maxRetryAttempts = 3;
  private retryDelay = 1000; // 1 second

  // Send notification with dual delivery
  async sendNotification(
    options: NotificationOptions
  ): Promise<DeliveryResult> {
    const result: DeliveryResult = {
      success: false,
      channel: options.channel,
      errors: [],
      messageIds: {},
    };

    const { type, channel, recipient, data, priority } = options;
    const retryAttempts = options.retryAttempts || this.maxRetryAttempts;

    // Determine which channels to use
    const useEmail = channel === "EMAIL" || channel === "BOTH";
    const useSMS = channel === "SMS" || channel === "BOTH";

    // Send via email
    if (useEmail && recipient.email) {
      result.emailSent = await this.sendEmailNotification(
        type,
        recipient.email,
        recipient.name,
        data,
        retryAttempts
      );

      if (!result.emailSent) {
        result.errors?.push("Failed to send email notification");
      }
    }

    // Send via SMS
    if (useSMS && recipient.phone) {
      result.smsSent = await this.sendSMSNotification(
        type,
        recipient.phone,
        recipient.name,
        data,
        retryAttempts
      );

      if (!result.smsSent) {
        result.errors?.push("Failed to send SMS notification");
      }
    }

    // Determine overall success
    if (channel === "BOTH") {
      // For dual delivery, success if at least one channel works
      result.success = result.emailSent || result.smsSent || false;
    } else if (channel === "EMAIL") {
      result.success = result.emailSent || false;
    } else if (channel === "SMS") {
      result.success = result.smsSent || false;
    }

    // Log delivery result
    this.logDeliveryResult(options, result);

    return result;
  }

  // Send email notification with retry
  private async sendEmailNotification(
    type: NotificationType,
    email: string,
    name: string,
    data: any,
    retryAttempts: number
  ): Promise<boolean> {
    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        let success = false;

        switch (type) {
          case "EMAIL_VERIFICATION":
            success = await emailService.sendVerificationEmail(
              email,
              name,
              data.code,
              data.expiresIn
            );
            break;

          case "PASSWORD_RESET":
            success = await emailService.sendPasswordResetEmail(
              email,
              name,
              data.code,
              data.expiresIn
            );
            break;

          case "TWO_FACTOR":
            success = await emailService.sendTwoFactorEmail(
              email,
              name,
              data.code,
              data.expiresIn
            );
            break;

          case "WELCOME":
            success = await emailService.sendWelcomeEmail(email, name);
            break;

          default:
            console.warn(`Email template not implemented for type: ${type}`);
            return false;
        }

        if (success) {
          return true;
        }
      } catch (error) {
        console.error(`Email attempt ${attempt} failed:`, error);
      }

      // Wait before retry (except for last attempt)
      if (attempt < retryAttempts) {
        await this.delay(this.retryDelay * attempt);
      }
    }

    return false;
  }

  // Send SMS notification with retry
  private async sendSMSNotification(
    type: NotificationType,
    phone: string,
    name: string,
    data: any,
    retryAttempts: number
  ): Promise<boolean> {
    if (!smsService.isAvailable()) {
      console.warn("SMS service not available");
      return false;
    }

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        let success = false;

        switch (type) {
          case "PHONE_VERIFICATION":
            success = await smsService.sendPhoneVerificationSMS(
              phone,
              data.code,
              data.expiresIn
            );
            break;

          case "EMAIL_VERIFICATION":
            success = await smsService.sendEmailVerificationSMS(
              phone,
              data.code,
              data.expiresIn
            );
            break;

          case "PASSWORD_RESET":
            success = await smsService.sendPasswordResetSMS(
              phone,
              data.code,
              data.expiresIn
            );
            break;

          case "TWO_FACTOR":
            success = await smsService.sendTwoFactorSMS(
              phone,
              data.code,
              data.expiresIn
            );
            break;

          case "LOGIN_ALERT":
            success = await smsService.sendLoginAlertSMS(
              phone,
              data.deviceInfo,
              data.location
            );
            break;

          case "ACCOUNT_LOCKED":
            success = await smsService.sendAccountLockedSMS(
              phone,
              data.unlockTime
            );
            break;

          case "WELCOME":
            success = await smsService.sendWelcomeSMS(phone, name);
            break;

          case "PASSWORD_CHANGED":
            success = await smsService.sendPasswordChangedSMS(phone);
            break;

          case "TWO_FACTOR_ENABLED":
            success = await smsService.sendTwoFactorEnabledSMS(phone);
            break;

          case "TWO_FACTOR_DISABLED":
            success = await smsService.sendTwoFactorDisabledSMS(phone);
            break;

          default:
            console.warn(`SMS template not implemented for type: ${type}`);
            return false;
        }

        if (success) {
          return true;
        }
      } catch (error) {
        console.error(`SMS attempt ${attempt} failed:`, error);
      }

      // Wait before retry (except for last attempt)
      if (attempt < retryAttempts) {
        await this.delay(this.retryDelay * attempt);
      }
    }

    return false;
  }

  // Convenience methods for common notifications
  async sendVerificationCode(
    email: string,
    phone: string | undefined,
    name: string,
    code: string,
    type: "EMAIL_VERIFICATION" | "PHONE_VERIFICATION" = "EMAIL_VERIFICATION",
    expiresIn: number = 15
  ): Promise<DeliveryResult> {
    return this.sendNotification({
      type,
      channel: phone ? "BOTH" : "EMAIL",
      recipient: { email, phone, name },
      data: { code, expiresIn },
      priority: "HIGH",
    });
  }

  async sendPasswordResetCode(
    email: string,
    phone: string | undefined,
    name: string,
    code: string,
    expiresIn: number = 15
  ): Promise<DeliveryResult> {
    return this.sendNotification({
      type: "PASSWORD_RESET",
      channel: phone ? "BOTH" : "EMAIL",
      recipient: { email, phone, name },
      data: { code, expiresIn },
      priority: "HIGH",
    });
  }

  async sendTwoFactorCode(
    email: string,
    phone: string | undefined,
    name: string,
    code: string,
    expiresIn: number = 10
  ): Promise<DeliveryResult> {
    return this.sendNotification({
      type: "TWO_FACTOR",
      channel: phone ? "BOTH" : "EMAIL",
      recipient: { email, phone, name },
      data: { code, expiresIn },
      priority: "CRITICAL",
    });
  }

  async sendWelcomeNotification(
    email: string,
    phone: string | undefined,
    name: string
  ): Promise<DeliveryResult> {
    return this.sendNotification({
      type: "WELCOME",
      channel: phone ? "BOTH" : "EMAIL",
      recipient: { email, phone, name },
      data: {},
      priority: "MEDIUM",
    });
  }

  async sendLoginAlert(
    email: string,
    phone: string | undefined,
    name: string,
    deviceInfo: string,
    location?: string
  ): Promise<DeliveryResult> {
    return this.sendNotification({
      type: "LOGIN_ALERT",
      channel: phone ? "SMS" : "EMAIL", // Prefer SMS for security alerts
      recipient: { email, phone, name },
      data: { deviceInfo, location },
      priority: "HIGH",
    });
  }

  async sendAccountLockedNotification(
    email: string,
    phone: string | undefined,
    name: string,
    unlockTime: string
  ): Promise<DeliveryResult> {
    return this.sendNotification({
      type: "ACCOUNT_LOCKED",
      channel: phone ? "BOTH" : "EMAIL",
      recipient: { email, phone, name },
      data: { unlockTime },
      priority: "CRITICAL",
    });
  }

  async sendPasswordChangedNotification(
    email: string,
    phone: string | undefined,
    name: string
  ): Promise<DeliveryResult> {
    return this.sendNotification({
      type: "PASSWORD_CHANGED",
      channel: phone ? "BOTH" : "EMAIL",
      recipient: { email, phone, name },
      data: {},
      priority: "HIGH",
    });
  }

  async sendTwoFactorStatusNotification(
    email: string,
    phone: string | undefined,
    name: string,
    enabled: boolean
  ): Promise<DeliveryResult> {
    return this.sendNotification({
      type: enabled ? "TWO_FACTOR_ENABLED" : "TWO_FACTOR_DISABLED",
      channel: phone ? "BOTH" : "EMAIL",
      recipient: { email, phone, name },
      data: {},
      priority: "MEDIUM",
    });
  }

  // Utility methods
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private logDeliveryResult(
    options: NotificationOptions,
    result: DeliveryResult
  ): void {
    const logData = {
      type: options.type,
      channel: options.channel,
      priority: options.priority,
      recipient: {
        email: options.recipient.email ? "***@***.***" : undefined,
        phone: options.recipient.phone ? "***-***-****" : undefined,
        name: options.recipient.name,
      },
      success: result.success,
      emailSent: result.emailSent,
      smsSent: result.smsSent,
      errors: result.errors,
      timestamp: new Date().toISOString(),
    };

    if (result.success) {
      console.log("Notification delivered successfully:", logData);
    } else {
      console.error("Notification delivery failed:", logData);
    }
  }

  // Health check methods
  async checkEmailService(): Promise<boolean> {
    return emailService.testConnection();
  }

  checkSMSService(): boolean {
    return smsService.isAvailable();
  }

  async getServiceStatus(): Promise<{
    email: boolean;
    sms: boolean;
    overall: boolean;
  }> {
    const emailStatus = await this.checkEmailService();
    const smsStatus = this.checkSMSService();

    return {
      email: emailStatus,
      sms: smsStatus,
      overall: emailStatus || smsStatus, // At least one service should work
    };
  }

  // Create a notification
  static async createNotification(payload: NotificationPayload) {
    try {
      return await dbHelpers.createNotification(payload);
    } catch (error) {
      console.error("Failed to create notification:", error);
      throw error;
    }
  }

  // User-related notifications
  static async notifyUserApproved(userId: string, adminName: string) {
    return await this.createNotification({
      title: "Account Approved! 🎉",
      message: `Your account has been approved by <strong>${adminName}</strong>. You can now access all features of the platform.`,
      type: "USER_ACTION",
      priority: "HIGH",
      userId,
      actionUrl: "/profile/settings",
    });
  }

  static async notifyUserRejected(userId: string, adminName: string) {
    return await this.createNotification({
      title: "Account Rejected ❌",
      message: `Your account registration has been rejected by <strong>${adminName}</strong>. Please contact support for more information.`,
      type: "USER_ACTION",
      priority: "HIGH",
      userId,
      actionUrl: "/profile/settings",
    });
  }

  static async notifyUserSuspended(userId: string, adminName: string) {
    return await this.createNotification({
      title: "Account Suspended",
      message: `Your account has been suspended by <strong>${adminName}</strong>. Please contact support for assistance.`,
      type: "SECURITY",
      priority: "URGENT",
      userId,
      actionUrl: "/profile/settings",
    });
  }

  static async notifyUserActivated(userId: string, adminName: string) {
    return await this.createNotification({
      title: "Account Reactivated 🎉",
      message: `Your account has been reactivated by <strong>${adminName}</strong>. Welcome back!`,
      type: "USER_ACTION",
      priority: "HIGH",
      userId,
      actionUrl: "/profile/settings",
    });
  }

  static async notifyRoleChanged(
    userId: string,
    newRole: string,
    adminName: string
  ) {
    const roleDisplayNames = {
      USER: "User",
      MODERATOR: "Moderator",
      ADMIN: "Administrator",
    };

    return await this.createNotification({
      title: "Role Updated",
      message: `Your role has been changed to ${
        roleDisplayNames[newRole as keyof typeof roleDisplayNames]
      } by <strong>${adminName}</strong>.`,
      type: "USER_ACTION",
      priority: "MEDIUM",
      userId,
      data: { newRole },
      actionUrl: "/profile/settings",
    });
  }

  // Blog-related notifications
  static async notifyBlogApproved(
    userId: string,
    blogTitle: string,
    blogId: string,
    adminName: string
  ) {
    return await this.createNotification({
      title: "Blog Approved! 📝",
      message: `Your blog <span class="line-clamp-2 font-medium">"${blogTitle}"</span> has been approved by <strong>${adminName}</strong> and is now published.`,
      type: "USER_ACTION",
      priority: "MEDIUM",
      userId,
      data: { blogId, blogTitle },
      actionUrl: `/blog-details/${blogId}`,
    });
  }

  static async notifyBlogRejected(
    userId: string,
    blogTitle: string,
    blogId: string,
    adminName: string
  ) {
    return await this.createNotification({
      title: "Blog Rejected ❌",
      message: `Your blog <span class="line-clamp-2 font-medium">"${blogTitle}"</span> has been rejected by <strong>${adminName}</strong>. Please review and make necessary adjustments before resubmitting.`,
      type: "USER_ACTION",
      priority: "MEDIUM",
      userId,
      data: { blogId, blogTitle },
      actionUrl: `/blog-details/${blogId}`,
    });
  }

  // Listing-related notifications
  static async notifyListingApproved(
    userId: string,
    listingTitle: string,
    listingId: string,
    adminName: string
  ) {
    return await this.createNotification({
      title: "Listing Approved! 🏢",
      message: `Your listing <span class="line-clamp-2 font-medium">"${listingTitle}"</span> has been approved by <strong>${adminName}</strong> and is now live.`,
      type: "USER_ACTION",
      priority: "MEDIUM",
      userId,
      data: { listingId, listingTitle },
      actionUrl: `/project/${listingId}`,
    });
  }

  static async notifyListingRejected(
    userId: string,
    listingTitle: string,
    listingId: string,
    adminName: string
  ) {
    return await this.createNotification({
      title: "Listing Rejected ❌",
      message: `Your listing <span class="line-clamp-2 font-medium">"${listingTitle}"</span> has been rejected by <strong>${adminName}</strong>. Please review and make necessary adjustments before resubmitting.`,
      type: "USER_ACTION",
      priority: "MEDIUM",
      userId,
      data: { listingId, listingTitle },
      actionUrl: `/project/${listingId}`,
    });
  }

  // System notifications
  static async createSystemNotification(
    title: string,
    message: string,
    isGlobal: boolean = false,
    userId?: string
  ) {
    return await this.createNotification({
      title,
      message,
      type: "SYSTEM",
      priority: "LOW",
      userId: isGlobal ? null : userId,
      isGlobal,
    });
  }
}

// Create singleton instance
export const notificationService = new NotificationService();
