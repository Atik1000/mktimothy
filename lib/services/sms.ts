import twilio from "twilio";

// Twilio configuration
const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
};

// Validate Twilio configuration
if (
  !twilioConfig.accountSid ||
  !twilioConfig.authToken ||
  !twilioConfig.phoneNumber
) {
  console.warn("SMS service not configured - missing Twilio credentials");
}

// Create Twilio client
const twilioClient =
  twilioConfig.accountSid && twilioConfig.authToken
    ? twilio(twilioConfig.accountSid, twilioConfig.authToken)
    : null;

// SMS templates
const smsTemplates = {
  phoneVerification: (code: string, expiresIn: number) =>
    `Mk Timothy & Company: Your phone verification code is ${code}. This code expires in ${expiresIn} minutes. If you didn't request this, please ignore this message.`,

  emailVerification: (code: string, expiresIn: number) =>
    `Mk Timothy & Company: Your email verification code is ${code}. This code expires in ${expiresIn} minutes. Complete your registration now!`,

  passwordReset: (code: string, expiresIn: number) =>
    `Mk Timothy & Company: Your password reset code is ${code}. This code expires in ${expiresIn} minutes. If you didn't request this, please ignore this message.`,

  twoFactorCode: (code: string, expiresIn: number) =>
    `Mk Timothy & Company: Your 2FA code is ${code}. This code expires in ${expiresIn} minutes. Enter this code to complete your login.`,

  loginAlert: (deviceInfo: string, location?: string) =>
    `Mk Timothy & Company: New login detected from ${deviceInfo}${
      location ? ` in ${location}` : ""
    }. If this wasn't you, please secure your account immediately.`,

  accountLocked: (unlockTime: string) =>
    `Mk Timothy & Company: Your account has been temporarily locked due to multiple failed login attempts. It will be unlocked at ${unlockTime}.`,

  welcomeMessage: (name: string) =>
    `Welcome to Mk Timothy & Company, ${name}! Your account is now active. Start creating your business listings and connect with customers via WhatsApp.`,

  passwordChanged: () =>
    `Mk Timothy & Company: Your password has been successfully changed. If you didn't make this change, please contact support immediately.`,

  twoFactorEnabled: () =>
    `Mk Timothy & Company: Two-factor authentication has been enabled for your account. Your account is now more secure!`,

  twoFactorDisabled: () =>
    `Mk Timothy & Company: Two-factor authentication has been disabled for your account. Consider re-enabling it for better security.`,
};

// SMS service interface
export interface SMSOptions {
  to: string;
  message: string;
  mediaUrl?: string[];
}

// SMS service class
export class SMSService {
  private client: twilio.Twilio | null;

  constructor() {
    this.client = twilioClient;
  }

  // Check if SMS service is available
  isAvailable(): boolean {
    return this.client !== null;
  }

  // Send SMS
  async sendSMS(options: SMSOptions): Promise<boolean> {
    if (!this.client) {
      console.error("SMS service not configured");
      return false;
    }

    try {
      const message = await this.client.messages.create({
        body: options.message,
        from: twilioConfig.phoneNumber,
        to: options.to,
        mediaUrl: options.mediaUrl,
      });

      console.log("SMS sent successfully:", message.sid);
      return true;
    } catch (error) {
      console.error("Failed to send SMS:", error);
      return false;
    }
  }

  // Send phone verification SMS
  async sendPhoneVerificationSMS(
    phoneNumber: string,
    code: string,
    expiresIn: number = 15,
  ): Promise<boolean> {
    const message = smsTemplates.phoneVerification(code, expiresIn);
    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  // Send email verification backup SMS
  async sendEmailVerificationSMS(
    phoneNumber: string,
    code: string,
    expiresIn: number = 15,
  ): Promise<boolean> {
    const message = smsTemplates.emailVerification(code, expiresIn);
    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  // Send password reset SMS
  async sendPasswordResetSMS(
    phoneNumber: string,
    code: string,
    expiresIn: number = 15,
  ): Promise<boolean> {
    const message = smsTemplates.passwordReset(code, expiresIn);
    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  // Send two-factor authentication SMS
  async sendTwoFactorSMS(
    phoneNumber: string,
    code: string,
    expiresIn: number = 10,
  ): Promise<boolean> {
    const message = smsTemplates.twoFactorCode(code, expiresIn);
    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  // Send login alert SMS
  async sendLoginAlertSMS(
    phoneNumber: string,
    deviceInfo: string,
    location?: string,
  ): Promise<boolean> {
    const message = smsTemplates.loginAlert(deviceInfo, location);
    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  // Send account locked SMS
  async sendAccountLockedSMS(
    phoneNumber: string,
    unlockTime: string,
  ): Promise<boolean> {
    const message = smsTemplates.accountLocked(unlockTime);
    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  // Send welcome SMS
  async sendWelcomeSMS(phoneNumber: string, name: string): Promise<boolean> {
    const message = smsTemplates.welcomeMessage(name);
    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  // Send password changed SMS
  async sendPasswordChangedSMS(phoneNumber: string): Promise<boolean> {
    const message = smsTemplates.passwordChanged();
    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  // Send 2FA enabled SMS
  async sendTwoFactorEnabledSMS(phoneNumber: string): Promise<boolean> {
    const message = smsTemplates.twoFactorEnabled();
    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  // Send 2FA disabled SMS
  async sendTwoFactorDisabledSMS(phoneNumber: string): Promise<boolean> {
    const message = smsTemplates.twoFactorDisabled();
    return this.sendSMS({
      to: phoneNumber,
      message,
    });
  }

  // Validate phone number format
  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic E.164 format validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  // Format phone number to E.164
  formatPhoneNumber(phoneNumber: string, countryCode: string = "+1"): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, "");

    // If it starts with country code, return as is
    if (cleaned.startsWith(countryCode.replace("+", ""))) {
      return `+${cleaned}`;
    }

    // Add country code
    return `${countryCode}${cleaned}`;
  }

  // Get delivery status (if supported by provider)
  async getDeliveryStatus(messageSid: string): Promise<string | null> {
    if (!this.client) {
      return null;
    }

    try {
      const message = await this.client.messages(messageSid).fetch();
      return message.status;
    } catch (error) {
      console.error("Failed to get delivery status:", error);
      return null;
    }
  }
}

// Create singleton instance
export const smsService = new SMSService();

// Export templates for testing
export { smsTemplates };
