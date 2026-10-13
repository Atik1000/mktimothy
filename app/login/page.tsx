"use client";

import Button from "@/components/globals/Button";
import { FullPageLoader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/providers/auth-provider";
import { useGoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { FaEye, FaEyeSlash, FaFacebook, FaGoogle } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { IoLogoLinkedin } from "react-icons/io5";
import { toast } from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";

const CustomGoogleButton = ({ onSuccess, onError }: { onSuccess: (userInfo: any) => void, onError: () => void }) => {
  const [loading, setLoading] = useState(false);
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
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

const LoginPage = () => {
  const { login, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Read the ?redirect= param (set by middleware when bouncing unauthenticated users)
  const redirectTo = searchParams.get("redirect") || "/";

  // Admin domain
  const ADMIN_DOMAIN = "https://1420.mktimothy.com";

  const [isAdminDomain, setIsAdminDomain] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsAdminDomain(window.location.hostname.includes("1420"));
      
    }
  }, []);

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

  // Social login buttons data (keeping only for display, but implementing Google only)
  const socialLoginButtons = [
    {
      icon: FaGoogle,
      alt: "Google",
      color: "hover:text-red-500",
      onClick: () => {
        // Google login is handled by GoogleOAuthProvider component
        console.log("Use the Google login button below");
      },
    },
    {
      icon: FaFacebook,
      alt: "Facebook",
      color: "hover:text-blue-500",
      onClick: () => {
        console.log("Facebook login - Coming soon!");
        setErrors({ general: "Facebook login is coming soon!" });
      },
    },
    {
      icon: IoLogoLinkedin,
      alt: "LinkedIn",
      color: "hover:text-blue-600",
      onClick: () => {
        console.log("LinkedIn login - Coming soon!");
        setErrors({ general: "LinkedIn login is coming soon!" });
      },
    },
    {
      icon: IoLogoWhatsapp,
      alt: "WhatsApp",
      color: "hover:text-green-500",
      onClick: () => {
        console.log("WhatsApp login - Coming soon!");
        setErrors({ general: "WhatsApp login is coming soon!" });
      },
    },
  ];

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
        if (result.user?.role === "INVESTOR") {
          await logout(false);
          setIsLoading(false);
          toast.error("Please use the Investor Portal to log in.");
          return;
        }

        setSuccess("Login successful! Redirecting...");
        setErrors({});

        setTimeout(() => {
          // Admins and moderators always go to the admin panel domain
          if (
            result.user?.role === "ADMIN" ||
            result.user?.role === "MODERATOR"
          ) {
            window.location.href = `${ADMIN_DOMAIN}/dashboard`;
          } else {
            // HARD navigation (not router.push): the landing page boots a
            // legacy full-document animation engine that re-parents DOM
            // nodes React owns. Mounting that page client-side made the
            // engine fight React's commits → "client-side exception"
            // crashes right after login. A full load boots cleanly (this
            // is also why Google login never crashed — it already used
            // window.location.href).
            window.location.href = redirectTo;
          }
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
        }),
      });

      const result = await response.json();

      if (result.success) {
        if (result.user?.role === "INVESTOR") {
          setIsLoading(false);
          toast.error("Please use the Investor Portal to log in.");
          return;
        }

        setSuccess("Google login successful! Redirecting...");
        setErrors({});

        // Store tokens properly for logout to work
        if (result.token) {
          // Store token in both sessionStorage and localStorage for consistency with auth provider
          sessionStorage.setItem("auth-token", result.token);
          localStorage.setItem("auth-token", result.token);

          // Set cookie for server-side access
          document.cookie = `auth-token=${
            result.token
          }; path=/; secure; samesite=strict; max-age=${7 * 24 * 60 * 60}`;
        }

        setTimeout(() => {
          // Admins and moderators always go to the admin panel domain
          if (
            result.user?.role === "ADMIN" ||
            result.user?.role === "MODERATOR"
          ) {
            window.location.href = `${ADMIN_DOMAIN}/dashboard`;
          } else if (result.requiresOnboarding) {
            // Brand-new Google users complete onboarding before continuing.
            // Standard portal → entrepreneur (pitch-idea) questionnaire flow.
            window.location.href = "/onboarding?flow=entrepreneur";
          } else {
            window.location.href = redirectTo;
          }
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
    console.error("Google login error");
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

      // Clear errors and success when user starts typing
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

  // Admin login view
  if (isAdminDomain) {
    return (
      <div className="bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat min-h-screen flex flex-col items-center justify-center font-sans">
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="z-20 flex flex-col items-center justify-center w-full px-4">
          {/* Logo area */}
          <div className="mb-8 flex flex-col items-center justify-center">
            <Image
              src="/images/logo.png"
              alt="Logo"
              width={250}
              height={60}
              className="object-contain"
            />
          </div>
          
          <h2 className="text-[#FF6600] text-[26px] font-bold mb-6 font-poppins text-center">Admin Login</h2>
          
          {/* Form Container */}
          <div className="bg-white w-full max-w-[380px] p-8 pb-10 shadow-xl rounded-lg">
             {/* Success Message */}
             {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            {/* Error Message */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                  </div>
                  <input
                    type="email"
                    placeholder="Username"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    disabled={isLoading}
                    className="pl-7 w-full bg-transparent border-b border-gray-300 py-1.5 text-gray-700 outline-none focus:border-[#FF6600] transition-colors placeholder-gray-400 text-sm"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-1 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    disabled={isLoading}
                    className="pl-7 w-full bg-transparent border-b border-gray-300 py-1.5 text-gray-700 outline-none focus:border-[#FF6600] transition-colors placeholder-gray-400 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center bg-gray-100 px-2 py-0.5 h-6 mt-1 rounded shadow-sm text-[10px] font-bold text-gray-600 hover:text-gray-900 border border-gray-200"
                    tabIndex={-1}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FF6600] text-white py-2.5 font-bold text-[13px] hover:bg-[#e65c00] transition-colors shadow-sm rounded"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Get Google Client ID from environment variables
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
          Don't have an account?{" "}
          <Link
            href="/pitch-idea"
            className="text-orange-600 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>

        {/* Tabs */}
        <div className="flex border-b border-white/20 mb-8">
          <div className="py-3 pr-6 border-b-2 border-white text-white font-semibold text-[15px] flex items-center cursor-default">
            Entrepreneur Login
          </div>
          <Link
            href="/investors-login"
            className="py-3 px-6 text-white/70 font-medium text-[15px] hover:text-white transition-colors flex items-center"
          >
            Investor Login
          </Link>
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
                <CustomGoogleButton onSuccess={handleGoogleLogin} onError={handleGoogleLoginError} />
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

export default LoginPage;
