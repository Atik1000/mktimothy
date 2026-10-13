"use client";

import Button from "@/components/globals/Button";
import { useAuth } from "@/lib/providers/auth-provider";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const OTPPage = () => {
  const { refreshAuth, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "email";
  const message = searchParams.get("message") || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>(message);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  const handleOtpChange = (value: string, index: number) => {
    // Only allow single digit
    if (value.length > 1) return;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Clear errors when typing
    if (error) setError("");

    // Auto focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);

    if (digits.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < digits.length && i < 6; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);

      // Focus on the next empty input or the last input
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const verifyOTP = async (otpCode: string) => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: otpCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Email verified successfully! Redirecting...");
        setError("");

        // Refresh auth state
        await refreshAuth();

        // Redirect to profile page after a short delay
        setTimeout(() => {
          router.push(`/profile/${user?.id}`);
        }, 1500);

        return true;
      } else {
        setError(data.error || "Invalid OTP. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Network error. Please check your connection and try again.");
      return false;
    }
  };

  const resendOTP = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setError("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          type,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("OTP sent successfully! Please check your email.");
        setTimeLeft(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        setError(data.error || "Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      console.error("Resend OTP error:", error);
      setError("Network error. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const otpValue = otp.join("");

    if (otpValue.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");

    const success = await verifyOTP(otpValue);

    if (!success) {
      // Clear OTP on error
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }

    setIsLoading(false);
  };

  const maskedEmail = email.replace(/(.{3})(.*)(@.*)/, "$1***$3");

  return (
    <div className="bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat h-screen">
      <div className="absolute inset-0 bg-black/40" />

      <div className="width relative overflow-hidden pb-[100px] pt-[150px] flex items-center justify-center w-full h-full">
        {/* Main Content */}
        <div className="z-10 max-w-[400px] w-full bg-black/50 p-5 py-10 pt-20 rounded-lg relative">
          <Link
            href="/"
            className="absolute -top-14 mb-10 p-5 py-10 bg-bglight w-fit mx-auto rounded-md -
      left-1/2 -translate-x-1/2"
          >
            <Image
              src="/images/logo.png"
              alt="logo"
              width={100}
              height={100}
              className="w-full h-full max-w-[150px]"
            />
          </Link>

          <div className="">
            {/* Main Content */}
            <div className="z-10 max-w-[400px]">
              {/* Title */}
              <h1 className="text-white aabbss font-bold text-[24px] sm:text-[32px] mb-[10px] sm:mb-[16px]">
                Enter OTP
              </h1>

              <div className="text-white text-base sm:text-xl font-normal aabbss mb-2">
                We sent a 6-digit code to {maskedEmail}
              </div>

              {/* Success Message */}
              {success && (
                <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="w-full h-[1px] bg-white/50 my-[20px] sm:my-[30px]"></div>

              {/* OTP Form */}
              <form className="space-y-[30px]" onSubmit={handleSubmit}>
                {/* OTP Input Boxes */}
                <div className="flex gap-2 sm:gap-4 justify-start">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onPaste={handlePaste}
                      disabled={isLoading}
                      className={`w-[35px] h-[35px] sm:w-[46px] sm:h-[46px] bg-transparent border border-white/70 rounded-[10px] text-white text-center text-[18px] sm:text-[22px] aabbss font-bold outline-none focus:border-greencolor focus:border-2 transition-colors disabled:opacity-50 ${
                        error ? "border-red-500" : ""
                      }`}
                    />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col justify-between items-start sm:items-center gap-4 mt-[30px] sm:mt-[60px] mb-[10px] sm:mb-[15px]">
                  <div className="flex items-center gap-2 w-full">
                    <Button
                      className="cursor-pointer w-full"
                      text={isLoading ? "Verifying..." : "Verify & Continue"}
                      type="submit"
                      disabled={isLoading || otp.join("").length !== 6}
                    />
                  </div>
                  <div className="flex items-start sm:items-center gap-1">
                    <span className="text-white text-[12px] sm:text-sm aabbss font-normal">
                      Didn't receive the OTP?
                    </span>
                    {canResend ? (
                      <button
                        type="button"
                        onClick={resendOTP}
                        disabled={isResending}
                        className="text-greencolor text-[12px] sm:text-sm cursor-pointer underline aabbss font-normal hover:text-greencolor/80 disabled:opacity-50"
                      >
                        {isResending ? "Resending..." : "Resend OTP"}
                      </button>
                    ) : (
                      <span className="text-white/70 text-[12px] sm:text-sm aabbss font-normal">
                        Resend in {timeLeft}s
                      </span>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPPage;
