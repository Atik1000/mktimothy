import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  timestamp: number;
}

interface UIState {
  // Global loading states
  isGlobalLoading: boolean;
  loadingMessage?: string;

  // Modal states
  modals: {
    loginModal: boolean;
    registerModal: boolean;
    listingModal: boolean;
    contactModal: boolean;
    whatsappModal: boolean;
  };

  // Notifications
  notifications: Notification[];

  // Sidebar and navigation
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;

  // Theme
  theme: "light" | "dark" | "system";

  // Search and filters
  searchQuery: string;
  activeFilters: Record<string, any>;

  // Page states
  currentPage: string;
  breadcrumbs: Array<{ label: string; href?: string }>;
}

const initialState: UIState = {
  isGlobalLoading: false,
  loadingMessage: undefined,
  modals: {
    loginModal: false,
    registerModal: false,
    listingModal: false,
    contactModal: false,
    whatsappModal: false,
  },
  notifications: [],
  sidebarOpen: false,
  mobileMenuOpen: false,
  theme: "system",
  searchQuery: "",
  activeFilters: {},
  currentPage: "",
  breadcrumbs: [],
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Loading states
    setGlobalLoading: (
      state,
      action: PayloadAction<{ loading: boolean; message?: string }>
    ) => {
      state.isGlobalLoading = action.payload.loading;
      state.loadingMessage = action.payload.message;
    },

    // Modal actions
    openModal: (state, action: PayloadAction<keyof UIState["modals"]>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<keyof UIState["modals"]>) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key as keyof UIState["modals"]] = false;
      });
    },

    // Notification actions
    addNotification: (
      state,
      action: PayloadAction<Omit<Notification, "id" | "timestamp">>
    ) => {
      const notification: Notification = {
        ...action.payload,
        id: Date.now().toString(),
        timestamp: Date.now(),
      };
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Navigation actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebar: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    setMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.mobileMenuOpen = action.payload;
    },

    // Theme actions
    setTheme: (state, action: PayloadAction<"light" | "dark" | "system">) => {
      state.theme = action.payload;
    },

    // Search and filter actions
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setActiveFilters: (state, action: PayloadAction<Record<string, any>>) => {
      state.activeFilters = action.payload;
    },
    updateFilter: (
      state,
      action: PayloadAction<{ key: string; value: any }>
    ) => {
      state.activeFilters[action.payload.key] = action.payload.value;
    },
    removeFilter: (state, action: PayloadAction<string>) => {
      delete state.activeFilters[action.payload];
    },
    clearFilters: (state) => {
      state.activeFilters = {};
    },

    // Page state actions
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
    setBreadcrumbs: (
      state,
      action: PayloadAction<Array<{ label: string; href?: string }>>
    ) => {
      state.breadcrumbs = action.payload;
    },
  },
});

export const {
  setGlobalLoading,
  openModal,
  closeModal,
  closeAllModals,
  addNotification,
  removeNotification,
  clearNotifications,
  toggleSidebar,
  setSidebar,
  toggleMobileMenu,
  setMobileMenu,
  setTheme,
  setSearchQuery,
  setActiveFilters,
  updateFilter,
  removeFilter,
  clearFilters,
  setCurrentPage,
  setBreadcrumbs,
} = uiSlice.actions;

export default uiSlice.reducer;
