"use client";

import { SectionLoader } from "@/components/ui/Loader";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaTh } from "react-icons/fa";
import {
  FaCalendar,
  FaClock,
  FaComment,
  FaEye,
  FaHeart,
  FaUser,
} from "react-icons/fa6";
import { IoHeartOutline, IoChatbubbleOutline, IoEyeOutline } from "react-icons/io5";

// Define interfaces for the data
interface HistoryBlog {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  coverImage?: string;
  isFeatured?: boolean;
  viewCount?: number;
  createdAt: string;
  publishedAt?: string;
  viewedAt: string;
  tags?: Array<{
    tag: {
      id: string;
      name: string;
      slug: string;
      color?: string;
    };
  }>;
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

interface HistoryListing {
  id: string;
  title: string;
  description: string;
  businessName?: string;
  businessType?: string;
  city?: string;
  state?: string;
  country?: string;
  price?: number;
  priceType?: string;
  currency?: string;
  images?: string[];
  createdAt: string;
  viewedAt: string;
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
  const [activeTab, setActiveTab] = useState("blogs");
  const [blogs, setBlogs] = useState<HistoryBlog[]>([]);
  const [listings, setListings] = useState<HistoryListing[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [blogsCount, setBlogsCount] = useState(0);
  const [listingsCount, setListingsCount] = useState(0);

  // Fetch blog history
  const fetchBlogHistory = async () => {
    setIsLoadingBlogs(true);
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      const response = await fetch("/api/users/history/blogs", {
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
          setBlogsCount(result.data.pagination.totalCount);
        }
      }
    } catch (error) {
      console.error("Error fetching blog history:", error);
    } finally {
      setIsLoadingBlogs(false);
    }
  };

  // Fetch listing history
  const fetchListingHistory = async () => {
    setIsLoadingListings(true);
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      const response = await fetch("/api/users/history/listings", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setListings(result.data.listings);
          setListingsCount(result.data.pagination.totalCount);
        }
      }
    } catch (error) {
      console.error("Error fetching listing history:", error);
    } finally {
      setIsLoadingListings(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchBlogHistory();
    fetchListingHistory();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  return (
    <div className="flex w-full h-full text-white ">
      {/* Main Content */}
      <div className="p-8 w-full bg-black">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8 mt-4 justify-between">
          <h1 className="text-white font-bold text-[32px] leading-5">
            History
          </h1>
          <div className="flex items-center mb-6 relative">
            <div className="flex items-center gap-5">
              <button
                onClick={() => setActiveTab("blogs")}
                className={`text-base md:text-[19px] aabbss ${
                  activeTab === "blogs"
                    ? "text-greencolor font-semibold"
                    : "text-white font-normal"
                }`}
              >
                Blogs ({blogsCount})
              </button>
              <div className="w-[1px] h-[23px] bg-lightgray"></div>
              <button
                onClick={() => setActiveTab("listings")}
                className={`text-base md:text-[19px] aabbss ${
                  activeTab === "listings"
                    ? "text-greencolor font-semibold"
                    : "text-white font-normal"
                }`}
              >
                Listings ({listingsCount})
              </button>
            </div>
          </div>
        </div>

        {/* Content Container */}
        {activeTab === "blogs" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoadingBlogs ? (
              <div className="col-span-full">
                <SectionLoader
                  height="h-64"
                  message="Loading blog history..."
                />
              </div>
            ) : blogs.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-64">
                <div className="text-white text-lg">No blog history found.</div>
              </div>
            ) : (
              blogs.map((blog) => (
                <Link
                  key={blog.id}
                  href={`/blog-details/${blog.id}`}
                  className="w-full bg-[#18181b] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all hover:shadow-black/50 hover:border-white/10 group relative"
                >
                  {/* Image Section */}
                  <div className="relative w-full h-48 sm:h-52 bg-[#27272a] overflow-hidden">
                    {blog.coverImage ? (
                      <Image
                        src={proxiedImageUrl(blog.coverImage)}
                        alt={blog.title}
                        width={400}
                        height={200}
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

                    {/* Viewed at badge */}
                    <div className="absolute top-3 left-3 bg-greencolor/80 text-white px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm z-10">
                      Viewed {formatDate(blog.viewedAt)}
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
                        {blog.excerpt || (blog.content ? truncateText(blog.content.replace(/<[^>]*>/g, ""), 150) : "")}
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
                          <span className="text-xs font-semibold">{blog._count?.likes || 0}</span>
                        </div>
                        {/* Comments */}
                        <div className="flex items-center gap-1.5 group/stat cursor-pointer hover:text-blue-400 transition-colors">
                          <IoChatbubbleOutline className="w-[14px] h-[14px]" />
                          <span className="text-xs font-semibold">{blog._count?.comments || 0}</span>
                        </div>
                        {/* Views */}
                        <div className="flex items-center gap-1.5 group/stat cursor-pointer hover:text-white transition-colors">
                          <IoEyeOutline className="w-[14px] h-[14px]" />
                          <span className="text-xs font-semibold">{blog.viewCount || 0}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </Link>
              ))
            )}
          </div>
        ) : activeTab === "listings" ? (
          <div className="space-y-[20px] p-0">
            {isLoadingListings ? (
              <SectionLoader
                height="h-64"
                message="Loading listing history..."
              />
            ) : listings.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-white text-lg">
                  No listing history found.
                </div>
              </div>
            ) : (
              listings.map((listing) => (
                // <div
                //   key={listing.id}
                //   className="relative bg-bgdark rounded-[20px] w-full p-5"
                // >
                //   {/* Viewed at badge */}
                //   <div className="absolute left-[25px] top-[25px] bg-greencolor/80 backdrop-blur-sm rounded-[10px] px-[5px] py-[4px] z-10">
                //     <span className="text-white aabbuu font-semibold text-[10px]">
                //       Viewed {formatDate(listing.viewedAt)}
                //     </span>
                //   </div>

                //   {/* Main Listing Image */}
                //   <Image
                //     src={proxiedImageUrl(listing.images?.[0] || "/images/placeholder.png")}
                //     alt="Listing image"
                //     width={150}
                //     height={150}
                //     className="w-[150px] h-[150px] rounded-[10px] object-cover"
                //   />

                //   {/* Content Area */}
                //   <div className="absolute left-[200px] top-[34px]">
                //     <h3 className="text-white aabbss font-bold text-[24px] leading-[32.74px] w-[600px]">
                //       {listing.title}
                //     </h3>
                //     <p className="text-white aabbss font-normal text-[20px] leading-[27.28px] mt-[10px]">
                //       {listing.description}
                //     </p>
                //   </div>

                //   {/* Metadata Row */}
                //   <div className="absolute left-[200px] top-[127px] flex items-center">
                //     {/* Time */}
                //     <div className="flex items-center">
                //       <FaClock className="w-[31px] h-[31px] text-greencolor" />
                //       <span className="text-white aabbss font-normal text-[20px] leading-[27.28px] ml-[15px]">
                //         {formatDate(listing.createdAt)}
                //       </span>
                //     </div>

                //     {/* Separator Line 1 */}
                //     <div className="w-[1px] h-[31px] bg-[#4A4A4A] mx-[30px]"></div>

                //     {/* Category */}
                //     <div className="flex items-center">
                //       <FaTh className="w-[31px] h-[31px] text-greencolor" />
                //       <span className="text-white aabbss font-normal text-[20px] leading-[27.28px] ml-[15px]">
                //         {listing.category.name}
                //       </span>
                //     </div>

                //     {/* Separator Line 2 */}
                //     <div className="w-[1px] h-[31px] bg-[#4A4A4A] mx-[30px]"></div>

                //     {/* Likes */}
                //     <div className="flex items-center">
                //       <FaHeart className="w-[31px] h-[31px] text-greencolor" />
                //       <span className="text-white aabbss font-normal text-[20px] leading-[27.28px] ml-[15px]">
                //         {listing._count.likes}
                //       </span>
                //     </div>
                //   </div>
                // </div>
                <div
                  key={listing.id}
                  className="relative bg-bgdark rounded-[20px] w-full "
                >
                  {/* Viewed at badge */}
                  <div className="absolute left-[25px] top-[25px] bg-greencolor/80 backdrop-blur-sm rounded-[10px] px-[5px] py-[4px] z-10">
                    <span className="text-white aabbuu font-semibold text-[10px]">
                      Viewed {formatDate(listing.viewedAt)}
                    </span>
                  </div>
                  <Link
                    href={`/project/${listing.id}`}
                    className="bg-bgdark rounded-[12px] sm:rounded-[20px] p-2 sm:p-3 md:p-[20px] flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-[20px] "
                  >
                    {/* Article Image */}
                    <div className="flex-shrink-0 relative  md:w-[240px] md:h-[240px] xlg:w-[280px] xlg:h-[280px]">
                      <Image
                        key={listing.images?.[0]}
                        src={proxiedImageUrl(
                          `${listing?.images?.[0] || "/images/sp1.png"}`,
                        )}
                        alt={`${listing.title}`}
                        width={280}
                        height={281}
                        className="w-full md:w-[240px] md:h-[240px] xlg:w-[280px] xlg:h-[280px] object-cover rounded-[8px] sm:rounded-[10px]"
                      />
                    </div>

                    {/* Article Content */}
                    <div className="flex-1 flex flex-col justify-between py-2 sm:py-[15px] md:py-[30px]">
                      {/* Top Section */}
                      <div>
                        <div className="flex justify-between items-start mb-[8px] xlg:mb-[10px]">
                          <h3 className="text-white aabbss font-bold text-[16px] xs:text-[18px] sm:text-[20px] xlg:text-[24px] max-w-[280px] sm:max-w-[400px] md:max-w-[600px] line-clamp-2">
                            {listing.title}
                          </h3>
                          {/* <button className="text-white aabbss font-semibold text-[14px] sm:text-[16px] leading-[18px] sm:leading-[22px] hover:text-white/80 transition-colors flex items-center gap-[4px] sm:gap-[5px] flex-shrink-0 ml-2">
                          <FaBookmark className="w-[16px] h-[14px] sm:w-[19px] sm:h-[17px]" />
                          <span className="hidden xs:inline">Save</span>
                        </button> */}
                        </div>

                        <p className="text-white aabbss text-[14px] xs:text-[16px] sm:text-[18px] xlg:text-[20px] mb-[15px] sm:mb-[16px] xlg:mb-[30px]">
                          {listing.city}, {listing.state}, {listing.country}
                        </p>

                        <p className="text-white aabbss text-[14px] sm:text-[16px] xlg:text-[20px] max-w-full sm:max-w-[600px] md:max-w-[800px] mb-[10px] sm:mb-[16px] xlg:mb-[30px] line-clamp-3 ">
                          {listing.description}
                        </p>
                      </div>

                      {/* Bottom Section - Metadata */}
                      <div className="flex flex-wrap items-center gap-[15px] sm:gap-[20px] xlg:gap-[30px]">
                        {/* Time */}
                        <div className="flex items-center gap-[8px] sm:gap-[10px] xlg:gap-[15px]">
                          <FaClock className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] xlg:w-[31px] xlg:h-[31px] text-greencolor flex-shrink-0" />
                          <span className="text-white aabbss text-[12px] xs:text-[14px] sm:text-[16px] xlg:text-[20px] whitespace-nowrap">
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Separator */}
                        <div className="w-[1px] h-[20px] sm:h-[24px] md:h-[31px] bg-lightgray hidden sm:block"></div>

                        {/* Category */}
                        <div className="flex items-center gap-[8px] sm:gap-[10px] xlg:gap-[15px]">
                          <FaTh className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] xlg:w-[31px] xlg:h-[31px] text-greencolor flex-shrink-0" />
                          <span className="text-white aabbss text-[12px] xs:text-[14px] sm:text-[16px] xlg:text-[20px] ">
                            {listing.category.name}
                          </span>
                        </div>

                        {/* Separator */}
                        <div className="w-[1px] h-[20px] sm:h-[24px] md:h-[31px] bg-lightgray hidden sm:block"></div>

                        {/* Rating */}
                        <div className="flex items-center gap-[8px] sm:gap-[10px] xlg:gap-[15px]">
                          <FaHeart className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] xlg:w-[31px] xlg:h-[31px] text-greencolor flex-shrink-0" />
                          <span className="text-white aabbss text-[12px] xs:text-[14px] sm:text-[16px] xlg:text-[20px]">
                            {listing._count.likes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default page;

