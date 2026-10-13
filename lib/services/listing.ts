/**
 * Listing Service Functions
 * Handles all listing-related API interactions
 */

export interface ListingFilters {
  search?: string;
  categoryId?: string;
  status?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  userId?: string;
  city?: string;
  state?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  priceType?: string;
  businessType?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  moduleType?: string;
}

export interface ListingFormData {
  title: string;
  description: string;
  businessName?: string;
  businessType?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  price?: number;
  priceType?: string;
  currency?: string;
  categoryId: string;
  images?: string[];
  tags?: string[];
  status?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

// Fetch listings with filters and pagination
export const fetchListings = async (
  filters: ListingFilters = {},
  page: number = 1,
  limit: number = 12
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.search && { search: filters.search }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.isActive !== undefined && {
        isActive: filters.isActive.toString(),
      }),
      ...(filters.isFeatured !== undefined && {
        isFeatured: filters.isFeatured.toString(),
      }),
      ...(filters.userId && { userId: filters.userId }),
      ...(filters.city && { city: filters.city }),
      ...(filters.state && { state: filters.state }),
      ...(filters.country && { country: filters.country }),
      ...(filters.minPrice !== undefined && {
        minPrice: filters.minPrice.toString(),
      }),
      ...(filters.maxPrice !== undefined && {
        maxPrice: filters.maxPrice.toString(),
      }),
      ...(filters.priceType && { priceType: filters.priceType }),
      ...(filters.businessType && { businessType: filters.businessType }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      ...(filters.moduleType && { moduleType: filters.moduleType }),
    });

    console.log(
      "Listing Service - Fetching listings with params:",
      params.toString()
    );

    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");

    const response = await fetch(`/api/listings?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Listing Service - API response:", result);

    return result;
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
};

// Fetch user's listings
export const fetchUserListings = async (
  userId: string,
  filters: ListingFilters = {}
) => {
  return fetchListings({ ...filters, userId });
};

// Fetch single listing by ID
export const fetchListingById = async (listingId: string) => {
  try {
    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");

    const response = await fetch(`/api/listings/${listingId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching listing:", error);
    throw error;
  }
};

// Create new listing
export const createListing = async (listingData: ListingFormData) => {
  try {
    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");

    const response = await fetch("/api/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(listingData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating listing:", error);
    throw error;
  }
};

// Update existing listing
export const updateListing = async (
  listingId: string,
  listingData: Partial<ListingFormData>
) => {
  try {
    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");

    const response = await fetch(`/api/listings/${listingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(listingData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating listing:", error);
    throw error;
  }
};

// Delete listing
export const deleteListing = async (listingId: string) => {
  try {
    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");

    const response = await fetch(`/api/listings/${listingId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting listing:", error);
    throw error;
  }
};

// Like/Unlike listing
export const toggleListingLike = async (listingId: string) => {
  try {
    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");

    const response = await fetch(`/api/listings/${listingId}/like`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error toggling listing like:", error);
    throw error;
  }
};

// Save/Unsave listing
export const toggleListingSave = async (listingId: string) => {
  try {
    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");

    const response = await fetch(`/api/listings/${listingId}/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error toggling listing save:", error);
    throw error;
  }
};

// Fetch featured listings
export const fetchFeaturedListings = async (limit: number = 6) => {
  return fetchListings(
    { isFeatured: true, status: "ACTIVE", isActive: true },
    1,
    limit
  );
};

// Get listing statistics (for dashboard)
export const getListingStats = async (userId?: string) => {
  try {
    const filters: ListingFilters = {};
    if (userId) {
      filters.userId = userId;
    }

    const [activeResult, pendingResult, draftResult, featuredResult] =
      await Promise.all([
        fetchListings({ ...filters, status: "ACTIVE" }, 1, 1),
        fetchListings({ ...filters, status: "PENDING" }, 1, 1),
        fetchListings({ ...filters, status: "DRAFT" }, 1, 1),
        fetchListings({ ...filters, isFeatured: true }, 1, 1),
      ]);

    return {
      active: activeResult.data?.pagination?.totalCount || 0,
      pending: pendingResult.data?.pagination?.totalCount || 0,
      draft: draftResult.data?.pagination?.totalCount || 0,
      featured: featuredResult.data?.pagination?.totalCount || 0,
    };
  } catch (error) {
    console.error("Error fetching listing stats:", error);
    return { active: 0, pending: 0, draft: 0, featured: 0 };
  }
};
