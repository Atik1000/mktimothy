"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FaClock, FaComment, FaEye, FaHeart, FaUser } from "react-icons/fa";
import {proxiedImageUrl} from "@/lib/utils/proxied-image"


interface RelatedPost {
  id: string;
  title: string;
  description?: string;
  excerpt?: string;
  image?: string;
  coverImage?: string;
  link: string;
  type: "blog" | "listing";
  category?: {
    name: string;
    color?: string;
  };
  sector?: {
    name: string;
    icon?: string;
  };
  tags?: Array<{
    name: string;
  }>;
  author?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  user?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  stats: {
    likes?: number;
    likeCount?: number;
    views?: number;
    viewCount?: number;
    comments?: number;
    saves?: number;
  };
  price?: number;
  currency?: string;
  createdAt: string;
  publishedAt?: string;
  isFeatured?: boolean;
}

interface RelatedPostsProps {
  posts: RelatedPost[];
  title?: string;
  type?: "blog" | "listing" | "mixed";
  maxPosts?: number;
  showStats?: boolean;
  layout?: "grid" | "list";
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({
  posts,
  title = "Related Posts",
  type = "mixed",
  maxPosts = 4,
  showStats = true,
  layout = "grid",
}) => {
  const filteredPosts = posts
    .filter((post) => type === "mixed" || post.type === type)
    .slice(0, maxPosts);

  if (filteredPosts.length === 0) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPostImage = (post: RelatedPost) => {
    return post.coverImage || post.image || "/images/placeholder.png";
  };

  const getPostDescription = (post: RelatedPost) => {
    return post.excerpt || post.description || "";
  };

  const getAuthorName = (post: RelatedPost) => {
    const author = post.author || post.user;
    if (!author) return "Anonymous";
    return `${author.firstName} ${author.lastName}`.trim();
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (!price) return null;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const gridClass =
    layout === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      : "space-y-6";

  const cardClass =
    layout === "grid"
      ? "bg-[#2C2C2C] rounded-lg overflow-hidden border border-white/10 hover:border-greencolor/50 transition-all duration-300 group"
      : "bg-[#2C2C2C] rounded-lg p-4 border border-white/10 hover:border-greencolor/50 transition-all duration-300 flex gap-4";

  return (
    <div className="width py-16">
      <div className="text-center mb-12">
        <h2 className="text-white aabbss font-bold text-3xl mb-4">{title}</h2>
        <div className="w-20 h-1 bg-greencolor mx-auto"></div>
      </div>

      <div className={gridClass}>
        {filteredPosts.map((post) => (
          <div key={post.id} className={cardClass}>
            {layout === "grid" ? (
              <>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={getPostImage(post)}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {post.isFeatured && (
                    <div className="absolute top-3 left-3 bg-greencolor text-white px-2 py-1 rounded text-xs font-medium">
                      Featured
                    </div>
                  )}
                  {post.type === "listing" && post.price && (
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                      {formatPrice(post.price, post.currency)}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Category & Type */}
                  {/* Category, Sector & Type */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex flex-wrap gap-2">
                      {post.sector && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-200">
                          {post.sector.name}
                        </span>
                      )}
                      {post.category && (
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: `${
                              post.category.color || "#22c55e"
                            }20`,
                            color: post.category.color || "#22c55e",
                          }}
                        >
                          {post.category.name}
                        </span>
                      )}
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        post.type === "blog"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}
                    >
                      {post.type === "blog" ? "Blog" : "Listing"}
                    </span>
                  </div>

                  {/* Title */}
                  <Link href={post.link}>
                    <h3 className="text-white aabbss font-bold text-lg mb-3 line-clamp-2 hover:text-greencolor transition-colors">
                      {post.title}
                    </h3>
                  </Link>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {getPostDescription(post)}
                  </p>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag: any, index) => (
                        <span
                          key={index}
                          className="bg-greencolor/20 text-greencolor px-2 py-1 rounded text-xs"
                        >
                          #{tag.name || tag.tag?.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats */}
                  {showStats && (
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex gap-3">
                        <span className="flex items-center gap-1">
                          <FaHeart className="w-3 h-3" />
                          {post.stats.likeCount || post.stats.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaEye className="w-3 h-3" />
                          {post.stats.viewCount || post.stats.views || 0}
                        </span>
                        {post.type === "blog" && (
                          <span className="flex items-center gap-1">
                            <FaComment className="w-3 h-3" />
                            {post.stats.comments || 0}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1">
                        <FaClock className="w-3 h-3" />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                    </div>
                  )}

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {post.author?.avatar || post.user?.avatar ? (
                        <Image
                          src={proxiedImageUrl(
                            post.author?.avatar ||
                            post.user?.avatar ||
                            "/images/default-avatar.png"
                          )}
                          alt={getAuthorName(post)}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-greencolor flex items-center justify-center">
                          <FaUser className="text-white w-3 h-3" />
                        </div>
                      )}
                      <span className="text-gray-400 text-sm">
                        {getAuthorName(post)}
                      </span>
                    </div>
                    <Link
                      href={post.link}
                      className="bg-greencolor text-white px-3 py-1 rounded text-sm hover:bg-greencolor/90 transition-colors"
                    >
                      {post.type === "blog" ? "Read More" : "View Details"}
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* List Layout */}
                <div className="w-32 h-24 relative flex-shrink-0 rounded overflow-hidden">
                  <Image
                    src={getPostImage(post)}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {post.sector && (
                      <span className="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-200">
                        {post.sector.name}
                      </span>
                    )}
                    {post.category && (
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${
                            post.category.color || "#22c55e"
                          }20`,
                          color: post.category.color || "#22c55e",
                        }}
                      >
                        {post.category.name}
                      </span>
                    )}
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        post.type === "blog"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}
                    >
                      {post.type === "blog" ? "Blog" : "Listing"}
                    </span>
                  </div>
                  <Link href={post.link}>
                    <h3 className="text-white aabbss font-bold text-base mb-2 line-clamp-2 hover:text-greencolor transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                    {getPostDescription(post)}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-xs text-gray-500">
                      <span>
                        {post.stats.likeCount || post.stats.likes || 0} likes
                      </span>
                      <span>
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                    </div>
                    <Link
                      href={post.link}
                      className="text-greencolor hover:text-greencolor/80 transition-colors text-sm"
                    >
                      {post.type === "blog" ? "Read More" : "View"} →
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {posts.length > maxPosts && (
        <div className="text-center mt-8">
          <Link
            href={
              type === "blog"
                ? "/blogs"
                : type === "listing"
                ? "/listings"
                : "/"
            }
            className="bg-greencolor text-white px-6 py-3 rounded-lg hover:bg-greencolor/90 transition-colors inline-block"
          >
            View All{" "}
            {type === "blog"
              ? "Blog Posts"
              : type === "listing"
              ? "Listings"
              : "Posts"}
          </Link>
        </div>
      )}
    </div>
  );
};

export default RelatedPosts;
