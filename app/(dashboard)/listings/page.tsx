"use client";

import ListingsTable from "@/components/listings/ListingsTable";
import RequestsTable from "@/components/listings/RequestsTable";
import CreateListingModal from "@/components/profile/CreateListingModal";
import { SectionLoader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Search, Plus } from "lucide-react";

// Define the Listing interface
interface Listing {
  id: string;
  title: string;
  description: string;
  businessName?: string;
  businessType?: string;
  status: "DRAFT" | "PUBLISHED" | "INACTIVE" | "ARCHIVED";
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  publishedAt?: string;
  isFeatured: boolean;
  isActive: boolean;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  price?: number;
  priceType?: string;
  currency?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  _count: {
    likes: number;
    reviews: number;
    savedBy: number;
  };
}

const page = () => {
  const { user, handleApiResponse } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (
      user?.role === "MODERATOR" &&
      !user.subAdminPermissions?.includes("manage-listings")
    ) {
      toast.error("You do not have permission to access this page");
      router.push("/dashboard");
    }
  }, [user, router]);
  const [activeTab, setActiveTab] = useState("listings");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [listings, setListings] = useState<Listing[]>([]);
  const [pendingListings, setPendingListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 20,
    hasNext: false,
    hasPrev: false,
  });
  const [pendingPagination, setPendingPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 20,
    hasNext: false,
    hasPrev: false,
  });

  const [filters, setFilters] = useState({
    status: "",
    isActive: "",
    isFeatured: "",
    sectorId: "",
  });
  const [sectors, setSectors] = useState<{ id: string; name: string }[]>([]);

  // Fetch listings from API
  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filters.status && { status: filters.status }),
        ...(filters.isActive && { isActive: filters.isActive }),
        ...(filters.isFeatured && { isFeatured: filters.isFeatured }),
        ...(filters.sectorId && { sectorId: filters.sectorId }),
      });

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

      const isValidResponse = await handleApiResponse(response);
      if (!isValidResponse) return;

      const result = await response.json();
      if (result.success) {
        setListings(result.data.listings);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("Failed to fetch listings");
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending listings for requests tab
  const fetchPendingListings = async () => {
    setPendingLoading(true);
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      const response = await fetch("/api/admin/listings/requests", {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      const isValidResponse = await handleApiResponse(response);
      if (!isValidResponse) return;

      const result = await response.json();
      if (result.success) {
        setPendingListings(result.data.listings);
        setPendingPagination((prev) => ({
          ...prev,
          totalCount: result.data.totalCount,
        }));
      }
    } catch (error) {
      console.error("Error fetching pending listings:", error);
      toast.error("Failed to fetch pending listings");
    } finally {
      setPendingLoading(false);
    }
  };

  // Handle listing approval/rejection/edit
  const handleListingAction = async (
    action: "approve" | "reject" | "edit",
    listingId: string,
  ) => {
    if (action === "edit") {
      const listingToEdit = listings.find(l => l.id === listingId) || pendingListings.find(l => l.id === listingId);
      if (listingToEdit) {
        setEditingListing(listingToEdit);
        setIsModalOpen(true);
      }
      return;
    }

    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      const response = await fetch("/api/admin/listings/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ listingId, action }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log(`Listing ${action}d successfully`);
          // Refresh the pending listings list
          fetchPendingListings();
          // Also refresh regular listings list to show newly approved listings
          fetchListings();
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing listing:`, error);
    }
  };

  // Load both listings and pending listings on initial page load
  useEffect(() => {
    fetchListings();
    fetchPendingListings();

    // Fetch sectors for filtering
    fetch("/api/sectors")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSectors(data.data);
        }
      })
      .catch((err) => console.error("Error fetching sectors:", err));
  }, []); // Only run on mount

  // Fetch listings when pagination/search/filters changes (not when switching tabs)
  useEffect(() => {
    fetchListings();
  }, [pagination.currentPage, searchTerm, filters]);

  // Fetch pending listings when pagination/search changes (not when switching tabs)
  useEffect(() => {
    fetchPendingListings();
  }, [pendingPagination.currentPage, searchTerm, filters]);

  // Helper function to format location
  const getLocationString = (
    city?: string,
    state?: string,
    country?: string,
  ) => {
    return (
      [city, state, country].filter(Boolean).join(", ") ||
      "Location not specified"
    );
  };

  // Transform listings data for table component
  const transformedListings = listings.map((listing) => ({
    ...listing,
    id: listing.id,
    title: listing.title,
    location: getLocationString(listing.city, listing.state, listing.country),
    status: listing.status,
    type: listing.businessType || listing.category?.name || "Listing",
    businessName: listing.businessName,
    description: listing.description,
    author: `${listing.user.firstName} ${listing.user.lastName}`,
    category: listing.category.name,
    createdAt: listing.createdAt,
    publishedAt: listing.publishedAt,
    isFeatured: listing.isFeatured,
    isActive: listing.isActive,
    price: listing.price,
    priceType: listing.priceType,
    currency: listing.currency,
    stats: {
      likes: listing._count.likes,
      reviews: listing._count.reviews,
      saved: listing._count.savedBy,
    },
  }));

  // Transform pending listings data for requests table
  const transformedPendingListings = pendingListings.map((listing) => ({
    ...listing,
    id: listing.id,
    title: listing.title,
    description: listing.description,
    status: listing.status,
    type: listing.businessName || "Listing",
    author: `${listing.user.firstName} ${listing.user.lastName}`,
    category: listing.category.name,
    createdAt: listing.createdAt,
    publishedAt: listing.publishedAt,
    isFeatured: listing.isFeatured,
    isActive: listing.isActive,
    city: listing.city,
    state: listing.state,
    country: listing.country,
    stats: {
      likes: listing._count.likes,
      reviews: listing._count.reviews,
      saved: listing._count.savedBy,
    },
  }));

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSelectAll = () => {
    const filteredUsers =
      activeTab === "listings"
        ? transformedListings
        : transformedPendingListings;
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length
        ? []
        : filteredUsers.map((user) => user.id),
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Reset selected users when search changes
    setSelectedUsers([]);
    // Reset to first page when searching
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar bg-[#09090b] text-zinc-100 min-h-[calc(100vh-64px)] font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Mobile Title */}
        <h1 className="text-2xl font-bold text-white mb-6 sm:hidden">Listings Management</h1>

        <div className="flex items-center justify-between mb-6 hidden sm:flex">
          <h1 className="text-2xl font-bold text-white">Listings</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Listing</span>
          </button>
        </div>

        {/* Table Container Card */}
        <div className="bg-[#18181b] border border-white/5 rounded-2xl shadow-xl shadow-black/20 flex flex-col overflow-hidden">
          
          <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search listings..." 
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full sm:w-64 bg-[#09090b] border border-white/10 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-zinc-200 placeholder:text-zinc-500"
                />
              </div>
              <select
                value={filters.sectorId}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, sectorId: e.target.value }))
                }
                className="bg-[#09090b] border border-white/10 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-zinc-200 w-full sm:w-auto appearance-none"
              >
                <option value="">All Sectors</option>
                {sectors.map((sector) => (
                  <option key={sector.id} value={sector.id}>
                    {sector.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tabs */}
            <div className="flex items-center p-1 bg-[#09090b] border border-white/5 rounded-xl self-start sm:self-auto">
              <button 
                onClick={() => setActiveTab('listings')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'listings' 
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Listings ({pagination.totalCount})
              </button>
              <button 
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'requests' 
                    ? 'bg-zinc-800 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Requests ({pendingPagination.totalCount})
              </button>
            </div>

            {/* Mobile Add Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="sm:hidden flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl transition-colors font-medium text-sm mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Listing</span>
            </button>
          </div>

          {/* Selected Items Actions */}
          {selectedUsers.length > 0 && (
            <div className="px-5 py-3 bg-blue-500/10 border-b border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <span className="text-blue-400 text-sm font-medium">
                {selectedUsers.length} item{selectedUsers.length > 1 ? "s" : ""} selected
              </span>
              <button
                onClick={() => setSelectedUsers([])}
                className="text-zinc-400 hover:text-white text-sm transition-colors"
              >
                Clear Selection
              </button>
            </div>
          )}

          {/* Table Container */}
          <div className="overflow-x-auto custom-scrollbar min-h-[400px]">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <SectionLoader height="h-64" message="Loading listings..." />
              </div>
            ) : (
              <>
                {activeTab === "listings" ? (
                  <>
                    <ListingsTable
                      onAction={handleListingAction}
                      listings={transformedListings}
                      loading={loading}
                      pagination={pagination}
                      onPageChange={(page) =>
                        setPagination((prev) => ({ ...prev, currentPage: page }))
                      }
                      selectedUsers={selectedUsers}
                      onSelectUser={handleSelectUser}
                      onSelectAll={handleSelectAll}
                    />
                  </>
                ) : (
                  <>
                    <RequestsTable
                      listings={transformedPendingListings.map((listing) => ({
                        id: listing.id,
                        title: listing.title,
                        location: getLocationString(
                          listing.city,
                          listing.state,
                          listing.country,
                        ),
                        type: listing.type,
                        author: listing.author,
                        status: listing.status
                      }))}
                      selectedUsers={selectedUsers}
                      handleSelectAll={handleSelectAll}
                      handleSelectUser={handleSelectUser}
                      onAction={handleListingAction}
                    />
                  </>
                )}
                
                {/* No items message */}
                {((activeTab === "listings" && transformedListings.length === 0) ||
                  (activeTab === "requests" && transformedPendingListings.length === 0)) && (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-zinc-500 text-sm">
                      {searchTerm
                        ? `No ${activeTab === "listings" ? "listings" : "pending listing requests"} found matching your search.`
                        : activeTab === "listings"
                          ? "No listings available."
                          : "No pending listing requests."}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pagination */}
          {!loading && ((activeTab === "listings" && pagination.totalPages > 1) || (activeTab === "requests" && pendingPagination.totalPages > 1)) && (
            <div className="p-4 sm:p-5 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-zinc-500 text-sm">
                {activeTab === "listings" ? (
                  <>
                    Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}{" "}
                    of {pagination.totalCount} listings
                  </>
                ) : (
                  <>
                    Showing {(pendingPagination.currentPage - 1) * pendingPagination.pageSize + 1} to{" "}
                    {Math.min(pendingPagination.currentPage * pendingPagination.pageSize, pendingPagination.totalCount)}{" "}
                    of {pendingPagination.totalCount} requests
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    activeTab === "listings" 
                      ? setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))
                      : setPendingPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))
                  }
                  disabled={activeTab === "listings" ? !pagination.hasPrev : !pendingPagination.hasPrev}
                  className="px-4 py-2 bg-[#09090b] border border-white/10 rounded-lg text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
                >
                  Previous
                </button>

                <span className="text-zinc-400 px-3 py-2 text-sm font-medium">
                  Page {activeTab === "listings" ? pagination.currentPage : pendingPagination.currentPage} of {activeTab === "listings" ? pagination.totalPages : pendingPagination.totalPages}
                </span>

                <button
                  onClick={() =>
                    activeTab === "listings"
                      ? setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))
                      : setPendingPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))
                  }
                  disabled={activeTab === "listings" ? !pagination.hasNext : !pendingPagination.hasNext}
                  className="px-4 py-2 bg-[#09090b] border border-white/10 rounded-lg text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Add Listing Modal */}
      <CreateListingModal
        isOpen={isModalOpen}
        editingListing={editingListing}
        onClose={() => {
          setEditingListing(null);
          setIsModalOpen(false);
          fetchListings();
        }}
        onSuccess={() => {
          fetchListings();
        }}
        profileUser={user}
      />
    </div>
  );
};

export default page;

