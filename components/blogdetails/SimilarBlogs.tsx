"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaCalendar, FaComment, FaEye, FaHeart, FaUser } from "react-icons/fa";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";

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

const SimilarBlogs: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    pageSize: 4,
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

  // Get current blog ID from URL to exclude it from similar blogs
  const pathParts = window.location.pathname.split("/");
  const currentBlogId = pathParts[pathParts.length - 1];

  return (
    <div className="width py-5 pb-10">
      <h2 className="text-white aabbss text-[32px] font-bold leading-[1.364] mb-8">
        Similar Blogs
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {blogs
          .filter((blog) => blog.id !== currentBlogId)
          .map((blog) => (
            <Link
              key={blog.id}
              href={`/blog-details/${blog.id}`}
              className="bg-bglight rounded-lg overflow-hidden hover:transform hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              {/* Blog Image */}
              <div className="h-48 relative overflow-hidden">
                {blog.coverImage ? (
                  <Image
                    src={proxiedImageUrl(blog.coverImage)}
                    alt={blog.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-greencolor to-blue-600 flex items-center justify-center">
                    <span className="text-white aabbss font-bold text-2xl">
                      {blog.title.charAt(0)}
                    </span>
                  </div>
                )}
                {blog.isFeatured && (
                  <div className="absolute top-3 left-3 bg-greencolor text-white px-2 py-1 rounded text-xs font-bold">
                    FEATURED
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs">
                  {blog.category.name}
                </div>
              </div>

              {/* Blog Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
                  <FaUser className="w-3 h-3" />
                  <span>
                    {blog?.author?.firstName} {blog?.author?.lastName}
                  </span>
                  <FaCalendar className="w-3 h-3 ml-2" />
                  <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                </div>

                <h3 className="text-white aabbss font-bold text-lg mb-2  group-hover:text-greencolor transition-colors line-clamp-1">
                  {blog.title}
                </h3>

                <p className="text-gray-400 aabbss text-sm mb-3 line-clamp-3">
                  {blog.excerpt ||
                    truncateText(blog?.content?.replace(/<[^>]*>/g, ""), 150)}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <FaEye className="w-3 h-3" />
                      {blog?.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaHeart className="w-3 h-3" />
                      {blog?._count?.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaComment className="w-3 h-3" />
                      {blog?._count?.comments}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
      </div>

      {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {blogs.map((blog) => (
         
          <div className="relative">
           
            <Link
              href={blog.link}
              className="bg-bgdark rounded-[12px] sm:rounded-[20px] p-2 sm:p-3 md:p-[20px] flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-[20px] "
            >
            
              <div className="flex-shrink-0 relative  md:w-[240px] md:h-[240px] xlg:w-[280px] xlg:h-[280px]">
                <Image
                  src={proxiedImageUrl(blog.image)}
                  alt={blog.title}
                  width={280}
                  height={281}
                  className="w-full md:w-[240px] md:h-[240px] xlg:w-[280px] xlg:h-[280px] object-cover rounded-[8px] sm:rounded-[10px]"
                />

                
                <div className="absolute right-2 top-2 sm:hidden bg-bgdark/70 backdrop-blur-md rounded-[8px] p-[6px] flex items-center gap-[4px] min-w-[50px] h-[32px]">
                  <ImArrowUp className="text-sm text-white" />
                  <span className="text-white aabbss font-semibold text-[14px] leading-[18px]">
                    {blog.upvotes}
                  </span>
                </div>
               
                {blog.isEditorsPick && (
                  <div className="absolute left-[15px]  bottom-[15px]  bg-black/50 backdrop-blur-md rounded-[8px] sm:rounded-[10px] px-[10px] sm:px-[15px] py-[4px] sm:py-[6px]">
                    <span className="text-white aabbss font-semibold text-[14px] sm:text-[16px] leading-[18px] sm:leading-[22px]">
                      Editor's Pick
                    </span>
                  </div>
                )}
              </div>

            
              <div className="flex-1 flex flex-col justify-between py-2 sm:py-[15px] md:py-[30px]">
                
                <div>
                  <div className="flex justify-between items-start mb-[8px] xlg:mb-[10px]">
                    <h3 className="text-white aabbss font-bold text-[16px] xs:text-[18px] sm:text-[20px] xlg:text-[24px] max-w-[280px] sm:max-w-[400px] md:max-w-[600px]">
                      {blog.title}
                    </h3>
                    <button className="text-white aabbss font-semibold text-[14px] sm:text-[16px] leading-[18px] sm:leading-[22px] hover:text-white/80 transition-colors flex items-center gap-[4px] sm:gap-[5px] flex-shrink-0 ml-2">
                      <FaBookmark className="w-[16px] h-[14px] sm:w-[19px] sm:h-[17px]" />
                      <span className="hidden xs:inline">Save</span>
                    </button>
                  </div>

                  <p className="text-white aabbss text-[14px] xs:text-[16px] sm:text-[18px] xlg:text-[20px] mb-[15px] sm:mb-[16px] xlg:mb-[30px]">
                    {blog.location}
                  </p>

                  <p className="text-white aabbss text-[14px] sm:text-[16px] xlg:text-[20px] max-w-full sm:max-w-[600px] md:max-w-[800px] mb-[10px] sm:mb-[16px] xlg:mb-[30px] line-clamp-3 sm:line-clamp-none">
                    {blog.description}
                  </p>
                </div>

             
                <div className="flex flex-wrap items-center gap-[15px] sm:gap-[20px] xlg:gap-[30px]">
                 
                  <div className="flex items-center gap-[8px] sm:gap-[10px] xlg:gap-[15px]">
                    <FaClock className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] xlg:w-[31px] xlg:h-[31px] text-greencolor flex-shrink-0" />
                    <span className="text-white aabbss text-[12px] xs:text-[14px] sm:text-[16px] xlg:text-[20px] whitespace-nowrap">
                      {blog.timeAgo}
                    </span>
                  </div>

                 
                  <div className="w-[1px] h-[20px] sm:h-[24px] md:h-[31px] bg-lightgray hidden sm:block"></div>

           
                  <div className="flex items-center gap-[8px] sm:gap-[10px] xlg:gap-[15px]">
                    <FaTh className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] xlg:w-[31px] xlg:h-[31px] text-greencolor flex-shrink-0" />
                    <span className="text-white aabbss text-[12px] xs:text-[14px] sm:text-[16px] xlg:text-[20px] ">
                      {blog.category}
                    </span>
                  </div>

           
                  <div className="w-[1px] h-[20px] sm:h-[24px] md:h-[31px] bg-lightgray hidden sm:block"></div>

                  <div className="flex items-center gap-[8px] sm:gap-[10px] xlg:gap-[15px]">
                    <FaStar className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] xlg:w-[31px] xlg:h-[31px] text-greencolor flex-shrink-0" />
                    <span className="text-white aabbss text-[12px] xs:text-[14px] sm:text-[16px] xlg:text-[20px]">
                      {blog.rating}
                    </span>
                  </div>
                </div>
              </div>
            </Link>

          
            <div className="absolute left-[15px] sm:left-[20px] md:left-[30px] top-[15px] sm:top-[20px] md:top-[30px] bg-bgdark/50 backdrop-blur-md rounded-[8px] sm:rounded-[10px] p-[6px] sm:p-[8px] items-center gap-[4px] sm:gap-[5px] min-w-[50px] sm:min-w-[64px] h-[32px] sm:h-[40px] hidden sm:flex">
              <ImArrowUp className="text-base sm:text-lg text-white" />
              <span className="text-white aabbss font-semibold text-[14px] sm:text-[16px] leading-[18px] sm:leading-[22px]">
                {blog.upvotes}
              </span>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default SimilarBlogs;
