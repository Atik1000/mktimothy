import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ListingMedia {
  id: string;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  url: string;
  alt?: string;
  caption?: string;
  order: number;
}

export interface ListingContact {
  phone?: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  slug: string;
  categoryId: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  userId: string;
  userName?: string;

  // Business details
  businessName: string;
  businessType: string;
  establishedYear?: number;
  employeeCount?: string;

  // Contact information
  contact: ListingContact;

  // Media
  media: ListingMedia[];
  logo?: string;
  coverImage?: string;

  // Pricing and features
  priceRange?: string;
  currency?: string;
  features: string[];
  tags: string[];

  // Status and visibility
  status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  isActive: boolean;
  isFeatured: boolean;
  isPremium: boolean;

  // SEO
  metaTitle?: string;
  metaDescription?: string;
  keywords: string[];

  // Analytics
  views: number;
  clicks: number;
  rating: number;
  reviewCount: number;

  // Timestamps
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  expiresAt?: string;
}

export interface ListingFilters {
  category?: string;
  subcategory?: string;
  location?: string;
  priceRange?: string;
  rating?: number;
  features?: string[];
  tags?: string[];
  businessType?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  isPremium?: boolean;
  sortBy?: "newest" | "oldest" | "rating" | "views" | "alphabetical";
  sortOrder?: "asc" | "desc";
}

interface ListingState {
  // Listings data
  listings: Listing[];
  currentListing: Listing | null;
  userListings: Listing[];
  featuredListings: Listing[];

  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;

  // Filters and search
  filters: ListingFilters;
  searchQuery: string;
  searchResults: Listing[];

  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isSearching: boolean;

  // Error states
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  searchError: string | null;

  // UI states
  viewMode: "grid" | "list";
  selectedListings: string[];
}

const initialState: ListingState = {
  listings: [],
  currentListing: null,
  userListings: [],
  featuredListings: [],
  currentPage: 1,
  totalPages: 0,
  totalCount: 0,
  pageSize: 12,
  filters: {},
  searchQuery: "",
  searchResults: [],
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isSearching: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  searchError: null,
  viewMode: "grid",
  selectedListings: [],
};

const listingSlice = createSlice({
  name: "listing",
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setCreating: (state, action: PayloadAction<boolean>) => {
      state.isCreating = action.payload;
    },
    setUpdating: (state, action: PayloadAction<boolean>) => {
      state.isUpdating = action.payload;
    },
    setDeleting: (state, action: PayloadAction<boolean>) => {
      state.isDeleting = action.payload;
    },
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.isSearching = action.payload;
    },

    // Error states
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCreateError: (state, action: PayloadAction<string | null>) => {
      state.createError = action.payload;
    },
    setUpdateError: (state, action: PayloadAction<string | null>) => {
      state.updateError = action.payload;
    },
    setDeleteError: (state, action: PayloadAction<string | null>) => {
      state.deleteError = action.payload;
    },
    setSearchError: (state, action: PayloadAction<string | null>) => {
      state.searchError = action.payload;
    },

    // Listings data
    setListings: (state, action: PayloadAction<Listing[]>) => {
      state.listings = action.payload;
    },
    addListing: (state, action: PayloadAction<Listing>) => {
      state.listings.unshift(action.payload);
      state.totalCount += 1;
    },
    updateListing: (state, action: PayloadAction<Listing>) => {
      const index = state.listings.findIndex((l) => l.id === action.payload.id);
      if (index !== -1) {
        state.listings[index] = action.payload;
      }
      if (state.currentListing?.id === action.payload.id) {
        state.currentListing = action.payload;
      }
    },
    removeListing: (state, action: PayloadAction<string>) => {
      state.listings = state.listings.filter((l) => l.id !== action.payload);
      state.totalCount = Math.max(0, state.totalCount - 1);
      if (state.currentListing?.id === action.payload) {
        state.currentListing = null;
      }
    },
    setCurrentListing: (state, action: PayloadAction<Listing | null>) => {
      state.currentListing = action.payload;
    },

    // User listings
    setUserListings: (state, action: PayloadAction<Listing[]>) => {
      state.userListings = action.payload;
    },

    // Featured listings
    setFeaturedListings: (state, action: PayloadAction<Listing[]>) => {
      state.featuredListings = action.payload;
    },

    // Pagination
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
      state.currentPage = 1; // Reset to first page when changing page size
    },

    // Filters and search
    setFilters: (state, action: PayloadAction<ListingFilters>) => {
      state.filters = action.payload;
      state.currentPage = 1; // Reset to first page when filters change
    },
    updateFilter: (
      state,
      action: PayloadAction<{ key: keyof ListingFilters; value: any }>
    ) => {
      state.filters[action.payload.key] = action.payload.value;
      state.currentPage = 1;
    },
    removeFilter: (state, action: PayloadAction<keyof ListingFilters>) => {
      delete state.filters[action.payload];
      state.currentPage = 1;
    },
    clearFilters: (state) => {
      state.filters = {};
      state.currentPage = 1;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setSearchResults: (state, action: PayloadAction<Listing[]>) => {
      state.searchResults = action.payload;
    },

    // UI states
    setViewMode: (state, action: PayloadAction<"grid" | "list">) => {
      state.viewMode = action.payload;
    },
    setSelectedListings: (state, action: PayloadAction<string[]>) => {
      state.selectedListings = action.payload;
    },
    toggleListingSelection: (state, action: PayloadAction<string>) => {
      const listingId = action.payload;
      const index = state.selectedListings.indexOf(listingId);
      if (index === -1) {
        state.selectedListings.push(listingId);
      } else {
        state.selectedListings.splice(index, 1);
      }
    },
    clearSelection: (state) => {
      state.selectedListings = [];
    },

    // Analytics
    incrementViews: (state, action: PayloadAction<string>) => {
      const listing = state.listings.find((l) => l.id === action.payload);
      if (listing) {
        listing.views += 1;
      }
      if (state.currentListing?.id === action.payload) {
        state.currentListing.views += 1;
      }
    },
    incrementClicks: (state, action: PayloadAction<string>) => {
      const listing = state.listings.find((l) => l.id === action.payload);
      if (listing) {
        listing.clicks += 1;
      }
      if (state.currentListing?.id === action.payload) {
        state.currentListing.clicks += 1;
      }
    },
  },
});

export const {
  setLoading,
  setCreating,
  setUpdating,
  setDeleting,
  setSearching,
  setError,
  setCreateError,
  setUpdateError,
  setDeleteError,
  setSearchError,
  setListings,
  addListing,
  updateListing,
  removeListing,
  setCurrentListing,
  setUserListings,
  setFeaturedListings,
  setPagination,
  setCurrentPage,
  setPageSize,
  setFilters,
  updateFilter,
  removeFilter,
  clearFilters,
  setSearchQuery,
  setSearchResults,
  setViewMode,
  setSelectedListings,
  toggleListingSelection,
  clearSelection,
  incrementViews,
  incrementClicks,
} = listingSlice.actions;

export default listingSlice.reducer;
