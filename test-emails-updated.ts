import { emailService } from './lib/services/email';
import * as dotenv from 'dotenv';
dotenv.config();

async function testEmails() {
  const email = "mianhasaan6789@gmail.com";
  const name = "Mian Hasaan";
  const code = "245855";
  const password = "TempPassword123!";
  
  try {
    console.log("Sending Verification Email...");
    await emailService.sendVerificationEmail(email, name, code);

    console.log("Sending Password Reset...");
    await emailService.sendPasswordResetEmail(email, name, code);

    console.log("Sending Two-Factor Email...");
    await emailService.sendTwoFactorEmail(email, name, code);

    console.log("Sending Welcome Email...");
    await emailService.sendWelcomeEmail(email, name);

    console.log("Sending Account Created With Password...");
    await emailService.sendAccountCreatedWithPasswordEmail(email, name, password);

    console.log("Sending Investor Welcome Email...");
    await emailService.sendInvestorWelcomeEmail(email, name);

    console.log("Sending Pitch Idea Account Created...");
    await emailService.sendPitchIdeaAccountCreatedEmail(email, name, password);
    
    console.log("All 7 emails sent successfully!");
  } catch (err) {
    console.error("Error sending emails:", err);
  }
}

testEmails();
