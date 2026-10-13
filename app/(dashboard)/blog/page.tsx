"use client";

import BlogsTable from "@/components/blogsdashboard/BlogsTable";
import RequestsTable from "@/components/blogsdashboard/RequestsTable";
import CreateBlogModal from "@/components/profile/CreateBlogModal";
import { SectionLoader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Search, Plus } from "lucide-react";

// Define the Blog interface
interface Blog {
  id: string;
  title: string;
  excerpt?: string;
  status: string;
  createdAt: string;
  publishedAt?: string;
  isFeatured: boolean;
  isActive: boolean;
  author: {
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
    comments: number;
    savedBy: number;
  };
}

const page = () => {
  const [activeTab, setActiveTab] = useState("blogs");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [pendingBlogs, setPendingBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
    hasNext: false,
    hasPrev: false,
  });
  const [pendingPagination, setPendingPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 10,
    hasNext: false,
    hasPrev: false,
  });

  const { user: currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (
      currentUser?.role === "MODERATOR" &&
      !currentUser.subAdminPermissions?.includes("manage-blogs")
    ) {
      toast.error("You do not have permission to access this page");
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  // Fetch blogs from API
  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.pageSize.toString(),
        sortBy: "createdAt",
        sortOrder: "desc",
        ...(searchTerm && { search: searchTerm }),
      });

      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      const response = await fetch(`/api/blogs?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setBlogs(result.data.blogs);
          setPagination(result.data.pagination);
        }
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setBlogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending blogs from admin API
  const fetchPendingBlogs = async () => {
    setIsLoading(true);
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      const response = await fetch(`/api/admin/blogs/requests`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Pending blogs API response:", result); // Debug log
        if (result.success) {
          const blogs = result.data.blogs || [];
          setPendingBlogs(blogs);
          setPendingPagination({
            currentPage: 1,
            totalPages: 1,
            totalCount: result.data.totalCount || blogs.length,
            pageSize: 1000,
            hasNext: false,
            hasPrev: false,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching pending blogs:", error);
      setPendingBlogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle blog approval/rejection/edit
  const handleBlogAction = async (
    action: "approve" | "reject" | "edit",
    blogId: string,
  ) => {
    if (action === "edit") {
      const blogToEdit = blogs.find(b => b.id === blogId) || pendingBlogs.find(b => b.id === blogId);
      if (blogToEdit) {
        // Need to ensure tags array is mapped correctly for CreateBlogModal which expects simple array of strings if it maps it itself or array of {tag: {name: string}} if coming from API
        // Wait, the API returns tags as {tag: {name: string}}?. CreateBlogModal expects it to handle editingBlog.tags. Let's just pass the blog object.
        setEditingBlog(blogToEdit);
        setIsModalOpen(true);
      }
      return;
    }

    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      const response = await fetch("/api/admin/blogs/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ blogId, action }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.success) {
          console.log(`Blog ${action}d successfully`);
          // Refresh the pending blogs list
          fetchPendingBlogs();
          // Also refresh regular blogs list to show newly approved blogs
          fetchBlogs();
        }
      } else {
        // Handle error responses
        console.error(`Error ${action}ing blog:`, result.error);
        if (result.error === "Blog request has already been processed") {
          console.log("Blog was already processed, refreshing lists...");
          // Refresh both lists to show current state
          fetchPendingBlogs();
          fetchBlogs();
        }
        // You could add a toast notification here to show the error to the user
      }
    } catch (error) {
      console.error(`Error ${action}ing blog:`, error);
    }
  };

  // Load both blogs and pending blogs on initial page load
  useEffect(() => {
    fetchBlogs();
    fetchPendingBlogs();
  }, []); // Only run on mount

  // Fetch blogs when pagination/search changes (not when switching tabs)
  useEffect(() => {
    fetchBlogs();
  }, [pagination.currentPage, searchTerm]);

  // Fetch pending blogs when pagination/search changes (not when switching tabs)
  useEffect(() => {
    fetchPendingBlogs();
  }, [pendingPagination.currentPage, searchTerm]);

  // Transform blogs data for table component
  const transformedBlogs = blogs.map((blog) => ({
    ...blog,
    id: blog.id,
    title: blog.title,
    description: blog.excerpt || "No description available",
    status: blog.status,
    type: "Blog",
    author: `${blog.author.firstName} ${blog.author.lastName}`,
    category: blog.category.name,
    createdAt: blog.createdAt,
    publishedAt: blog.publishedAt,
    isFeatured: blog.isFeatured,
    isActive: blog.isActive,
    stats: {
      likes: blog._count.likes,
      comments: blog._count.comments,
      saved: blog._count.savedBy,
    },
  }));

  // Transform pending blogs data for requests table
  const transformedPendingBlogs = pendingBlogs.map((blog) => ({
    ...blog,
    id: blog.id,
    title: blog.title,
    description: blog.excerpt || "No description available",
    status: "Pending Approval",
    type: "Blog",
    author: `${blog.author.firstName} ${blog.author.lastName}`,
    category: blog.category.name,
    createdAt: blog.createdAt,
    publishedAt: blog.publishedAt,
    isFeatured: blog.isFeatured,
    isActive: blog.isActive,
    stats: {
      likes: blog._count.likes,
      comments: blog._count.comments,
      saved: blog._count.savedBy,
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
      activeTab === "blogs" ? transformedBlogs : transformedPendingBlogs;
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
    setPendingPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar bg-[#09090b] text-zinc-100 min-h-[calc(100vh-64px)] font-sans">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Mobile Title */}
        <h1 className="text-2xl font-bold text-white mb-6 sm:hidden">Blogs Management</h1>

        <div className="flex items-center justify-between mb-6 hidden sm:flex">
          <h1 className="text-2xl font-bold text-white">Blogs</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Blog</span>
          </button>
        </div>

        {/* Table Container Card */}
        <div className="bg-[#18181b] border border-white/5 rounded-2xl shadow-xl shadow-black/20 flex flex-col overflow-hidden">
          
          <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search blogs..." 
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full sm:w-64 bg-[#09090b] border border-white/10 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-zinc-200 placeholder:text-zinc-500"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center p-1 bg-[#09090b] border border-white/5 rounded-xl self-start sm:self-auto">
              <button 
                onClick={() => setActiveTab('blogs')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'blogs' 
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Blogs ({pagination.totalCount})
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
              <span>Add Blog</span>
            </button>
          </div>

          {/* Selected Items Actions (if any) */}
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
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <SectionLoader height="h-64" message="Loading blogs..." />
              </div>
            ) : (
              <>
                {activeTab === "blogs" ? (
                  <>
                    <BlogsTable
                      onAction={handleBlogAction}
                      mockUsers={transformedBlogs}
                      selectedUsers={selectedUsers}
                      handleSelectAll={handleSelectAll}
                      handleSelectUser={handleSelectUser}
                    />
                  </>
                ) : (
                  <>
                    <RequestsTable
                      mockUsers={transformedPendingBlogs}
                      selectedUsers={selectedUsers}
                      handleSelectAll={handleSelectAll}
                      handleSelectUser={handleSelectUser}
                      onAction={handleBlogAction}
                    />
                  </>
                )}
                
                {/* No items message */}
                {((activeTab === "blogs" && transformedBlogs.length === 0) ||
                  (activeTab === "requests" && transformedPendingBlogs.length === 0)) && (
                  <div className="flex items-center justify-center h-48">
                    <div className="text-zinc-500 text-sm">
                      {searchTerm
                        ? `No ${activeTab === "blogs" ? "blogs" : "pending blog requests"} found matching your search.`
                        : activeTab === "blogs"
                          ? "No blogs available."
                          : "No pending blog requests."}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && ((activeTab === "blogs" && pagination.totalPages > 1) || (activeTab === "requests" && pendingPagination.totalPages > 1)) && (
            <div className="p-4 sm:p-5 border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-zinc-500 text-sm">
                {activeTab === "blogs" ? (
                  <>
                    Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{" "}
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}{" "}
                    of {pagination.totalCount} blogs
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
                    activeTab === "blogs" 
                      ? setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))
                      : setPendingPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))
                  }
                  disabled={activeTab === "blogs" ? !pagination.hasPrev : !pendingPagination.hasPrev}
                  className="px-4 py-2 bg-[#09090b] border border-white/10 rounded-lg text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
                >
                  Previous
                </button>

                <span className="text-zinc-400 px-3 py-2 text-sm font-medium">
                  Page {activeTab === "blogs" ? pagination.currentPage : pendingPagination.currentPage} of {activeTab === "blogs" ? pagination.totalPages : pendingPagination.totalPages}
                </span>

                <button
                  onClick={() =>
                    activeTab === "blogs"
                      ? setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))
                      : setPendingPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))
                  }
                  disabled={activeTab === "blogs" ? !pagination.hasNext : !pendingPagination.hasNext}
                  className="px-4 py-2 bg-[#09090b] border border-white/10 rounded-lg text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/5 hover:text-white transition-colors text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Add Blog Modal */}
      <CreateBlogModal
        isOpen={isModalOpen}
        editingBlog={editingBlog}
        onClose={() => {
          setEditingBlog(null);
          setIsModalOpen(false);
          fetchBlogs();
        }}
        onSuccess={() => {
          fetchBlogs();
        }}
        profileUser={currentUser}
      />
    </div>
  );
};

export default page;

