import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { api, authUtils } from "../api/client";
import { queryKeys } from "../react-query/queryClient";
import type { User } from "../redux/slices/authSlice";
import {
  clearError,
  loginFailure,
  loginStart,
  loginSuccess,
  logout as logoutAction,
  setLoading,
  updateUser,
} from "../redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";

// Auth API types
interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: string;
}

// Auth API functions
const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/login", credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/register", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post("/auth/logout");
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/auth/refresh");
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    const response = await api.get<User>("/auth/profile");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.patch<User>("/auth/profile", data);
    return response.data;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await api.post("/auth/change-password", data);
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post("/auth/forgot-password", { email });
  },

  resetPassword: async (data: {
    token: string;
    password: string;
  }): Promise<void> => {
    await api.post("/auth/reset-password", data);
  },

  verifyEmail: async (token: string): Promise<void> => {
    await api.post("/auth/verify-email", { token });
  },

  resendVerification: async (): Promise<void> => {
    await api.post("/auth/resend-verification");
  },
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // Get auth state from Redux
  const authState = useAppSelector((state) => state.auth);
  const { user, token, isAuthenticated, isLoading, error } = authState;

  // Get user profile query
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: authApi.getProfile,
    enabled: isAuthenticated && !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onMutate: () => {
      dispatch(loginStart());
    },
    onSuccess: (data, variables) => {
      const { user, token } = data;
      dispatch(loginSuccess({ user, token }));
      authUtils.setToken(token, variables.remember || false);

      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
    onError: (error: any) => {
      dispatch(loginFailure(error.message || "Login failed"));
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authApi.register,
    onMutate: () => {
      dispatch(setLoading(true));
    },
    onSuccess: (data) => {
      const { user, token } = data;
      dispatch(loginSuccess({ user, token }));
      authUtils.setToken(token, false);

      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
    },
    onError: (error: any) => {
      dispatch(loginFailure(error.message || "Registration failed"));
    },
    onSettled: () => {
      dispatch(setLoading(false));
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      dispatch(logoutAction());
      authUtils.removeToken();

      // Clear all cached data
      queryClient.clear();
    },
    onError: (error: any) => {
      // Even if logout fails on server, clear local data
      dispatch(logoutAction());
      authUtils.removeToken();
      queryClient.clear();
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (updatedUser) => {
      dispatch(updateUser(updatedUser));

      // Update cached user data
      queryClient.setQueryData(queryKeys.auth.user(), updatedUser);
    },
    onError: (error: any) => {
      console.error("Profile update failed:", error);
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authApi.changePassword,
    onError: (error: any) => {
      console.error("Password change failed:", error);
    },
  });

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: authApi.forgotPassword,
    onError: (error: any) => {
      console.error("Forgot password failed:", error);
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: authApi.resetPassword,
    onError: (error: any) => {
      console.error("Reset password failed:", error);
    },
  });

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      // Refetch user profile to get updated verification status
      refetchProfile();
    },
    onError: (error: any) => {
      console.error("Email verification failed:", error);
    },
  });

  // Resend verification mutation
  const resendVerificationMutation = useMutation({
    mutationFn: authApi.resendVerification,
    onError: (error: any) => {
      console.error("Resend verification failed:", error);
    },
  });

  // Helper functions
  const login = useCallback(
    (credentials: LoginCredentials) => {
      return loginMutation.mutateAsync(credentials);
    },
    [loginMutation]
  );

  const register = useCallback(
    (data: RegisterData) => {
      return registerMutation.mutateAsync(data);
    },
    [registerMutation]
  );

  const logout = useCallback(() => {
    return logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const updateProfile = useCallback(
    (data: UpdateProfileData) => {
      return updateProfileMutation.mutateAsync(data);
    },
    [updateProfileMutation]
  );

  const changePassword = useCallback(
    (data: { currentPassword: string; newPassword: string }) => {
      return changePasswordMutation.mutateAsync(data);
    },
    [changePasswordMutation]
  );

  const forgotPassword = useCallback(
    (email: string) => {
      return forgotPasswordMutation.mutateAsync(email);
    },
    [forgotPasswordMutation]
  );

  const resetPassword = useCallback(
    (data: { token: string; password: string }) => {
      return resetPasswordMutation.mutateAsync(data);
    },
    [resetPasswordMutation]
  );

  const verifyEmail = useCallback(
    (token: string) => {
      return verifyEmailMutation.mutateAsync(token);
    },
    [verifyEmailMutation]
  );

  const resendVerification = useCallback(() => {
    return resendVerificationMutation.mutateAsync();
  }, [resendVerificationMutation]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Check if user has specific role
  const hasRole = useCallback(
    (role: User["role"]) => {
      return user?.role === role;
    },
    [user]
  );

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback(
    (roles: User["role"][]) => {
      return user ? roles.includes(user.role) : false;
    },
    [user]
  );

  // Check if user is admin
  const isAdmin = useCallback(() => {
    return hasRole("ADMIN");
  }, [hasRole]);

  // Check if user is moderator or admin
  const isModerator = useCallback(() => {
    return hasAnyRole(["MODERATOR", "ADMIN"]);
  }, [hasAnyRole]);

  return {
    // State
    user: profileData || user,
    token,
    isAuthenticated,
    isLoading: isLoading || isLoadingProfile,
    error: error || (profileError as any)?.message,

    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    clearAuthError,
    refetchProfile,

    // Utilities
    hasRole,
    hasAnyRole,
    isAdmin,
    isModerator,

    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    isChangingPassword: changePasswordMutation.isPending,
    isForgettingPassword: forgotPasswordMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    isVerifyingEmail: verifyEmailMutation.isPending,
    isResendingVerification: resendVerificationMutation.isPending,

    // Mutation errors
    loginError: loginMutation.error as any,
    registerError: registerMutation.error as any,
    updateProfileError: updateProfileMutation.error as any,
    changePasswordError: changePasswordMutation.error as any,
    forgotPasswordError: forgotPasswordMutation.error as any,
    resetPasswordError: resetPasswordMutation.error as any,
    verifyEmailError: verifyEmailMutation.error as any,
    resendVerificationError: resendVerificationMutation.error as any,
  };
};
