"use client";

import Button from "@/components/globals/Button";
import { FullPageLoader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/providers/auth-provider";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaFacebook, FaGoogle } from "react-icons/fa";
import { IoLogoWhatsapp } from "react-icons/io";
import { IoLogoLinkedin } from "react-icons/io5";

const SignUpPage = () => {
  const { register, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState<string>("");
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

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
        console.log("Facebook signup - Coming soon!");
        setErrors({ general: "Facebook signup is coming soon!" });
      },
    },
    {
      icon: IoLogoLinkedin,
      alt: "LinkedIn",
      color: "hover:text-blue-600",
      onClick: () => {
        console.log("LinkedIn signup - Coming soon!");
        setErrors({ general: "LinkedIn signup is coming soon!" });
      },
    },
    {
      icon: IoLogoWhatsapp,
      alt: "WhatsApp",
      color: "hover:text-green-500",
      onClick: () => {
        console.log("WhatsApp signup - Coming soon!");
        setErrors({ general: "WhatsApp signup is coming soon!" });
      },
    },
  ];

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d\s]).{8,}$/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
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
      const result = await register(formData);

      if (result.success) {
        if (result.requiresVerification) {
          router.push(
            `/otp?email=${encodeURIComponent(
              formData.email
            )}&type=email&message=Account created successfully! Please check your email for verification code.`
          );
        } else {
          router.push("/");
        }
      } else {
        setErrors({
          general: result.error || "Registration failed. Please try again.",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      setErrors({
        general: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: any) => {
    if (!credentialResponse?.credential) {
      setErrors({ general: "Google signup failed. No credential received." });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // Decode the JWT for fallback fields + read the email for OTP redirect.
      // The raw credential is also sent so the server can verify it.
      const decoded = JSON.parse(
        atob(credentialResponse.credential.split(".")[1])
      );

      // Create a social login request
      const response = await fetch("/api/auth/social-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "GOOGLE",
          credential: credentialResponse.credential, // server verifies this
          // Fallback fields used only if server-side verification is unavailable
          providerId: decoded.sub,
          email: decoded.email,
          firstName: decoded.given_name || "",
          lastName: decoded.family_name || "",
          avatarUrl: decoded.picture,
          providerData: decoded,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess("Google signup successful! Redirecting...");
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
          // Brand-new Google users must complete onboarding (the multi-step
          // questionnaire); everyone else goes home. Standard portal →
          // entrepreneur (pitch-idea) flow.
          if (result.requiresOnboarding) {
            window.location.href = "/onboarding?flow=entrepreneur";
          } else {
            window.location.href = "/";
          }
        }, 1000);
      } else {
        if (result.requiresVerification) {
          router.push(
            `/otp?email=${encodeURIComponent(decoded.email)}&type=email`
          );
        } else {
          setErrors({
            general: result.error || "Google signup failed. Please try again.",
          });
        }
      }
    } catch (error) {
      console.error("Google signup error:", error);
      setErrors({
        general: "Google signup failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    console.error("Google signup error");
    setErrors({
      general: "Google signup failed. Please try again.",
    });
  };

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [field]: e.target.value,
      }));

      // Clear errors when user starts typing
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

  // Get Google Client ID from environment variables
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  return (
    <div className="bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat h-screen">
      <div className="absolute inset-0 bg-black/40" />

      <div className="width relative overflow-hidden pb-[100px] pt-[150px] flex items-center justify-center w-full h-full">
        {/* Main Content */}
        <div className="z-10 max-w-[400px] w-full bg-black/50 p-5 py-10 pt-20 rounded-lg relative">
          <Link
            href="/"
            className="absolute -top-14 mb-10 p-5 py-10 bg-bglight w-fit mx-auto rounded-md - left-1/2 -translate-x-1/2"
          >
            <Image
              src="/images/logo.png"
              alt="logo"
              width={100}
              height={100}
              className="w-full h-full max-w-[150px]"
            />
          </Link>

          {/* Google Signup Button */}
          {googleClientId ? (
            <GoogleOAuthProvider clientId={googleClientId}>
              <div className="mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={handleGoogleLoginError}
                  theme="filled_black"
                  size="large"
                  width="100%"
                  text="continue_with"
                />
              </div>
            </GoogleOAuthProvider>
          ) : (
            <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-yellow-400 text-sm text-center">
                Google Signup is not configured. Please add
                NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-lightgray"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black/50 text-white rounded">
                Or create account with email
              </span>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Form Fields */}
          <form className="space-y-[20px]" onSubmit={handleSubmit}>
            {/* Name Fields */}
            <div className="relative grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange("firstName")}
                  disabled={isLoading}
                  className={`w-full bg-bglight text-white aabbss text-[16px] sm:text-[18px]  pb-[3px] placeholder-white outline-none border-b-[3px] rounded-lg border-transparent focus:border-greencolor focus:outline-none  disabled:opacity-50 px-2 ${
                    errors.firstName ? "text-red-400" : ""
                  }`}
                />
                <div
                  className={`w-full h-[1px] ${
                    errors.firstName ? "bg-red-500" : ""
                  }`}
                ></div>
                {errors.firstName && (
                  <p className="text-red-400 text-xs mt-1 ml-[10px]">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange("lastName")}
                  disabled={isLoading}
                  className={`w-full bg-bglight text-white aabbss text-[16px] sm:text-[18px]  pb-[3px] placeholder-white outline-none border-b-[3px] rounded-lg border-transparent focus:border-greencolor focus:outline-none  disabled:opacity-50 px-2 ${
                    errors.lastName ? "text-red-400" : ""
                  }`}
                />
                <div
                  className={`w-full h-[1px] ${
                    errors.lastName ? "bg-red-500" : ""
                  }`}
                ></div>
                {errors.lastName && (
                  <p className="text-red-400 text-xs mt-1 ml-[10px]">
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange("email")}
                disabled={isLoading}
                className={`w-full bg-bglight text-white aabbss text-[16px] sm:text-[18px]  pb-[3px] placeholder-white outline-none border-b-[3px] rounded-lg border-transparent focus:border-greencolor focus:outline-none  disabled:opacity-50 px-2 ${
                  errors.email ? "text-red-400" : ""
                }`}
              />
              <div
                className={`w-full h-[1px] ${errors.email ? "bg-red-500" : ""}`}
              ></div>
              {errors.email && (
                <p className="text-red-400 text-sm mt-1 ml-[10px]">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  disabled={isLoading}
                  className={`w-full bg-bglight text-white aabbss text-[16px] sm:text-[18px]  pb-[3px] placeholder-white outline-none border-b-[3px] rounded-lg border-transparent focus:border-greencolor focus:outline-none  disabled:opacity-50 px-2 ${
                    errors.password ? "text-red-400" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-white hover:text-greencolor transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div
                className={`w-full h-[1px] ${
                  errors.password ? "bg-red-500" : ""
                }`}
              ></div>
              {errors.password && (
                <p className="text-red-400 text-sm mt-1 ml-[10px]">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange("confirmPassword")}
                  disabled={isLoading}
                  className={`w-full bg-bglight text-white aabbss text-[16px] sm:text-[18px]  pb-[3px] placeholder-white outline-none border-b-[3px] rounded-lg border-transparent focus:border-greencolor focus:outline-none  disabled:opacity-50 px-2 ${
                    errors.confirmPassword ? "text-red-400" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-2 text-white hover:text-greencolor transition-colors"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div
                className={`w-full h-[1px] ${
                  errors.confirmPassword ? "bg-red-500" : ""
                }`}
              ></div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1 ml-[10px]">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-end items-center mt-[40px] sm:mt-[60px] mb-[10px] sm:mb-[15px]">
              <div className="flex items-center gap-2">
                <Button
                  text="Login"
                  link="/login"
                  secondary
                  disabled={isLoading}
                />
                <Button
                  text={isLoading ? "Creating Account..." : "Sign up"}
                  type="submit"
                  disabled={isLoading}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
