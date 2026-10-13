import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";

// API Response types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
}

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
    timeout: 30000, // 30 seconds
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor
  client.interceptors.request.use(
    (config) => {
      // Add auth token if available
      if (typeof window !== "undefined") {
        const token =
          localStorage.getItem("auth_token") ||
          sessionStorage.getItem("auth_token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error: AxiosError) => {
      const apiError: ApiError = {
        message: "An error occurred",
        status: error.response?.status || 500,
      };

      if (error.response?.data) {
        const errorData = error.response.data as any;
        apiError.message =
          errorData.message || errorData.error || "An error occurred";
        apiError.code = errorData.code;
        apiError.errors = errorData.errors;
      } else if (error.request) {
        apiError.message = "Network error - please check your connection";
        apiError.status = 0;
      } else {
        apiError.message = error.message || "An unexpected error occurred";
      }

      // Handle specific error cases
      if (error.response?.status === 401) {
        // Unauthorized - clear auth data and redirect to login
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          sessionStorage.removeItem("auth_token");
          // Only redirect if not already on login page
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
      } else if (error.response?.status === 403) {
        // Forbidden - user doesn't have permission
        console.warn("Access forbidden:", apiError.message);
      } else if (error.response?.status && error.response.status >= 500) {
        // Server error
        console.error("Server error:", apiError.message);
      }

      return Promise.reject(apiError);
    }
  );

  return client;
};

// Create the main API client
export const apiClient = createApiClient();

// Utility functions for common API operations
export const api = {
  // GET request
  get: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await apiClient.get<ApiResponse<T>>(url, config);
    return response.data;
  },

  // POST request
  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await apiClient.post<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  // PUT request
  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await apiClient.put<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  // PATCH request
  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await apiClient.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  },

  // DELETE request
  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> => {
    const response = await apiClient.delete<ApiResponse<T>>(url, config);
    return response.data;
  },

  // Upload file
  upload: async <T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> => {
    const formData = new FormData();
    formData.append("file", file);

    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      };
    }

    const response = await apiClient.post<ApiResponse<T>>(
      url,
      formData,
      config
    );
    return response.data;
  },

  // Upload multiple files
  uploadMultiple: async <T = any>(
    url: string,
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    };

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        if (progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      };
    }

    const response = await apiClient.post<ApiResponse<T>>(
      url,
      formData,
      config
    );
    return response.data;
  },
};

// Auth utilities
export const authUtils = {
  setToken: (token: string, remember: boolean = false) => {
    if (typeof window !== "undefined") {
      if (remember) {
        localStorage.setItem("auth_token", token);
      } else {
        sessionStorage.setItem("auth_token", token);
      }
    }
  },

  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return (
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token")
      );
    }
    return null;
  },

  removeToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      sessionStorage.removeItem("auth_token");
    }
  },

  isAuthenticated: (): boolean => {
    return !!authUtils.getToken();
  },
};

// Request/Response logging for development
if (process.env.NODE_ENV === "development") {
  apiClient.interceptors.request.use((config) => {
    console.log(
      `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`,
      {
        data: config.data,
        params: config.params,
      }
    );
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => {
      console.log(
        `✅ API Response: ${response.status} ${response.config.url}`,
        response.data
      );
      return response;
    },
    (error) => {
      console.error(
        `❌ API Error: ${error.response?.status} ${error.config?.url}`,
        error.response?.data
      );
      return Promise.reject(error);
    }
  );
}

// Export types
export type { AxiosError, AxiosRequestConfig, AxiosResponse };

// Default export
export default apiClient;

