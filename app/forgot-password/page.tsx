"use client";

import Button from "@/components/globals/Button";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const ForgotPasswordPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    general?: string;
  }>({});
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setErrors({
          general:
            data.error || "Failed to send reset email. Please try again.",
        });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setErrors({
        general: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);

    // Clear errors when user starts typing
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  if (success) {
    return (
      <div className="bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat h-screen flex items-center justify-center font-sofia">
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Main Content */}
        <div className="max-w-[450px] w-full p-6 z-50 text-center">
          

          <h1 className="text-[32px] font-semibold text-white mb-4 font-poppins tracking-tight">
            Check Your Email
          </h1>

          <div className="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="text-green-400 text-[15px] font-medium mb-3">
              Password reset instructions have been sent to your email.
            </p>
            <p className="text-gray-300 text-[14px] leading-relaxed">
              Please check your inbox and follow the instructions to reset
              your password. If you don't see the email, check your spam
              folder.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href={`/reset-password?email=${encodeURIComponent(email)}`}
              className="w-full py-3.5 rounded-lg font-bold text-[15px] transition-colors bg-[#FF6600] hover:bg-[#e65c00] text-white block text-center"
            >
              Enter Reset Code
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setEmail("");
              }}
              className="w-full py-3.5 rounded-lg font-bold text-[15px] transition-colors bg-white/10 hover:bg-white/20 text-white"
            >
              Resend Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat h-screen flex items-center justify-center font-sofia">
      <div className="absolute inset-0 bg-black/50" />

      {/* Main Content */}
      <div className="max-w-[450px] w-full p-6 z-50">
       

        <h1 className="text-[32px] font-semibold text-white mb-8 font-poppins tracking-tight">
          Forgot your password?
        </h1>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-[14px]">{errors.general}</p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <div
              className={`flex items-center border rounded-lg px-3 py-3.5 transition-colors ${
                errors.email
                  ? "border-red-500 bg-white"
                  : "border-transparent bg-white focus-within:border-gray-400"
              }`}
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleInputChange}
                disabled={isLoading}
                className="w-full bg-transparent text-gray-900 text-[15px] outline-none placeholder-gray-500"
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-[13px] mt-1.5 ml-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-lg font-bold text-[15px] transition-colors ${
                email
                  ? "bg-[#FF6600] hover:bg-[#e65c00] text-white"
                  : "bg-white/10 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Sending..." : "Send recovery email"}
            </button>
          </div>
        </form>

        <p className="text-gray-400 text-[13px] leading-relaxed mt-6">
          For security, this link expires in 1 hour. Open it immediately or wait until you're ready to complete the password reset process before requesting a password reset.
        </p>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
          <Link
            href="/login"
            className="text-white/80 hover:text-white text-[14px] font-medium transition-colors hover:underline"
          >
            &larr; Back to Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
