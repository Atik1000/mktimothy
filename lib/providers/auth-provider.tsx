"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  subAdminPermissions?: string[];
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    instagram?: string;
    github?: string;
  };
  jobTitle?: string;
  company?: string;
  skills?: string[];
  languages?: string[];
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  isProfilePublic?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showLocation?: boolean;
  allowMessages?: boolean;
  isVerified?: boolean;
  verificationBadge?: string;
  verificationDate?: string;
  businessType?: string;
  workingDays?: string;
  isWorking?: boolean;
  /** False for brand-new social-login users until they finish /onboarding. */
  onboardingComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string,
    remember?: boolean
  ) => Promise<{
    success: boolean;
    error?: string;
    requiresVerification?: boolean;
    user?: User;
  }>;
  register: (data: RegisterData) => Promise<{
    success: boolean;
    error?: string;
    requiresVerification?: boolean;
  }>;
  logout: (shouldRedirect?: boolean) => Promise<void>;
  refreshAuth: () => Promise<void>;
  handleApiResponse: (response: Response) => Promise<boolean>;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: "USER" | "ADMIN" | "MODERATOR" | "INVESTOR";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Onboarding gate: brand-new Google users have onboardingComplete=false
  // and must finish /onboarding before reaching the rest of the app. Manual
  // signups and existing users default to true, so this never fires for them.
  // The questionnaire flow is chosen from the user's role: investors get the
  // investor questionnaire; everyone else gets the entrepreneur (pitch-idea) flow.
  useEffect(() => {
    if (!isLoading && user && user.onboardingComplete === false) {
      if (pathname !== "/onboarding") {
        const flow =
          user.role === "INVESTOR" ? "investor" : "entrepreneur";
        router.replace(`/onboarding?flow=${flow}`);
      }
    }
  }, [user, isLoading, pathname, router]);

  const initializeAuth = async () => {
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token") ||
        getCookie("auth-token");

      console.log(
        "Initializing auth with token:",
        token ? "Found" : "Not found"
      );

      if (token) {
        console.log("Verifying token...");
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Verify response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Verify response data:", {
            success: data.success,
            hasUser: !!data.user,
          });

          if (data.success && data.user) {
            setUser(data.user);
            console.log("User set successfully:", data.user.email);
          } else {
            console.log("Token invalid, triggering logout");
            // Token invalid, trigger automatic logout
            await handleTokenExpiration();
          }
        } else if (response.status === 401) {
          console.log("Unauthorized response, triggering logout");
          // Unauthorized - token expired or invalid
          await handleTokenExpiration();
        } else {
          console.log("Unexpected response status:", response.status);
          // For other errors, don't auto-logout, just log
          console.error(
            "Auth verification failed with status:",
            response.status
          );
        }
      } else {
        console.log("No token found, user not authenticated");
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      // On network error during initialization, don't auto-logout
    } finally {
      setIsLoading(false);
      console.log("Auth initialization complete");
    }
  };

  const login = async (
    email: string,
    password: string,
    remember: boolean = false
  ) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, remember }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);

        // Store token (always store for session, persistent if remember=true)
        if (data.token) {
          if (remember) {
            localStorage.setItem("auth-token", data.token);
            // Set persistent cookie (30 days) for remember me
            document.cookie = `auth-token=${data.token}; max-age=${
              30 * 24 * 60 * 60
            }; path=/; samesite=strict`;
          } else {
            // Always store in localStorage so the token survives tab refreshes.
            // sessionStorage is wiped on every page reload which caused premature logouts.
            localStorage.setItem("auth-token", data.token);
            // Set session cookie (expires when browser closes)
            document.cookie = `auth-token=${data.token}; path=/; samesite=strict`;
          }
        }

        return { success: true, user: data.user };
      } else {
        return {
          success: false,
          error: data.error,
          requiresVerification: data.requiresVerification,
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          requiresVerification: result.requiresVerification,
        };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = async (shouldRedirect: boolean = true) => {
    try {
      const token =
        localStorage.getItem("auth-token") || getCookie("auth-token");

      if (token) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      // Clear local state and storage
      setUser(null);
      localStorage.removeItem("auth-token");
      sessionStorage.removeItem("auth-token");
      
      // Brute-force cookie deletion for all possible attribute combinations
      const past = "expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = `auth-token=; ${past}`;
      document.cookie = `auth-token=; ${past} samesite=strict;`;
      document.cookie = `auth-token=; ${past} samesite=strict; secure;`;
      document.cookie = `refresh-token=; ${past}`;
      document.cookie = `refresh-token=; ${past} samesite=strict;`;
      document.cookie = `refresh-token=; ${past} samesite=strict; secure;`;

      // Redirect to login
      if (shouldRedirect) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Automatic logout when token expires
  const handleTokenExpiration = async () => {
    console.log("Token expired, logging out automatically...");

    // Call logout endpoint to clear HttpOnly cookies from the backend
    try {
      const token =
        localStorage.getItem("auth-token") || getCookie("auth-token");
      
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
    } catch (error) {
      console.error("Error clearing cookies on token expiration:", error);
    }

    // Clear local state and storage immediately
    setUser(null);
    localStorage.removeItem("auth-token");
    sessionStorage.removeItem("auth-token");
    
    // Brute-force cookie deletion for all possible attribute combinations
    const past = "expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = `auth-token=; ${past}`;
    document.cookie = `auth-token=; ${past} samesite=strict;`;
    document.cookie = `auth-token=; ${past} samesite=strict; secure;`;
    document.cookie = `refresh-token=; ${past}`;
    document.cookie = `refresh-token=; ${past} samesite=strict;`;
    document.cookie = `refresh-token=; ${past} samesite=strict; secure;`;

    // Redirect to login (no blocking alert)
    window.location.href = "/login";
  };

  const refreshAuth = async () => {
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token") ||
        getCookie("auth-token");

      if (token) {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            // Token invalid, trigger automatic logout
            await handleTokenExpiration();
          }
        } else if (response.status === 401) {
          // Unauthorized - token expired or invalid
          await handleTokenExpiration();
        }
      }
    } catch (error) {
      console.error("Auth refresh error:", error);
      // On network error, don't auto-logout, just log the error
    }
  };

  const handleApiResponse = async (response: Response) => {
    if (response.ok) {
      return true;
    } else if (response.status === 401) {
      await handleTokenExpiration();
      return false;
    } else {
      console.error("API response error:", response.statusText);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshAuth,
    handleApiResponse,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper function to get cookie value
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

