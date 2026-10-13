import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: 5 minutes
      staleTime: 1000 * 60 * 5,
      // Cache time: 10 minutes
      gcTime: 1000 * 60 * 10,
      // Retry failed requests 3 times
      retry: 3,
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus
      refetchOnWindowFocus: false,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Global error handler for queries
queryClient.setMutationDefaults(["auth"], {
  mutationFn: async (variables: any) => {
    // This will be overridden by specific mutations
    throw new Error("Mutation function not implemented");
  },
  onError: (error: any) => {
    console.error("Authentication mutation error:", error);
    // Handle auth errors globally
    if (error?.status === 401) {
      // Redirect to login or refresh token
      window.location.href = "/login";
    }
  },
});

// Set default error handler for all queries
queryClient.setQueryDefaults(["listings"], {
  staleTime: 1000 * 60 * 2, // 2 minutes for listings
});

queryClient.setQueryDefaults(["whatsapp"], {
  staleTime: 1000 * 30, // 30 seconds for WhatsApp data (more real-time)
});

queryClient.setQueryDefaults(["notifications"], {
  staleTime: 1000 * 15, // 15 seconds for notifications
});

// Global error boundary for React Query
export const handleQueryError = (error: any) => {
  console.error("Query error:", error);

  // Handle different types of errors
  if (error?.status === 401) {
    // Unauthorized - redirect to login
    window.location.href = "/login";
  } else if (error?.status === 403) {
    // Forbidden - show access denied message
    console.warn("Access denied:", error.message);
  } else if (error?.status >= 500) {
    // Server error - show generic error message
    console.error("Server error:", error.message);
  } else if (error?.name === "NetworkError") {
    // Network error - show connection error
    console.error("Network error:", error.message);
  }
};

// Query key factories for consistent key management
export const queryKeys = {
  // Auth keys
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
    session: () => [...queryKeys.auth.all, "session"] as const,
  },

  // Listing keys
  listings: {
    all: ["listings"] as const,
    lists: () => [...queryKeys.listings.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.listings.lists(), filters] as const,
    details: () => [...queryKeys.listings.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.listings.details(), id] as const,
    user: (userId: string) =>
      [...queryKeys.listings.all, "user", userId] as const,
    featured: () => [...queryKeys.listings.all, "featured"] as const,
    search: (query: string) =>
      [...queryKeys.listings.all, "search", query] as const,
    categories: () => [...queryKeys.listings.all, "categories"] as const,
  },

  // WhatsApp keys
  whatsapp: {
    all: ["whatsapp"] as const,
    businesses: () => [...queryKeys.whatsapp.all, "businesses"] as const,
    business: (id: string) => [...queryKeys.whatsapp.businesses(), id] as const,
    conversations: (businessId: string) =>
      [...queryKeys.whatsapp.all, "conversations", businessId] as const,
    conversation: (id: string) =>
      [...queryKeys.whatsapp.all, "conversation", id] as const,
    messages: (conversationId: string) =>
      [...queryKeys.whatsapp.all, "messages", conversationId] as const,
    templates: (businessId: string) =>
      [...queryKeys.whatsapp.all, "templates", businessId] as const,
    template: (id: string) =>
      [...queryKeys.whatsapp.all, "template", id] as const,
    campaigns: (businessId: string) =>
      [...queryKeys.whatsapp.all, "campaigns", businessId] as const,
    campaign: (id: string) =>
      [...queryKeys.whatsapp.all, "campaign", id] as const,
    analytics: (
      businessId: string,
      dateRange: { start: string; end: string }
    ) =>
      [...queryKeys.whatsapp.all, "analytics", businessId, dateRange] as const,
  },

  // Notification keys
  notifications: {
    all: ["notifications"] as const,
    lists: () => [...queryKeys.notifications.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.notifications.lists(), filters] as const,
    unread: () => [...queryKeys.notifications.all, "unread"] as const,
    settings: () => [...queryKeys.notifications.all, "settings"] as const,
  },

  // Category keys
  categories: {
    all: ["categories"] as const,
    lists: () => [...queryKeys.categories.all, "list"] as const,
    tree: () => [...queryKeys.categories.all, "tree"] as const,
  },

  // User keys
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    profile: () => [...queryKeys.users.all, "profile"] as const,
  },
};

// Utility functions for cache management
export const invalidateQueries = {
  auth: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.all }),
  listings: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.listings.all }),
  whatsapp: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.whatsapp.all }),
  notifications: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  categories: () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all }),
  users: () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all }),
};

export const removeQueries = {
  auth: () => queryClient.removeQueries({ queryKey: queryKeys.auth.all }),
  listings: () =>
    queryClient.removeQueries({ queryKey: queryKeys.listings.all }),
  whatsapp: () =>
    queryClient.removeQueries({ queryKey: queryKeys.whatsapp.all }),
  notifications: () =>
    queryClient.removeQueries({ queryKey: queryKeys.notifications.all }),
  categories: () =>
    queryClient.removeQueries({ queryKey: queryKeys.categories.all }),
  users: () => queryClient.removeQueries({ queryKey: queryKeys.users.all }),
};
