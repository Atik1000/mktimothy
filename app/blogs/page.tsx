"use client";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FaCalendar,
  FaChevronUp,
  FaComment,
  FaEye,
  FaHeart,
  FaUser,
} from "react-icons/fa";
import { IoChatbubbleOutline, IoEyeOutline, IoHeartOutline } from "react-icons/io5";
import { formatDistanceToNow } from "date-fns";
import { getTotalStat } from "@/lib/utils/mock-stats";

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  status: string;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  createdAt: string;
  publishedAt?: string;
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
  tags: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
      color?: string;
    };
  }>;
  _count: {
    likes: number;
    comments: number;
    savedBy: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
  _count?: {
    blogs: number;
  };
}

interface Filters {
  categoryId: string;
  search: string;
  sortBy: string;
  sortOrder: string;
  isFeatured: boolean;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 12,
    hasNext: false,
    hasPrev: false,
  });

  const [filters, setFilters] = useState<Filters>({
    categoryId: "",
    search: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    isFeatured: false,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [filters, pagination.currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const result = await response.json();

      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        status: "PUBLISHED",
        isActive: "true",
        page: pagination.currentPage.toString(),
        limit: pagination.pageSize.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        ...(filters.search && { search: filters.search }),
        ...(filters.isFeatured && { isFeatured: "true" }),
      });

      const response = await fetch(`/api/blogs?${params}`);
      const result = await response.json();

      if (result.success) {
        setBlogs(result.data.blogs);
        setPagination(result.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getSortOptions = () => [
    { value: "createdAt", label: "Latest" },
    { value: "viewCount", label: "Most Viewed" },
    { value: "likeCount", label: "Most Liked" },
    { value: "title", label: "Title A-Z" },
  ];

  return (
    <div className="pt-[150px] pb-[100px] relative min-h-screen">
      <div className="fixed inset-0 bg-[url('/images/background.webp')] bg-cover bg-center bg-no-repeat -z-30" />
      <div className="absolute inset-0 bg-black/50" />
      <div className="width z-40 scale-100">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-white aabbss font-bold md:text-[32px] text-[24px] mb-4 z-40">
              Blog Posts
            </h1>
            <p className="text-white aabbss text-[16px] max-w-2xl z-40">
              Discover insightful articles, tips, and stories from our community
              of business owners and experts.
            </p>
          </div>
          <div className="z-40 overflow-x-auto max-w-full thin-green-scrollbar pb-3">
            <div className="flex gap-3 p-2 rounded-xl bg-bgdark border border-gray-700 w-fit">
              <button
                onClick={() => handleFilterChange("categoryId", "")}
                className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                  filters.categoryId === ""
                    ? "bg-greencolor text-white shadow-lg"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                All Blogs
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleFilterChange("categoryId", category.id)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                    filters.categoryId === category.id
                      ? "bg-greencolor text-white shadow-lg"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col xmd:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="xmd:w-[300px] w-full flex-shrink-0">
            <div className="bg-bglight rounded-lg p-6 space-y-6">
              {/* Search */}
              <div>
                <label className="block text-white aabbss font-semibold mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search blog posts..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-bgdark text-white border border-gray-600 focus:border-greencolor focus:outline-none"
                />
              </div>

              {/* Categories */}
              <div>
                <label className="block text-white aabbss font-semibold mb-2">
                  Category
                </label>
                <select
                  value={filters.categoryId}
                  onChange={(e) =>
                    handleFilterChange("categoryId", e.target.value)
                  }
                  className="w-full px-4 py-2 rounded-lg bg-bgdark text-white border border-gray-600 focus:border-greencolor focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Featured Toggle */}
              <div>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.isFeatured}
                    onChange={(e) =>
                      handleFilterChange("isFeatured", e.target.checked)
                    }
                    className="rounded bg-bgdark border-gray-600 text-greencolor focus:ring-greencolor"
                  />
                  <span className="text-white aabbss">Featured Only</span>
                </label>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-white aabbss font-semibold mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-bgdark text-white border border-gray-600 focus:border-greencolor focus:outline-none"
                >
                  {getSortOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <span className="text-white aabbss font-bold text-base">
                  Sort by
                </span>
                <FaChevronUp className="text-white rotate-180 w-4 h-4" />
              </div>
              <div className="text-right aabbss text-sm md:text-base font-semibold">
                <span className="text-greencolor">Showing </span>
                <span className="text-white">
                  {(pagination.currentPage - 1) * pagination.pageSize + 1}-
                  {Math.min(
                    pagination.currentPage * pagination.pageSize,
                    pagination.totalCount
                  )}
                </span>
                <span className="text-greencolor">
                  {" "}
                  of {pagination.totalCount} posts
                </span>
              </div>
            </div>

            {/* Blog Posts Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div
                    key={index}
                    className="bg-bglight rounded-lg overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-gray-700"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-600 rounded w-1/2"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-600 rounded"></div>
                        <div className="h-3 bg-gray-600 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : blogs.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {blogs.map((blog) => (
                    <Link
                      key={blog.id}
                      href={`/blog-details/${blog.id}`}
                      className="w-full bg-[#18181b] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all hover:shadow-black/50 hover:border-white/10 group"
                    >
                      {/* Image Section */}
                      <div className="relative w-full h-48 sm:h-52 bg-[#27272a] overflow-hidden">
                        {blog.coverImage ? (
                          <img
                            src={proxiedImageUrl(blog.coverImage)}
                            alt={blog.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-greencolor to-blue-600 flex items-center justify-center">
                            <span className="text-white aabbss font-bold text-2xl">
                              {blog.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        
                        {/* Top Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-80" />
                        
                        {/* Floating Status Badges */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
                          {blog.isFeatured && (
                            <span className="px-2.5 py-1 bg-bgdark text-amber-400 border border-amber-500/20 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
                              Featured
                            </span>
                          )}
                          <span className="px-2.5 py-1 bg-bgdark text-green-400 border border-green-500/20 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-md">
                            {blog.category?.name || "Blog"}
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-4 flex flex-col flex-1">
                        
                        {/* Author & Date Row */}
                        <div className="flex items-center gap-2 mb-3 text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <FaUser className="w-3 h-3 text-zinc-500" />
                            {blog.author.firstName} {blog.author.lastName}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                          <span className="flex items-center gap-1.5">
                            <FaCalendar className="w-3 h-3 text-zinc-500" />
                            {formatDate(blog.publishedAt || blog.createdAt)}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div className="mb-4 flex-1">
                          <h2 className="text-lg font-bold text-white mb-2 tracking-tight line-clamp-2 group-hover:text-emerald-400 transition-colors">
                            {blog.title}
                          </h2>
                          <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
                            {blog.excerpt || truncateText(blog.content.replace(/<[^>]*>/g, ""), 150)}
                          </p>
                        </div>

                        {/* Tags */}
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                            {blog.tags.slice(0, 3).map((blogTag) => (
                              <span
                                key={blogTag.tag.id}
                                className="px-2.5 py-1 bg-emerald-950/40 text-emerald-400 rounded-md text-[10px] font-medium hover:bg-emerald-900/50 transition-colors border border-emerald-900/30 uppercase tracking-wider"
                              >
                                #{blogTag.tag.name}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Stats Footer */}
                        <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/5">
                          <div className="flex items-center gap-5 text-zinc-500">
                            {/* Likes */}
                            <div className="flex items-center gap-1.5 group/stat cursor-pointer hover:text-rose-400 transition-colors">
                              <IoHeartOutline className="w-[14px] h-[14px]" />
                              <span className="text-xs font-semibold">{getTotalStat(blog.id, blog._count?.likes, 'likes')}</span>
                            </div>
                            {/* Comments */}
                            <div className="flex items-center gap-1.5 group/stat cursor-pointer hover:text-blue-400 transition-colors">
                              <IoChatbubbleOutline className="w-[14px] h-[14px]" />
                              <span className="text-xs font-semibold">{blog._count?.comments || 0}</span>
                            </div>
                            {/* Views */}
                            <div className="flex items-center gap-1.5 group/stat cursor-pointer hover:text-white transition-colors">
                              <IoEyeOutline className="w-[14px] h-[14px]" />
                              <span className="text-xs font-semibold">{getTotalStat(blog.id, blog.viewCount, 'views')}</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={!pagination.hasPrev}
                        className="px-4 py-2 rounded-lg bg-bglight text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-greencolor transition-colors"
                      >
                        Previous
                      </button>

                      {Array.from(
                        { length: Math.min(5, pagination.totalPages) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-4 py-2 rounded-lg transition-colors ${
                                pagination.currentPage === page
                                  ? "bg-greencolor text-white"
                                  : "bg-bglight text-white hover:bg-greencolor"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        }
                      )}

                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={!pagination.hasNext}
                        className="px-4 py-2 rounded-lg bg-bglight text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-greencolor transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg mb-4">
                  No blog posts found matching your criteria.
                </p>
                <button
                  onClick={() =>
                    setFilters({
                      categoryId: "",
                      search: "",
                      sortBy: "createdAt",
                      sortOrder: "desc",
                      isFeatured: false,
                    })
                  }
                  className="px-6 py-3 bg-greencolor text-white rounded-lg hover:bg-greencolor/90 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
