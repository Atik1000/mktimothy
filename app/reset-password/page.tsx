"use client";

import Button from "@/components/globals/Button";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ResetPasswordPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";

  const [formData, setFormData] = useState({
    email: emailFromUrl,
    code: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    code?: string;
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [success, setSuccess] = useState(false);

  // Set email from URL parameter
  useEffect(() => {
    if (emailFromUrl) {
      setFormData((prev) => ({ ...prev, email: emailFromUrl }));
    }
  }, [emailFromUrl]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Code validation
    if (!formData.code.trim()) {
      newErrors.code = "Reset code is required";
    } else if (!/^\d{6}$/.test(formData.code.trim())) {
      newErrors.code = "Reset code must be 6 digits";
    }

    // Password validation
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/;
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (!passwordRegex.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setErrors({
          general: data.error || "Failed to reset password. Please try again.",
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setErrors({
        general: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      // Clear errors when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
    };

  const handleResendCode = async () => {
    if (!formData.email) {
      setErrors({ general: "Please enter your email address first" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      if (data.success) {
        setErrors({});
        // Show success message briefly
        setErrors({ general: "New reset code sent to your email!" });
        setTimeout(() => setErrors({}), 3000);
      } else {
        setErrors({ general: data.error || "Failed to resend code" });
      }
    } catch (error) {
      setErrors({ general: "Failed to resend code. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat h-screen flex items-center justify-center font-sofia">
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Main Content */}
        <div className="max-w-[450px] w-full p-6 z-50 text-center">
          

          <h1 className="text-[32px] font-semibold text-white mb-4 font-poppins tracking-tight">
            Password Reset Successful!
          </h1>

          <div className="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
            <p className="text-green-400 text-[15px] font-medium mb-3">
              Your password has been successfully reset.
            </p>
            <p className="text-gray-300 text-[14px] leading-relaxed">
              You can now log in with your new password.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full py-3.5 rounded-lg font-bold text-[15px] transition-colors bg-[#FF6600] hover:bg-[#e65c00] text-white block text-center"
          >
            Go to Log in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat h-screen flex items-center justify-center font-sofia">
      <div className="absolute inset-0 bg-black/50" />

      {/* Main Content */}
      <div className="max-w-[450px] w-full p-6 z-50">
        

        <h1 className="text-[32px] font-semibold text-white mb-4 font-poppins tracking-tight">
          Reset Your Password
        </h1>

        <p className="text-[15px] text-gray-300 mb-8 leading-relaxed">
          Enter the 6-digit code sent to your email and create a new password.
        </p>

        {/* Error/Success Message */}
        {errors.general && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              errors.general.includes("sent")
                ? "bg-green-500/10 border-green-500/20"
                : "bg-red-500/10 border-red-500/20"
            }`}
          >
            <p
              className={`text-[14px] ${
                errors.general.includes("sent")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {errors.general}
            </p>
          </div>
        )}

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <div
              className={`flex items-center border rounded-lg px-3 py-3 transition-colors ${
                errors.email
                  ? "border-red-500 bg-white"
                  : "border-transparent bg-white focus-within:border-gray-400"
              }`}
            >
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange("email")}
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

          {/* Reset Code */}
          <div>
            <div
              className={`flex items-center border rounded-lg px-3 py-3 transition-colors ${
                errors.code
                  ? "border-red-500 bg-white"
                  : "border-transparent bg-white focus-within:border-gray-400"
              }`}
            >
              <input
                type="text"
                placeholder="6-digit reset code"
                value={formData.code}
                onChange={handleInputChange("code")}
                disabled={isLoading}
                maxLength={6}
                className="w-full bg-transparent text-gray-900 text-[15px] outline-none placeholder-gray-500"
              />
            </div>
            {errors.code && (
              <p className="text-red-400 text-[13px] mt-1.5 ml-1">
                {errors.code}
              </p>
            )}
          </div>

          {/* New Password */}
          <div>
            <div
              className={`flex items-center border rounded-lg px-3 py-3 transition-colors ${
                errors.newPassword
                  ? "border-red-500 bg-white"
                  : "border-transparent bg-white focus-within:border-gray-400"
              }`}
            >
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleInputChange("newPassword")}
                disabled={isLoading}
                className="w-full bg-transparent text-gray-900 text-[15px] outline-none placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-gray-500 hover:text-gray-800 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-red-400 text-[13px] mt-1.5 ml-1">
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div
              className={`flex items-center border rounded-lg px-3 py-3 transition-colors ${
                errors.confirmPassword
                  ? "border-red-500 bg-white"
                  : "border-transparent bg-white focus-within:border-gray-400"
              }`}
            >
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleInputChange("confirmPassword")}
                disabled={isLoading}
                className="w-full bg-transparent text-gray-900 text-[15px] outline-none placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="ml-2 text-gray-500 hover:text-gray-800 transition-colors"
                tabIndex={-1}
              >
                {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-[13px] mt-1.5 ml-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isLoading}
              className="text-white hover:text-orange-500 font-bold text-[15px] transition-colors"
            >
              Resend Code
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-8 py-3.5 rounded-lg font-bold text-[15px] transition-colors ${
                formData.email && formData.code && formData.newPassword && formData.confirmPassword
                  ? "bg-[#ff6600] hover:bg-[#ff6600] text-white"
                  : "bg-white/10 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
