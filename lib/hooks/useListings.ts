"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useCallback } from "react";
import { api } from "../api/client";
import { queryKeys } from "../react-query/queryClient";
import type { Listing, ListingFilters } from "../redux/slices/listingSlice";
import {
  addListing,
  clearFilters,
  incrementClicks,
  incrementViews,
  removeListing,
  setCurrentListing,
  setError,
  setFeaturedListings,
  setFilters,
  setListings,
  setPagination,
  setSearchQuery,
  setSearchResults,
  updateListing,
} from "../redux/slices/listingSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";

// API types
interface CreateListingData {
  title: string;
  description: string;
  businessName: string;
  businessType: string;
  categoryId: string;
  subcategoryId?: string;
  contact: {
    phone?: string;
    email?: string;
    website?: string;
    whatsapp?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  features: string[];
  tags: string[];
  priceRange?: string;
  currency?: string;
}

interface UpdateListingData extends Partial<CreateListingData> {
  id: string;
}

interface ListingsResponse {
  listings: Listing[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
  };
}

// Listings API
const listingsApi = {
  getListings: async (params: {
    page?: number;
    limit?: number;
    filters?: ListingFilters;
    search?: string;
  }): Promise<ListingsResponse> => {
    const response = await api.get<ListingsResponse>("/listings", {
      params,
    });
    return response.data;
  },

  getListing: async (id: string): Promise<Listing> => {
    const response = await api.get<Listing>(`/listings/${id}`);
    return response.data;
  },

  createListing: async (data: CreateListingData): Promise<Listing> => {
    const response = await api.post<Listing>("/listings", data);
    return response.data;
  },

  updateListing: async (data: UpdateListingData): Promise<Listing> => {
    const { id, ...updateData } = data;
    const response = await api.patch<Listing>(`/listings/${id}`, updateData);
    return response.data;
  },

  deleteListing: async (id: string): Promise<void> => {
    await api.delete(`/listings/${id}`);
  },

  getUserListings: async (userId: string): Promise<Listing[]> => {
    const response = await api.get<Listing[]>(`/listings/user/${userId}`);
    return response.data;
  },

  getFeaturedListings: async (): Promise<Listing[]> => {
    const response = await api.get<Listing[]>("/listings/featured");
    return response.data;
  },

  searchListings: async (query: string): Promise<Listing[]> => {
    const response = await api.get<Listing[]>("/listings/search", {
      params: { q: query },
    });
    return response.data;
  },

  incrementViews: async (id: string): Promise<void> => {
    await api.post(`/listings/${id}/view`);
  },

  incrementClicks: async (id: string): Promise<void> => {
    await api.post(`/listings/${id}/click`);
  },
};

export const useListings = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  // Get state from Redux
  const listingState = useAppSelector((state) => state.listing);
  const {
    listings,
    currentListing,
    userListings,
    featuredListings,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    filters,
    searchQuery,
    searchResults,
    isLoading,
    error,
    viewMode,
    selectedListings,
  } = listingState;

  // Get listings query
  const {
    data: listingsData,
    isLoading: isLoadingListings,
    error: listingsError,
    refetch: refetchListings,
  } = useQuery({
    queryKey: queryKeys.listings.list({
      page: currentPage,
      filters,
      searchQuery,
    }),
    queryFn: () =>
      listingsApi.getListings({
        page: currentPage,
        limit: pageSize,
        filters,
        search: searchQuery,
      }),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Get featured listings
  const { data: featuredData } = useQuery({
    queryKey: queryKeys.listings.featured(),
    queryFn: listingsApi.getFeaturedListings,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get current listing details
  const { data: currentListingData, isLoading: isLoadingCurrentListing } =
    useQuery({
      queryKey: queryKeys.listings.detail(currentListing?.id || ""),
      queryFn: () => listingsApi.getListing(currentListing?.id || ""),
      enabled: !!currentListing?.id,
    });

  // Create listing mutation
  const createListingMutation = useMutation({
    mutationFn: listingsApi.createListing,
    onSuccess: (newListing) => {
      dispatch(addListing(newListing));
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
    },
    onError: (error: any) => {
      dispatch(setError(error.message || "Failed to create listing"));
    },
  });

  // Update listing mutation
  const updateListingMutation = useMutation({
    mutationFn: listingsApi.updateListing,
    onSuccess: (updatedListing) => {
      dispatch(updateListing(updatedListing));
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
    },
    onError: (error: any) => {
      dispatch(setError(error.message || "Failed to update listing"));
    },
  });

  // Delete listing mutation
  const deleteListingMutation = useMutation({
    mutationFn: listingsApi.deleteListing,
    onSuccess: (_, deletedId) => {
      dispatch(removeListing(deletedId));
      queryClient.invalidateQueries({ queryKey: queryKeys.listings.all });
    },
    onError: (error: any) => {
      dispatch(setError(error.message || "Failed to delete listing"));
    },
  });

  // Search mutation
  const searchMutation = useMutation({
    mutationFn: listingsApi.searchListings,
    onSuccess: (results) => {
      dispatch(setSearchResults(results));
    },
    onError: (error: any) => {
      dispatch(setError(error.message || "Search failed"));
    },
  });

  // Update Redux state when query data changes
  React.useEffect(() => {
    if (listingsData) {
      dispatch(setListings(listingsData.listings));
      dispatch(setPagination(listingsData.pagination));
    }
  }, [listingsData, dispatch]);

  React.useEffect(() => {
    if (featuredData) {
      dispatch(setFeaturedListings(featuredData));
    }
  }, [featuredData, dispatch]);

  React.useEffect(() => {
    if (currentListingData) {
      dispatch(setCurrentListing(currentListingData));
    }
  }, [currentListingData, dispatch]);

  // Helper functions
  const createListing = useCallback(
    (data: CreateListingData) => {
      return createListingMutation.mutateAsync(data);
    },
    [createListingMutation]
  );

  const updateListingById = useCallback(
    (data: UpdateListingData) => {
      return updateListingMutation.mutateAsync(data);
    },
    [updateListingMutation]
  );

  const deleteListing = useCallback(
    (id: string) => {
      return deleteListingMutation.mutateAsync(id);
    },
    [deleteListingMutation]
  );

  const searchListings = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
      if (query.trim()) {
        return searchMutation.mutateAsync(query);
      } else {
        dispatch(setSearchResults([]));
        return Promise.resolve([]);
      }
    },
    [dispatch, searchMutation]
  );

  const applyFilters = useCallback(
    (newFilters: ListingFilters) => {
      dispatch(setFilters(newFilters));
      refetchListings();
    },
    [dispatch, refetchListings]
  );

  const clearAllFilters = useCallback(() => {
    dispatch(clearFilters());
    dispatch(setSearchQuery(""));
    refetchListings();
  }, [dispatch, refetchListings]);

  const viewListing = useCallback(
    async (id: string) => {
      try {
        await listingsApi.incrementViews(id);
        dispatch(incrementViews(id));
      } catch (error) {
        console.error("Failed to increment views:", error);
      }
    },
    [dispatch]
  );

  const clickListing = useCallback(
    async (id: string) => {
      try {
        await listingsApi.incrementClicks(id);
        dispatch(incrementClicks(id));
      } catch (error) {
        console.error("Failed to increment clicks:", error);
      }
    },
    [dispatch]
  );

  const selectListing = useCallback(
    (listing: Listing) => {
      dispatch(setCurrentListing(listing));
    },
    [dispatch]
  );

  return {
    // State
    listings,
    currentListing,
    userListings,
    featuredListings,
    searchResults,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    filters,
    searchQuery,
    viewMode,
    selectedListings,
    isLoading: isLoading || isLoadingListings,
    isLoadingCurrentListing,
    error: error || (listingsError as any)?.message,

    // Actions
    createListing,
    updateListing: updateListingById,
    deleteListing,
    searchListings,
    applyFilters,
    clearAllFilters,
    viewListing,
    clickListing,
    selectListing,
    refetchListings,

    // Mutation states
    isCreating: createListingMutation.isPending,
    isUpdating: updateListingMutation.isPending,
    isDeleting: deleteListingMutation.isPending,
    isSearching: searchMutation.isPending,

    // Mutation errors
    createError: createListingMutation.error as any,
    updateError: updateListingMutation.error as any,
    deleteError: deleteListingMutation.error as any,
    searchError: searchMutation.error as any,
  };
};
