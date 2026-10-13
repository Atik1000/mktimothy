import nodemailer, { createTransport } from "nodemailer";

// Email configuration
const emailConfig = {
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Validate email configuration
if (!emailConfig.auth.user || !emailConfig.auth.pass) {
  console.warn("Email service not configured - missing SMTP credentials");
}

// Create transporter
const transporter = createTransport(emailConfig);

// Email templates
const buildBaseEmailLayout = (title: string, preheaderText: string, contentHtml: string) => `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="utf-8"> 
    <meta name="viewport" content="width=device-width"> 
    <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
    <title>${title}</title> 
    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <!--<![endif]-->
    <style>
        html, body { margin: 0 auto !important; padding: 0 !important; height: 100% !important; width: 100% !important; font-family: 'Inter', Arial, sans-serif !important; background-color: #eaedf1; }
        * { -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt !important; mso-table-rspace: 0pt !important; }
        table { border-spacing: 0 !important; border-collapse: collapse !important; table-layout: fixed !important; margin: 0 auto !important; }
        a { text-decoration: none; }
        .btn-primary:hover { background-color: #005ce6 !important; }
        @media screen and (max-width: 600px) {
            .email-container { width: 100% !important; margin: auto !important; border-radius: 16px !important; }
            .content-padding { padding: 32px 24px !important; }
        }
    </style>
</head>
<body width="100%" style="margin: 0; padding: 0 !important; mso-line-height-rule: exactly; background-color: #eaedf1;">
    <center style="width: 100%; background-color: #eaedf1; padding: 40px 0;">
        <div style="display: none; font-size: 1px; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all; font-family: sans-serif;">
            ${preheaderText}
        </div>
        
        <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: auto;">
            <tr>
                <td style="text-align: center; padding-bottom: 32px;">
                    <img src="${process.env.NEXT_PUBLIC_APP_URL || "https://mktimothy.com"}/images/mkorange.png" width="200" alt="Mk Timothy & Company" style="width: 100%; max-width: 240px; height: auto; display: inline-block;">
                </td>
            </tr>
        </table>

        <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);" class="email-container">
            <tr>
                <td class="content-padding" style="padding: 48px; text-align: left; font-family: 'Inter', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #111827;">
                    ${contentHtml}
                </td>
            </tr>
        </table>

        <table align="center" role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: auto;">
            <tr>
                <td style="padding: 32px 20px; text-align: center; font-family: 'Inter', Arial, sans-serif; font-size: 12px; line-height: 1.6; color: #6b7280;">
                    <div style="margin-bottom: 16px; font-size: 16px; letter-spacing: 12px; font-family: sans-serif;">
                        <a href="https://www.facebook.com/mktimothyco/" style="display: inline-block; margin: 0 8px;"><img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://mktimothy.com'}/images/fblogo.png" width="24" height="24" alt="Facebook" style="display: block; border: 0;" /></a>
                        <a href="https://twitter.com/MKTimothy_" style="display: inline-block; margin: 0 8px;"><img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://mktimothy.com'}/images/twitterlogo.png" width="24" height="24" alt="X (Twitter)" style="display: block; border: 0;" /></a>
                        <a href="https://www.linkedin.com/in/musasizi-timothy-karubanga-03a893b5/" style="display: inline-block; margin: 0 8px;"><img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://mktimothy.com'}/images/linkedinlogo.png" width="24" height="24" alt="LinkedIn" style="display: block; border: 0;" /></a>
                        <a href="https://www.instagram.com/mktimothy" style="display: inline-block; margin: 0 8px;"><img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://mktimothy.com'}/images/instalogo.png" width="24" height="24" alt="Instagram" style="display: block; border: 0;" /></a>
                    </div>
                    <p style="margin: 0 0 8px 0; color: #6b7280;">Sent by Mk Timothy & Co</p>
                    <p style="margin: 0 0 16px 0; color: #6b7280;">
                        Kampala, Uganda (Headquarters) &nbsp;|&nbsp; Juba, South Sudan &nbsp;|&nbsp; Nakuru, Kenya &nbsp;|&nbsp; Kanagawa, Japan &nbsp;|&nbsp; Cape Town, South Africa
                    </p>
                    <a href="#" style="color: #ea580c; text-decoration: none;">Unsubscribe</a>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
`;

const buildSecurityEmail = (
  title: string,
  preheaderText: string,
  headline: string,
  name: string,
  bodyText: string,
  codeLabel: string,
  code: string,
  warningText: string,
  showSecurityTips: boolean,
  footerInfo: string,
) => {
  const contentHtml = `
    <h2 style="margin: 0 0 24px 0; font-size: 24px; color: #111827;">${headline}</h2>
    <p style="margin: 0 0 16px 0;">Hi ${name},</p>
    <p style="margin: 0 0 24px 0;">${bodyText}</p>
    
    <div style="margin: 32px 0; padding: 24px; background-color: #f8fafc; border-radius: 12px; text-align: center; border: 1px dashed #cbd5e1;">
      <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-bottom: 12px; font-weight: bold; letter-spacing: 1px;">${codeLabel}</div>
      <div style="font-family: 'Courier New', Courier, monospace; font-size: 40px; font-weight: bold; letter-spacing: 8px; color: #0070f3;">${code}</div>
    </div>
    
    <div style="margin: 24px 0; padding: 16px 20px; background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0;">
      <p style="margin: 0; color: #991b1b; font-size: 14px;">${warningText}</p>
    </div>
    
    ${showSecurityTips ? `
      <div style="margin: 32px 0; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h3 style="margin: 0 0 16px 0; font-size: 14px; text-transform: uppercase; color: #111827;">Security Tips</h3>
        <ul style="margin: 0; padding-left: 20px; color: #4b5563; font-size: 14px;">
          <li style="margin-bottom: 8px;">Choose a strong, unique password for this account.</li>
          <li style="margin-bottom: 8px;">Enable two-factor authentication in your account settings.</li>
          <li>Never share your password or this reset code with anyone.</li>
        </ul>
      </div>
    ` : ''}
    
    <p style="margin: 0 0 24px 0;">If you continue to have problems, please contact our <a href="mailto:support@mktimothy.com" style="color: #0070f3; text-decoration: none;">support team</a>.</p>
    <p style="margin: 0;">${footerInfo}</p>
    <p style="margin: 24px 0 0 0;">Mk Timothy & Company team</p>
  `;
  return buildBaseEmailLayout(title, preheaderText, contentHtml);
};

const buildMarketingEmail = (
  title: string,
  preheaderText: string,
  headline: string,
  bodyHtml: string,
  passwordCode: string | null,
  ctaText: string | null,
  ctaUrl: string | null,
  footerInfo: string,
) => {
  const contentHtml = `
    ${headline ? `<h2 style="margin: 0 0 24px 0; font-size: 24px; color: #111827;">${headline}</h2>` : ''}
    ${bodyHtml}
    ${passwordCode ? `
      <div style="margin: 32px 0; padding: 24px; background-color: #f8fafc; border-radius: 12px; text-align: center;">
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #111827;">${passwordCode}</div>
        <div style="font-size: 12px; color: #6b7280; text-transform: uppercase; margin-top: 8px;">Temporary Password</div>
      </div>
    ` : ''}
    ${ctaText && ctaUrl ? `
      <div style="text-align: center; margin: 40px 0 24px 0;">
        <a href="${ctaUrl}" class="btn-primary" style="display: inline-block; padding: 14px 28px; background-color: #0070f3; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          ${ctaText} &rarr;
        </a>
      </div>
    ` : ''}
    <div style="margin-top: 40px;">
      <p style="margin: 0 0 24px 0;">${footerInfo}</p>
      <p style="margin: 0;">Mk Timothy & Company team</p>
    </div>
  `;
  return buildBaseEmailLayout(title, preheaderText, contentHtml);
};

const emailTemplates = {
  emailVerification: (name: string, code: string, expiresIn: number) => ({
    subject: "Verify Your Email - Mk Timothy & Company",
    html: buildSecurityEmail(
      "Verify your email address",
      `Here is your 6-digit verification code: ${code}. This code expires in ${expiresIn} minutes.`,
      "Verify Email Address",
      name,
      "Thank you for joining Mk Timothy & Company. To complete your registration, please verify your email address using the code below:",
      "Verification Code",
      code,
      `<strong>⏱️ Important:</strong> This code will expire in <strong>${expiresIn} minutes</strong>. If you didn't request this verification, you can safely ignore this email.`,
      false,
      "This email was sent to verify your account. If you didn't sign up, please ignore this email.",
    ),
    text: `Hi ${name}!\n\nWelcome to Mk Timothy & Company!\n\nPlease verify your email address using this code: ${code}\nThis code will expire in ${expiresIn} minutes.\n\nIf you didn't request this verification, please ignore this email.\n\nBest regards,\nMk Timothy & Company Team`,
  }),

  passwordReset: (name: string, code: string, expiresIn: number) => ({
    subject: "Reset Your Password - Mk Timothy & Company",
    html: buildSecurityEmail(
      "Password Reset Request",
      `Here is your 6-digit password reset code: ${code}. This code expires in ${expiresIn} minutes.`,
      "Password Reset Request",
      name,
      "We received a request to reset your password for your Mk Timothy & Company account. Please use the verification code below to securely reset your password:",
      "Verification Code",
      code,
      `<strong>⏱️ Important:</strong> This code will expire in <strong>${expiresIn} minutes</strong>. If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.`,
      true,
      "This email was sent because a password reset was requested. If you didn't request this, please ignore this email.",
    ),
    text: `Hi ${name}!\n\nPassword Reset Request\n\nWe received a request to reset your password. Use this code: ${code}\nThis code will expire in ${expiresIn} minutes.\n\nIf you didn't request this reset, please ignore this email.\n\nBest regards,\nMk Timothy & Company Team`,
  }),

  twoFactorCode: (name: string, code: string, expiresIn: number) => ({
    subject: "Two-Factor Authentication Code - Mk Timothy & Company",
    html: buildSecurityEmail(
      "Two-Factor Authentication",
      `Here is your 2FA code: ${code}. This code expires in ${expiresIn} minutes.`,
      "Two-Factor Authentication",
      name,
      "Your two-factor authentication code for Mk Timothy & Company is below. Enter this code in your app to complete the login process.",
      "2FA Code",
      code,
      `<strong>⏱️ Important:</strong> This code will expire in <strong>${expiresIn} minutes</strong>. If you didn't request this code, someone may be trying to access your account.`,
      false,
      "This is an automated security email. If you didn't request this code, please secure your account immediately.",
    ),
    text: `Hi ${name}!\n\nTwo-Factor Authentication Code: ${code}\nThis code will expire in ${expiresIn} minutes.\n\nIf you didn't request this code, please secure your account immediately.\n\nBest regards,\nMk Timothy & Company Team`,
  }),

  welcomeEmail: (name: string) => ({
    subject: "Welcome to Mk Timothy & Company! 🎉",
    html: buildMarketingEmail(
      "Welcome to Mk Timothy & Company",
      "Your account is now active and ready to use.",
      "",
      `<p>Hi <strong>${name}</strong>,</p><p>Congratulations! Your email has been verified and your account is now fully activated. You're all set to start using Mk Timothy & Company.</p>`,
      null,
      "Get Started Now",
      `${process.env.NEXT_PUBLIC_APP_URL || "https://mktimothy.com"}/login`,
      "Thank you for choosing Mk Timothy & Company for your business needs.",
    ),
    text: `Welcome to Mk Timothy & Company!\n\nHi ${name}!\n\nCongratulations! Your account is now fully activated.\n\nGet started: ${process.env.NEXT_PUBLIC_APP_URL || "https://mktimothy.com"}/login\n\nBest regards,\nMk Timothy & Company Team`,
  }),

  accountCreatedWithPassword: (name: string, password: string) => ({
    subject: "Your Account Credentials - Mk Timothy & Company",
    html: buildMarketingEmail(
      "Your Account Credentials",
      "Your application has been received and your account has been automatically created.",
      "",
      `<p>Hi <strong>${name}</strong>,</p><p>Your application has been received and your account has been automatically created. You can use the temporary password below to log in. We highly recommend logging in and changing your password as soon as possible.</p>`,
      password,
      "Log in to your account",
      `${process.env.NEXT_PUBLIC_APP_URL || "https://mktimothy.com"}/login`,
      "This is an automated message containing your account credentials.",
    ),
    text: `Hi ${name}!\n\nYour application has been received and your account has been created.\nYour auto-generated password is: ${password}\n\nWe highly recommend logging in and changing your password as soon as possible.\n\nBest regards,\nMk Timothy & Company Team`,
  }),

  investorWelcome: (name: string) => ({
    subject: "🚀 Welcome to East Africa's Premier Investment Network",
    html: buildMarketingEmail(
      "Welcome to Mk Timothy Investor Network",
      "You've just unlocked access to East Africa's most compelling investment opportunities.",
      "You're In!<br>Welcome to the Network",
      `<p style="font-size: 16px; margin-bottom: 24px;">Dear <strong>${name}</strong>,</p>
      <p style="margin-bottom: 24px;">Thank you for registering. You've just unlocked access to East Africa's most compelling investment opportunities.</p>
      
      <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; margin-bottom: 24px; text-align: left; border: 1px solid #e2e8f0;">
        <h3 style="margin-top: 0; color: #111827; font-size: 18px;">Ready to Get Started?</h3>
        <p style="margin-bottom: 12px; font-size: 15px;">
          📅 <a href="https://contact.mktimothy.com" style="color: #ea580c; font-weight: 600; text-decoration: none;">Schedule Your Consultation</a> – 15 minutes to align on your investment mandate
        </p>
        <p style="margin-bottom: 0; font-size: 15px;">
          🔐 <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://mktimothy.com"}/investors-login" style="color: #ea580c; font-weight: 600; text-decoration: none;">Access Your Dashboard</a> – Review curated opportunities matching your criteria
        </p>
      </div>

      <div style="background-color: #fef2f2; padding: 16px 20px; border-left: 4px solid #ef4444; border-radius: 0 8px 8px 0; margin-bottom: 24px; text-align: left;">
        <p style="margin: 0; font-size: 14px; color: #991b1b;">
          <strong>⚠️ Important:</strong> If you don't see a confirmation email from us within 5 minutes, please check your Spam folder and mark us as "Not Spam."
        </p>
      </div>

      <p style="margin-bottom: 24px;">We look forward to connecting you with transformative deals across Uganda and East Africa.</p>
      
      <p style="margin-bottom: 24px; font-size: 14px; color: #6b7280;">If you did not register for this account, please ignore this email or contact us at support@mktimothy.com.</p>
      
      <p style="margin-bottom: 0;"><em>Welcome aboard!</em><br><br>The Mk Timothy Team</p>`,
      null, // No password
      "Access Your Dashboard",
      `${process.env.NEXT_PUBLIC_APP_URL || "https://mktimothy.com"}/investors-login`,
      "Grow your idea with Mk Timothy",
    ),
    text: `Dear ${name},\n\nYou're In! Welcome to the Mk Timothy Investor Network.\nThank you for registering. You've just unlocked access to East Africa's most compelling investment opportunities.\n\nReady to Get Started?\n📅 Schedule Your Consultation – 15 minutes to align on your investment mandate\n🔐 Access Your Dashboard – Review curated opportunities matching your criteria\n\n⚠️ Important: If you don't see a confirmation email from us within 5 minutes, please check your Spam folder and mark us as "Not Spam."\n\nWe look forward to connecting you with transformative deals across Uganda and East Africa.\n\nIf you did not register for this account, please ignore this email or contact us at support@mktimothy.com.\n\nWelcome aboard!\nThe Mk Timothy Team\n\nGrow your idea with Mk Timothy`,
  }),

  pitchIdeaAccountCreated: (name: string, password: string) => ({
    subject: "Pitch Idea Application - Mk Timothy & Company",
    html: buildMarketingEmail(
      "Pitch Idea Application Received",
      "Thank you for submitting your pitch idea. We've set up an account to track your progress.",
      "",
      `<p>Hi <strong>${name}</strong>,</p><p>Thank you for submitting your pitch idea. We have successfully received your application to get matched with investors. To track your application progress, we've set up an account for you. Use the temporary password below to log in.</p>`,
      password,
      "Log in to your account",
      `${process.env.NEXT_PUBLIC_APP_URL || "https://mktimothy.com"}/login`,
      "This is an automated message confirming the receipt of your pitch idea.",
    ),
    text: `Hi ${name}!\n\nThank you for submitting your pitch idea. We have successfully received your application to get matched with investors.\nTo track your application progress, we've set up an account for you. Your auto-generated password is: ${password}\n\nWe highly recommend logging in and changing your password as soon as possible.\n\nBest regards,\nMk Timothy & Company Team`,
  }),
};

// Email service interface
export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

// Email service class
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = transporter;
  }

  // Test email connection
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error("Email service connection failed:", error);
      return false;
    }
  }

  // Send email
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"Mk Timothy & Company" <${emailConfig.auth.user}>`,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result.messageId);
      return true;
    } catch (error) {
      console.error("Failed to send email:", error);
      return false;
    }
  }

  // Send verification email
  async sendVerificationEmail(
    email: string,
    name: string,
    code: string,
    expiresIn: number = 15,
  ): Promise<boolean> {
    const template = emailTemplates.emailVerification(name, code, expiresIn);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(
    email: string,
    name: string,
    code: string,
    expiresIn: number = 15,
  ): Promise<boolean> {
    const template = emailTemplates.passwordReset(name, code, expiresIn);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send two-factor authentication email
  async sendTwoFactorEmail(
    email: string,
    name: string,
    code: string,
    expiresIn: number = 10,
  ): Promise<boolean> {
    const template = emailTemplates.twoFactorCode(name, code, expiresIn);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send welcome email
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const template = emailTemplates.welcomeEmail(name);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send account created with password email
  async sendAccountCreatedWithPasswordEmail(
    email: string,
    name: string,
    password: string,
  ): Promise<boolean> {
    const template = emailTemplates.accountCreatedWithPassword(name, password);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send investor welcome email
  async sendInvestorWelcomeEmail(
    email: string,
    name: string
  ): Promise<boolean> {
    const template = emailTemplates.investorWelcome(name);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }

  // Send pitch idea account created email
  async sendPitchIdeaAccountCreatedEmail(
    email: string,
    name: string,
    password: string,
  ): Promise<boolean> {
    const template = emailTemplates.pitchIdeaAccountCreated(name, password);
    return this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });
  }
}

// Create singleton instance
export const emailService = new EmailService();

// Export templates for testing
export { emailTemplates };
