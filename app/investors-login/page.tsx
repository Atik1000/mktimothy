"use client";

import Button from "@/components/globals/Button";
import { FullPageLoader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/providers/auth-provider";
import { useGoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { IoLogoLinkedin } from "react-icons/io5";
import { toast } from "react-hot-toast";

const CustomGoogleButton = ({
  onSuccess,
  onError,
}: {
  onSuccess: (userInfo: any) => void;
  onError: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        );
        const userInfo = await userInfoRes.json();
        onSuccess(userInfo);
      } catch (err) {
        console.error("Failed to fetch Google user info", err);
        onError();
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      onError();
    },
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={loading}
      className="w-full py-2.5 rounded-lg font-bold text-[15px] bg-white text-gray-800 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 border border-gray-200 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      <FcGoogle className="text-[#DB4437]" size={18} />
      {loading ? "Connecting to Google..." : "Continue with Google"}
    </button>
  );
};

const InvestorsLoginPage = () => {
  const { login, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("/") || "/";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [success, setSuccess] = useState<string>("");

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
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
      const result = await login(
        formData.email,
        formData.password,
        formData.remember,
      );

      if (result.success) {
        if (result.user?.role === "USER") {
          await logout(false);
          setIsLoading(false);
          toast.error("Please use the standard Login page.");
          return;
        }

        setSuccess("Login successful! Redirecting...");
        setErrors({});

        setTimeout(() => {
          // HARD navigation — see app/login/page.tsx: client-side mounting
          // of the landing page crashes against its legacy animation
          // engine (NotFoundError insertBefore/removeChild).
          window.location.href = redirectTo;
        }, 1000);
      } else {
        if (result.requiresVerification) {
          router.push(
            `/otp?email=${encodeURIComponent(formData.email)}&type=email`,
          );
        } else {
          setErrors({
            general: result.error || "Login failed. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrors({
        general: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (userInfo: any) => {
    if (!userInfo?.email) {
      setErrors({ general: "Google login failed. No user info received." });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Create a social login request
      const response = await fetch("/api/auth/social-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "GOOGLE",
          providerId: userInfo.sub,
          email: userInfo.email,
          firstName: userInfo.given_name || "",
          lastName: userInfo.family_name || "",
          avatarUrl: userInfo.picture,
          providerData: userInfo,
          role: "INVESTOR", // Hint to the backend that this is the investor login
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.user?.role === "USER") {
          setIsLoading(false);
          toast.error("Please use the standard Login page.");
          return;
        }

        setSuccess("Google login successful! Redirecting...");
        setErrors({});

        if (result.token) {
          sessionStorage.setItem("auth-token", result.token);
          localStorage.setItem("auth-token", result.token);
          document.cookie = `auth-token=${
            result.token
          }; path=/; secure; samesite=strict; max-age=${7 * 24 * 60 * 60}`;
        }

        setTimeout(() => {
          // Brand-new Google users complete onboarding before continuing.
          // Investor portal → investor questionnaire flow.
          window.location.href = result.requiresOnboarding
            ? "/onboarding?flow=investor"
            : redirectTo;
        }, 1000);
      } else {
        if (result.requiresVerification) {
          router.push(
            `/otp?email=${encodeURIComponent(userInfo.email)}&type=email`,
          );
        } else {
          setErrors({
            general: result.error || "Google login failed. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Google login error:", error);
      setErrors({
        general: "Google login failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    setErrors({
      general: "Google login failed. Please try again.",
    });
  };

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: field === "remember" ? e.target.checked : e.target.value,
      }));

      if (errors[field as keyof typeof errors]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }
      if (success) {
        setSuccess("");
      }
    };

  if (authLoading) {
    return <FullPageLoader />;
  }

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <div className="bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat min-h-screen flex items-center justify-center overflow-y-auto py-10">
      <div className="absolute inset-0 bg-black/50" />

      {/* Main Content */}
      <div className="max-w-[450px] w-full px-5 sm:px-4 py-4 z-20">
        <h1 className="text-[32px] font-bold text-white mb-2 font-poppins tracking-tight">
          Log in
        </h1>
        <p className="text-[15px] text-gray-300 mb-8">
          Don't have an investor account?{" "}
          <Link
            href="/investors"
            className="text-orange-600 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>

        {/* Tabs */}
        <div className="flex border-b border-white/20 mb-8">
          <Link
            href="/login"
            className="py-3 pr-6 text-white/70 font-medium text-[15px] hover:text-white transition-colors flex items-center"
          >
            Entrepreneur Login
          </Link>
          <div className="py-3 px-6 border-b-2 border-white text-white font-semibold text-[15px] flex items-center cursor-default">
            Investor Login
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-[14px]">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 text-[14px]">{errors.general}</p>
          </div>
        )}

        {/* Form Fields */}
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

          {/* Password */}
          <div>
            <div
              className={`flex items-center border rounded-lg px-3 py-3 transition-colors ${
                errors.password
                  ? "border-red-500 bg-white"
                  : "border-transparent bg-white focus-within:border-gray-400"
              }`}
            >
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 6 characters)"
                value={formData.password}
                onChange={handleInputChange("password")}
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
            {errors.password && (
              <p className="text-red-400 text-[13px] mt-1.5 ml-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Forgot password */}
          <div className="pt-1">
            <Link
              href="/forgot-password"
              className="text-white/80 text-[14px] hover:text-white underline underline-offset-2 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3.5 rounded-lg font-bold text-[15px] transition-colors ${
                formData.email && formData.password
                  ? "bg-[#FF6600] hover:bg-[#e65c00] text-white"
                  : "bg-white/10 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 mt-10 mb-8">
          <div className="flex-1 h-px bg-white/20"></div>
          <span className="text-[13px] text-gray-300">Or log in with</span>
          <div className="flex-1 h-px bg-white/20"></div>
        </div>

        {/* Google Login Button */}
        <div className="flex justify-center w-full">
          {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
              <div className="w-full">
                <CustomGoogleButton
                  onSuccess={handleGoogleLogin}
                  onError={handleGoogleLoginError}
                />
              </div>
            </GoogleOAuthProvider>
          ) : (
            <div className="w-full p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 text-sm text-center">
                Google Login is not configured.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvestorsLoginPage;
