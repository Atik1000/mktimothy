import { dbHelpers } from "@/lib/config/database";
import { authService } from "@/lib/services/auth";
import { emailService } from "@/lib/services/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, password, testMode = false } = body;

    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: "Missing required fields for testing" },
        { status: 400 }
      );
    }

    const debugInfo: any = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      steps: {},
      errors: [],
      environmentVars: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        JWT_SECRET: !!process.env.JWT_SECRET,
        SMTP_HOST: !!process.env.SMTP_HOST,
        SMTP_USER: !!process.env.SMTP_USER,
        SMTP_PASS: !!process.env.SMTP_PASS,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_SECURE: process.env.SMTP_SECURE,
      },
    };

    // Step 1: Test database connection
    try {
      await dbHelpers.healthCheck();
      debugInfo.steps.database = {
        status: "success",
        message: "Database connection successful",
      };
    } catch (error: any) {
      debugInfo.steps.database = { status: "error", message: error.message };
      debugInfo.errors.push(`Database: ${error.message}`);
    }

    // Step 2: Test if user already exists
    try {
      const existingUser = await dbHelpers.getUserByEmail(email);
      debugInfo.steps.userCheck = {
        status: "success",
        userExists: !!existingUser,
        message: existingUser ? "User already exists" : "User does not exist",
      };

      if (existingUser && !testMode) {
        return NextResponse.json(
          {
            ...debugInfo,
            error:
              "User already exists - use testMode=true to skip user creation",
          },
          { status: 400 }
        );
      }
    } catch (error: any) {
      debugInfo.steps.userCheck = { status: "error", message: error.message };
      debugInfo.errors.push(`User check: ${error.message}`);
    }

    // Step 3: Test email service connection
    try {
      const emailTestResult = await emailService.testConnection();
      debugInfo.steps.emailConnection = {
        status: emailTestResult ? "success" : "error",
        message: emailTestResult
          ? "Email service connected"
          : "Email service connection failed",
      };

      if (!emailTestResult) {
        debugInfo.errors.push("Email service connection failed");
      }
    } catch (error: any) {
      debugInfo.steps.emailConnection = {
        status: "error",
        message: error.message,
      };
      debugInfo.errors.push(`Email connection: ${error.message}`);
    }

    // Step 4: Test sending verification email (if not in test mode)
    if (!testMode) {
      try {
        const emailSent = await emailService.sendVerificationEmail(
          email,
          `${firstName} ${lastName}`,
          "123456", // test code
          15
        );
        debugInfo.steps.emailSend = {
          status: emailSent ? "success" : "error",
          message: emailSent
            ? "Verification email sent"
            : "Failed to send verification email",
        };

        if (!emailSent) {
          debugInfo.errors.push("Failed to send verification email");
        }
      } catch (error: any) {
        debugInfo.steps.emailSend = { status: "error", message: error.message };
        debugInfo.errors.push(`Email send: ${error.message}`);
      }
    }

    // Step 5: Test full registration process (if test mode and no critical errors)
    if (testMode && debugInfo.errors.length === 0) {
      try {
        // First clean up test user if exists
        const existingUser = await dbHelpers.getUserByEmail(email);
        if (existingUser) {
          await dbHelpers.deleteUser(existingUser.id);
        }

        const result = await authService.register({
          email,
          firstName,
          lastName,
          password,
        });

        debugInfo.steps.registration = {
          status: result.success ? "success" : "error",
          message: result.success ? result.message : result.error,
        };

        if (!result.success) {
          debugInfo.errors.push(`Registration: ${result.error}`);
        }

        // Clean up test user
        if (result.success && result.user) {
          await dbHelpers.deleteUser(result.user.id);
          debugInfo.steps.cleanup = {
            status: "success",
            message: "Test user cleaned up",
          };
        }
      } catch (error: any) {
        debugInfo.steps.registration = {
          status: "error",
          message: error.message,
        };
        debugInfo.errors.push(`Registration: ${error.message}`);
      }
    }

    return NextResponse.json({
      ...debugInfo,
      summary: {
        totalSteps: Object.keys(debugInfo.steps).length,
        successfulSteps: Object.values(debugInfo.steps).filter(
          (step: any) => step.status === "success"
        ).length,
        failedSteps: debugInfo.errors.length,
        overallStatus: debugInfo.errors.length === 0 ? "success" : "error",
      },
    });
  } catch (error: any) {
    console.error("Debug registration error:", error);
    return NextResponse.json(
      {
        error: "Debug endpoint failed",
        message: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
