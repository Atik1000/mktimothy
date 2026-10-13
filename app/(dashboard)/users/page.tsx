"use client";

import RequestsTable from "@/components/users/RequestsTable";
import UsersTable from "@/components/users/UsersTable";
import { useAuth } from "@/lib/providers/auth-provider";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "USER" | "ADMIN" | "MODERATOR" | "INVESTOR";
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  lastLoginAt?: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const UsersPage = () => {
  const { user: currentUser, handleApiResponse } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (
      currentUser?.role === "MODERATOR" &&
      !currentUser.subAdminPermissions?.includes("manage-users")
    ) {
      toast.error("You do not have permission to access this page");
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  const [activeTab, setActiveTab] = useState("users");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    role: "",
    isActive: "",
    emailVerified: "",
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: string | null;
    userId: string | null;
    isRequest: boolean;
    title: string;
    description: string;
  }>({
    isOpen: false,
    action: null,
    userId: null,
    isRequest: false,
    title: "",
    description: "",
  });

  const handleConfirmAction = async () => {
    if (!confirmModal.action || !confirmModal.userId) return;
    const { action, userId, isRequest } = confirmModal;
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    
    if (isRequest) {
      await handleRequestAction(action, userId, true);
    } else {
      await handleUserAction(action, userId, undefined, true);
    }
  };

  // Fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.role && { role: filters.role }),
        ...(filters.isActive && { isActive: filters.isActive }),
        ...(filters.emailVerified && { emailVerified: filters.emailVerified }),
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/users?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const isValidResponse = await handleApiResponse(response);
      if (!isValidResponse) return;

      const result = await response.json();

      if (result.success) {
        setUsers(result.data.users);
        setPagination({
          page: result.data.page,
          limit: result.data.limit,
          total: result.data.total,
          totalPages: result.data.totalPages,
        });
      } else {
        toast.error(result.error || "Failed to fetch users");
      }
    } catch (error) {
      console.error("Fetch users error:", error);
      toast.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user requests
  const fetchRequests = async () => {
    try {
      setRequestsLoading(true);
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const params = new URLSearchParams({
        page: "1",
        limit: "100",
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/admin/users/requests?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const isValidResponse = await handleApiResponse(response);
      if (!isValidResponse) return;

      const result = await response.json();

      if (result.success) {
        setRequests(result.data.users);
      } else {
        toast.error(result.error || "Failed to fetch user requests");
      }
    } catch (error) {
      console.error("Fetch requests error:", error);
      toast.error("Failed to fetch user requests");
    } finally {
      setRequestsLoading(false);
    }
  };

  // Load users on component mount and when filters change
  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchRequests();
    }
  }, [currentUser, pagination.page, filters, searchTerm]);

  // Handle user actions
  const handleUserAction = async (
    action: string,
    userId: string,
    data?: any,
    isConfirmed = false
  ) => {
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      if (!token) {
        toast.error("Authentication required");
        return;
      }

      let response: Response;
      let successMessage = "";

      switch (action) {
        case "view":
          // Navigate to user detail page or show modal
          console.log("View user:", userId);
          return;

        case "change_role":
          const requestBody: any = {
            action: "change_role",
            role: data.role,
          };

          // Include department if provided (for MODERATOR role)
          if (data.department) {
            requestBody.department = data.department;
          }

          response = await fetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(requestBody),
          });
          successMessage = `User role changed to ${data.role}${
            data.department ? ` - ${data.department}` : ""
          }`;
          break;

        case "suspend":
          response = await fetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              action: "suspend",
            }),
          });
          successMessage = "User suspended successfully";
          break;

        case "activate":
          response = await fetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              action: "activate",
            }),
          });
          successMessage = "User activated successfully";
          break;

        case "delete":
          if (!isConfirmed) {
            setConfirmModal({
              isOpen: true,
              action,
              userId,
              isRequest: false,
              title: "Delete User",
              description: "Are you sure you want to delete this user? This action cannot be undone."
            });
            return;
          }

          response = await fetch(`/api/admin/users/${userId}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          successMessage = "User deleted successfully";
          break;

        case "block":
          if (!isConfirmed) {
            setConfirmModal({
              isOpen: true,
              action,
              userId,
              isRequest: false,
              title: "Block User",
              description: "Are you sure you want to block this user?"
            });
            return;
          }
          response = await fetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ action: "block" }),
          });
          successMessage = "User blocked successfully";
          break;

        case "assign_permissions":
          response = await fetch(`/api/admin/users/${userId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              action: "assign_permissions",
              permissions: data.permissions,
            }),
          });
          successMessage = "Permissions assigned successfully";
          break;

        default:
          toast.error("Invalid action");
          return;
      }

      const isValidResponse = await handleApiResponse(response!);
      if (!isValidResponse) return;

      const result = await response!.json();

      if (result.success) {
        toast.success(successMessage);
        fetchUsers(); // Refresh the users list
      } else {
        toast.error(result.error || "Action failed");
      }
    } catch (error) {
      console.error("User action error:", error);
      toast.error("Action failed");
    }
  };

  // Handle request actions (approve/reject)
  const handleRequestAction = async (action: string, userId: string, isConfirmed = false) => {
    try {
      console.log("Request action:", { action, userId }); // Debug log

      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      if (!token) {
        toast.error("Authentication required");
        return;
      }

      if (!["approve", "reject", "suspend", "block", "delete"].includes(action)) {
        toast.error("Invalid action");
        return;
      }

      if (action === "delete") {
        if (!isConfirmed) {
          setConfirmModal({
            isOpen: true,
            action,
            userId,
            isRequest: true,
            title: "Delete Request",
            description: "Are you sure you want to delete this request? This action cannot be undone."
          });
          return;
        }
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const isValidResponse = await handleApiResponse(response);
        if (!isValidResponse) return;

        const result = await response.json();
        if (result.success) {
          toast.success("User deleted successfully");
          fetchRequests();
        } else {
          toast.error(result.error || "Action failed");
        }
        return;
      }

      const response = await fetch("/api/admin/users/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          action,
        }),
      });

      console.log("Response status:", response.status); // Debug log

      const isValidResponse = await handleApiResponse(response);
      if (!isValidResponse) return;

      const result = await response.json();
      console.log("API Result:", result); // Debug log

      if (result.success) {
        toast.success(result.message);
        fetchRequests(); // Refresh requests list
        fetchUsers(); // Refresh users list in case user was approved
      } else {
        console.error("API Error:", result.error); // Debug log
        toast.error(result.error || "Action failed");
      }
    } catch (error) {
      console.error("Request action error:", error);
      toast.error("Action failed");
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === users.length ? [] : users.map((user) => user.id)
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setSelectedUsers([]);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    setFilters((prev) => ({ ...prev, [filterKey]: value }));
    setSelectedUsers([]);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      role: "",
      isActive: "",
      emailVerified: "",
    });
    setSearchTerm("");
    setSelectedUsers([]);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar bg-[#09090b] text-zinc-100 min-h-[calc(100vh-64px)] font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Mobile Title */}
        <h1 className="text-2xl font-bold text-white mb-6 sm:hidden">Users Management</h1>

        {/* Table Container Card */}
        <div className="bg-[#18181b] border border-white/5 rounded-2xl shadow-xl shadow-black/20 flex flex-col overflow-hidden">
          
          <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search & Filters — always visible, all-listings style */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 lg:flex-1">
              <div className="relative flex-1 sm:min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full bg-[#09090b] border border-white/10 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-zinc-200 placeholder:text-zinc-500"
                />
              </div>

              <select
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
                className={`w-full sm:w-auto bg-[#09090b] border text-sm rounded-xl px-3.5 py-2.5 cursor-pointer focus:outline-none focus:ring-1 transition-all ${
                  filters.role
                    ? "border-emerald-500/40 text-emerald-300 focus:ring-emerald-500/50"
                    : "border-white/10 text-zinc-200 focus:border-emerald-500/50 focus:ring-emerald-500/50"
                }`}
              >
                <option value="">All Roles</option>
                <option value="USER">Seller</option>
                <option value="INVESTOR">Investor</option>
                <option value="MODERATOR">Moderator</option>
                <option value="ADMIN">Admin</option>
              </select>

              <select
                value={filters.isActive}
                onChange={(e) =>
                  handleFilterChange("isActive", e.target.value)
                }
                className={`w-full sm:w-auto bg-[#09090b] border text-sm rounded-xl px-3.5 py-2.5 cursor-pointer focus:outline-none focus:ring-1 transition-all ${
                  filters.isActive
                    ? "border-emerald-500/40 text-emerald-300 focus:ring-emerald-500/50"
                    : "border-white/10 text-zinc-200 focus:border-emerald-500/50 focus:ring-emerald-500/50"
                }`}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Suspended</option>
              </select>

              <select
                value={filters.emailVerified}
                onChange={(e) =>
                  handleFilterChange("emailVerified", e.target.value)
                }
                className={`w-full sm:w-auto bg-[#09090b] border text-sm rounded-xl px-3.5 py-2.5 cursor-pointer focus:outline-none focus:ring-1 transition-all ${
                  filters.emailVerified
                    ? "border-emerald-500/40 text-emerald-300 focus:ring-emerald-500/50"
                    : "border-white/10 text-zinc-200 focus:border-emerald-500/50 focus:ring-emerald-500/50"
                }`}
              >
                <option value="">All Emails</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>

              {/* Clear Filters */}
              {(filters.role ||
                filters.isActive ||
                filters.emailVerified ||
                searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="text-rose-400 hover:text-rose-300 text-sm whitespace-nowrap"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center p-1 bg-[#09090b] border border-white/5 rounded-xl self-start sm:self-auto">
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'users' 
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Users ({pagination.total})
              </button>
              <button 
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'requests' 
                    ? 'bg-zinc-800 text-white shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Requests ({requests.length})
              </button>
            </div>

          </div>

          {/* Selected Users Actions */}
          {selectedUsers.length > 0 && (
            <div className="px-5 py-3 bg-blue-500/10 border-b border-blue-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <span className="text-blue-400 text-sm font-medium">
                {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
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
          <div className="overflow-x-auto custom-scrollbar">
            {activeTab === "users" ? (
              <UsersTable
                users={users}
                selectedUsers={selectedUsers}
                onSelectAll={handleSelectAll}
                onSelectUser={handleSelectUser}
                onUserAction={handleUserAction}
                isLoading={isLoading}
              />
            ) : (
              <RequestsTable
                users={requests}
                selectedUsers={selectedUsers}
                onSelectAll={handleSelectAll}
                onSelectUser={handleSelectUser}
                onRequestAction={handleRequestAction}
                isLoading={requestsLoading}
              />
            )}
          </div>

          {/* Pagination */}
          {!isLoading && users.length > 0 && pagination.totalPages > 1 && (
            <div className="p-4 sm:p-5 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-zinc-500 text-sm">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} users
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page <= 1}
                  className="px-4 py-2 bg-[#09090b] border border-white/10 rounded-lg text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
                >
                  Previous
                </button>

                <span className="text-zinc-400 px-3 py-2 text-sm font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-4 py-2 bg-[#09090b] border border-white/10 rounded-lg text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-white font-bold text-xl mb-2">{confirmModal.title}</h3>
            <p className="text-zinc-400 text-sm mb-6">{confirmModal.description}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 bg-[#09090b] hover:bg-white/5 text-zinc-300 px-4 py-2.5 rounded-xl transition-colors text-sm font-medium border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2.5 rounded-xl transition-colors text-sm font-medium"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
