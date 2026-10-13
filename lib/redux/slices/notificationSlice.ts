import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface SystemNotification {
  id: string;
  type:
    | "INFO"
    | "SUCCESS"
    | "WARNING"
    | "ERROR"
    | "WHATSAPP"
    | "LISTING"
    | "USER"
    | "SYSTEM";
  title: string;
  message: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  isArchived: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category:
    | "GENERAL"
    | "WHATSAPP"
    | "LISTING"
    | "USER"
    | "SYSTEM"
    | "MARKETING"
    | "SECURITY";
  userId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
  expiresAt?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  whatsappNotifications: boolean;
  categories: {
    general: boolean;
    whatsapp: boolean;
    listing: boolean;
    user: boolean;
    system: boolean;
    marketing: boolean;
    security: boolean;
  };
  frequency: "IMMEDIATE" | "HOURLY" | "DAILY" | "WEEKLY";
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
}

interface NotificationState {
  // Notifications
  notifications: SystemNotification[];
  unreadCount: number;
  totalCount: number;

  // Filters
  filters: {
    type?: SystemNotification["type"][];
    category?: SystemNotification["category"][];
    priority?: SystemNotification["priority"][];
    isRead?: boolean;
    dateRange?: { start: string; end: string };
  };

  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Settings
  settings: NotificationSettings;

  // UI states
  isNotificationPanelOpen: boolean;
  selectedNotifications: string[];
  viewMode: "all" | "unread" | "archived";
  sortBy: "newest" | "oldest" | "priority";

  // Loading states
  isLoading: boolean;
  isLoadingSettings: boolean;
  isMarkingAsRead: boolean;
  isArchiving: boolean;
  isDeleting: boolean;

  // Error states
  error: string | null;
  settingsError: string | null;

  // Real-time updates
  isConnected: boolean;
  lastUpdated: string | null;
}

const defaultSettings: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  smsNotifications: false,
  whatsappNotifications: true,
  categories: {
    general: true,
    whatsapp: true,
    listing: true,
    user: true,
    system: true,
    marketing: false,
    security: true,
  },
  frequency: "IMMEDIATE",
  quietHours: {
    enabled: false,
    startTime: "22:00",
    endTime: "08:00",
    timezone: "UTC",
  },
};

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  totalCount: 0,
  filters: {},
  currentPage: 1,
  pageSize: 20,
  totalPages: 0,
  settings: defaultSettings,
  isNotificationPanelOpen: false,
  selectedNotifications: [],
  viewMode: "all",
  sortBy: "newest",
  isLoading: false,
  isLoadingSettings: false,
  isMarkingAsRead: false,
  isArchiving: false,
  isDeleting: false,
  error: null,
  settingsError: null,
  isConnected: false,
  lastUpdated: null,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setLoadingSettings: (state, action: PayloadAction<boolean>) => {
      state.isLoadingSettings = action.payload;
    },
    setMarkingAsRead: (state, action: PayloadAction<boolean>) => {
      state.isMarkingAsRead = action.payload;
    },
    setArchiving: (state, action: PayloadAction<boolean>) => {
      state.isArchiving = action.payload;
    },
    setDeleting: (state, action: PayloadAction<boolean>) => {
      state.isDeleting = action.payload;
    },

    // Error states
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSettingsError: (state, action: PayloadAction<string | null>) => {
      state.settingsError = action.payload;
    },

    // Notifications
    setNotifications: (state, action: PayloadAction<SystemNotification[]>) => {
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
      state.totalCount = action.payload.length;
    },
    addNotification: (state, action: PayloadAction<SystemNotification>) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.isRead) {
        state.unreadCount += 1;
      }
      state.totalCount += 1;
      state.lastUpdated = new Date().toISOString();
    },
    updateNotification: (state, action: PayloadAction<SystemNotification>) => {
      const index = state.notifications.findIndex(
        (n) => n.id === action.payload.id
      );
      if (index !== -1) {
        const oldNotification = state.notifications[index];
        state.notifications[index] = action.payload;

        // Update unread count if read status changed
        if (oldNotification.isRead !== action.payload.isRead) {
          if (action.payload.isRead) {
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          } else {
            state.unreadCount += 1;
          }
        }
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );

      if (notification && !notification.isRead) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.totalCount = Math.max(0, state.totalCount - 1);
    },

    // Bulk operations
    markAsRead: (state, action: PayloadAction<string[]>) => {
      const notificationIds = action.payload;
      notificationIds.forEach((id) => {
        const notification = state.notifications.find((n) => n.id === id);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
    },
    markAsUnread: (state, action: PayloadAction<string[]>) => {
      const notificationIds = action.payload;
      notificationIds.forEach((id) => {
        const notification = state.notifications.find((n) => n.id === id);
        if (notification && notification.isRead) {
          notification.isRead = false;
          notification.readAt = undefined;
          state.unreadCount += 1;
        }
      });
    },
    markAllAsRead: (state) => {
      state.notifications.forEach((notification) => {
        if (!notification.isRead) {
          notification.isRead = true;
          notification.readAt = new Date().toISOString();
        }
      });
      state.unreadCount = 0;
    },
    archiveNotifications: (state, action: PayloadAction<string[]>) => {
      const notificationIds = action.payload;
      notificationIds.forEach((id) => {
        const notification = state.notifications.find((n) => n.id === id);
        if (notification) {
          notification.isArchived = true;
        }
      });
    },
    unarchiveNotifications: (state, action: PayloadAction<string[]>) => {
      const notificationIds = action.payload;
      notificationIds.forEach((id) => {
        const notification = state.notifications.find((n) => n.id === id);
        if (notification) {
          notification.isArchived = false;
        }
      });
    },
    deleteNotifications: (state, action: PayloadAction<string[]>) => {
      const notificationIds = action.payload;
      notificationIds.forEach((id) => {
        const notification = state.notifications.find((n) => n.id === id);
        if (notification && !notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
      state.notifications = state.notifications.filter(
        (n) => !notificationIds.includes(n.id)
      );
      state.totalCount = Math.max(0, state.totalCount - notificationIds.length);
    },

    // Filters and pagination
    setFilters: (state, action: PayloadAction<typeof initialState.filters>) => {
      state.filters = action.payload;
      state.currentPage = 1;
    },
    updateFilter: (
      state,
      action: PayloadAction<{
        key: keyof typeof initialState.filters;
        value: any;
      }>
    ) => {
      state.filters[action.payload.key] = action.payload.value;
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },
    setPagination: (
      state,
      action: PayloadAction<{
        currentPage: number;
        totalPages: number;
        totalCount: number;
        pageSize?: number;
      }>
    ) => {
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.totalCount = action.payload.totalCount;
      if (action.payload.pageSize) {
        state.pageSize = action.payload.pageSize;
      }
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    },

    // Settings
    setSettings: (state, action: PayloadAction<NotificationSettings>) => {
      state.settings = action.payload;
    },
    updateSettings: (
      state,
      action: PayloadAction<Partial<NotificationSettings>>
    ) => {
      state.settings = { ...state.settings, ...action.payload };
    },
    updateCategorySettings: (
      state,
      action: PayloadAction<Partial<NotificationSettings["categories"]>>
    ) => {
      state.settings.categories = {
        ...state.settings.categories,
        ...action.payload,
      };
    },
    updateQuietHours: (
      state,
      action: PayloadAction<Partial<NotificationSettings["quietHours"]>>
    ) => {
      state.settings.quietHours = {
        ...state.settings.quietHours,
        ...action.payload,
      };
    },

    // UI states
    setNotificationPanelOpen: (state, action: PayloadAction<boolean>) => {
      state.isNotificationPanelOpen = action.payload;
    },
    toggleNotificationPanel: (state) => {
      state.isNotificationPanelOpen = !state.isNotificationPanelOpen;
    },
    setSelectedNotifications: (state, action: PayloadAction<string[]>) => {
      state.selectedNotifications = action.payload;
    },
    toggleNotificationSelection: (state, action: PayloadAction<string>) => {
      const notificationId = action.payload;
      const index = state.selectedNotifications.indexOf(notificationId);
      if (index === -1) {
        state.selectedNotifications.push(notificationId);
      } else {
        state.selectedNotifications.splice(index, 1);
      }
    },
    selectAllNotifications: (state) => {
      state.selectedNotifications = state.notifications.map((n) => n.id);
    },
    clearSelection: (state) => {
      state.selectedNotifications = [];
    },
    setViewMode: (
      state,
      action: PayloadAction<"all" | "unread" | "archived">
    ) => {
      state.viewMode = action.payload;
      state.currentPage = 1;
    },
    setSortBy: (
      state,
      action: PayloadAction<"newest" | "oldest" | "priority">
    ) => {
      state.sortBy = action.payload;
    },

    // Real-time connection
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setLastUpdated: (state, action: PayloadAction<string>) => {
      state.lastUpdated = action.payload;
    },

    // Utility actions
    cleanupExpiredNotifications: (state) => {
      const now = new Date().toISOString();
      const validNotifications = state.notifications.filter(
        (n) => !n.expiresAt || n.expiresAt > now
      );

      const removedCount =
        state.notifications.length - validNotifications.length;
      const removedUnreadCount = state.notifications.filter(
        (n) => n.expiresAt && n.expiresAt <= now && !n.isRead
      ).length;

      state.notifications = validNotifications;
      state.totalCount = Math.max(0, state.totalCount - removedCount);
      state.unreadCount = Math.max(0, state.unreadCount - removedUnreadCount);
    },
  },
});

export const {
  setLoading,
  setLoadingSettings,
  setMarkingAsRead,
  setArchiving,
  setDeleting,
  setError,
  setSettingsError,
  setNotifications,
  addNotification,
  updateNotification,
  removeNotification,
  markAsRead,
  markAsUnread,
  markAllAsRead,
  archiveNotifications,
  unarchiveNotifications,
  deleteNotifications,
  setFilters,
  updateFilter,
  clearFilters,
  setPagination,
  setCurrentPage,
  setPageSize,
  setSettings,
  updateSettings,
  updateCategorySettings,
  updateQuietHours,
  setNotificationPanelOpen,
  toggleNotificationPanel,
  setSelectedNotifications,
  toggleNotificationSelection,
  selectAllNotifications,
  clearSelection,
  setViewMode,
  setSortBy,
  setConnected,
  setLastUpdated,
  cleanupExpiredNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
