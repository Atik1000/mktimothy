/**
 * Blog Service Functions
 * Handles all blog-related API interactions
 */

import { BlogStatus } from "@prisma/client";

export interface BlogFilters {
  search?: string;
  categoryId?: string;
  status?: BlogStatus;
  isFeatured?: boolean;
  isActive?: boolean;
  authorId?: string;
  tags?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface BlogFormData {
  title: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  categoryId: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  status?: BlogStatus;
  isFeatured?: boolean;
  publishedAt?: string;
}

// Fetch blogs with filters and pagination
export const fetchBlogs = async (
  filters: BlogFilters = {},
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
      ...(filters.isFeatured !== undefined && {
        isFeatured: filters.isFeatured.toString(),
      }),
      ...(filters.isActive !== undefined && {
        isActive: filters.isActive.toString(),
      }),
      ...(filters.authorId && { authorId: filters.authorId }),
      ...(filters.tags && { tags: filters.tags }),
      ...(filters.sortBy && { sortBy: filters.sortBy }),
      ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
    });

    console.log(
      "Blog Service - Fetching blogs with params:",
      params.toString()
    );

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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Blog Service - API response:", result);

    return result;
  } catch (error) {
    console.error("Error fetching blogs:", error);
    throw error;
  }
};

// Fetch user's blogs
export const fetchUserBlogs = async (
  userId: string,
  filters: BlogFilters = {}
) => {
  return fetchBlogs({ ...filters, authorId: userId });
};

// Fetch single blog by ID
export const fetchBlogById = async (blogId: string) => {
  try {
    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");

    const response = await fetch(`/api/blogs/${blogId}`, {
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
    console.error("Error fetching blog:", error);
    throw error;
  }
};

// Create new blog
export const createBlog = async (blogData: BlogFormData) => {
  try {
    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");

    const response = await fetch("/api/blogs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating blog:", error);
    throw error;
  }
};

// Update existing blog
export const updateBlog = async (
  blogId: string,
  blogData: Partial<BlogFormData>
) => {
  try {
    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");

    const response = await fetch(`/api/blogs/${blogId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(blogData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating blog:", error);
    throw error;
  }
};

// Delete blog
export const deleteBlog = async (blogId: string) => {
  try {
    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");

    const response = await fetch(`/api/blogs/${blogId}`, {
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
    console.error("Error deleting blog:", error);
    throw error;
  }
};

// Like/Unlike blog
export const toggleBlogLike = async (blogId: string) => {
  try {
    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");

    const response = await fetch(`/api/blogs/${blogId}/like`, {
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
    console.error("Error toggling blog like:", error);
    throw error;
  }
};

// Save/Unsave blog
export const toggleBlogSave = async (blogId: string) => {
  try {
    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");

    const response = await fetch(`/api/blogs/${blogId}/save`, {
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
    console.error("Error toggling blog save:", error);
    throw error;
  }
};

// Add comment to blog
export const addBlogComment = async (
  blogId: string,
  content: string,
  rating?: number,
  parentId?: string
) => {
  try {
    const token =
      localStorage.getItem("auth-token") ||
      sessionStorage.getItem("auth-token");

    const response = await fetch(`/api/blogs/${blogId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ content, rating, parentId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error adding blog comment:", error);
    return { success: false, error: "Failed to add comment" };
  }
};

// Edit blog comment
export const editBlogComment = async (
  blogId: string,
  commentId: string,
  content: string
) => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const response = await fetch(`/api/blogs/${blogId}/comments/${commentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to edit comment");
    }

    const result = await response.json();
    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error editing blog comment:", error);
    return { success: false, error: "Failed to edit comment" };
  }
};

// Delete blog comment
export const deleteBlogComment = async (
  blogId: string,
  commentId: string
) => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const response = await fetch(`/api/blogs/${blogId}/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete comment");
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting blog comment:", error);
    return { success: false, error: "Failed to delete comment" };
  }
};

// Fetch blog comments
export const fetchBlogComments = async (
  blogId: string,
  page: number = 1,
  limit: number = 10
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`/api/blogs/${blogId}/comments?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

// Fetch tags
export const fetchTags = async (search?: string, limit: number = 50) => {
  try {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(search && { search }),
    });

    const response = await fetch(`/api/tags?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching tags:", error);
    throw error;
  }
};

// Get blog statistics (for dashboard)
export const getBlogStats = async (authorId?: string) => {
  try {
    const filters: BlogFilters = {};
    if (authorId) {
      filters.authorId = authorId;
    }

    const [publishedResult, draftResult, scheduledResult, archivedResult] =
      await Promise.all([
        fetchBlogs({ ...filters, status: "PUBLISHED" }, 1, 1),
        fetchBlogs({ ...filters, status: "DRAFT" }, 1, 1),
        fetchBlogs({ ...filters, status: "SCHEDULED" }, 1, 1),
        fetchBlogs({ ...filters, status: "ARCHIVED" }, 1, 1),
      ]);

    return {
      published: publishedResult.data?.pagination?.totalCount || 0,
      draft: draftResult.data?.pagination?.totalCount || 0,
      scheduled: scheduledResult.data?.pagination?.totalCount || 0,
      archived: archivedResult.data?.pagination?.totalCount || 0,
    };
  } catch (error) {
    console.error("Error fetching blog stats:", error);
    return { published: 0, draft: 0, scheduled: 0, archived: 0 };
  }
};

