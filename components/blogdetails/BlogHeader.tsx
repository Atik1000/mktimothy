import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import Image from "next/image";
import React from "react";
import {
  FaBookmark,
  FaClock,
  FaHeart,
  FaRegBookmark,
  FaRegHeart,
  FaTh,
} from "react-icons/fa";
import { IoShareSocial } from "react-icons/io5";

interface BlogHeaderProps {
  title: string;
  image: string;
  publishDate: string;
  category: string;
  likes: number;
  subtitle: string;
  isAuthenticated: boolean;
  isLiked: boolean;
  isSaved: boolean;
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  tags: any[];
}

const BlogHeader: React.FC<BlogHeaderProps> = ({
  title,
  image,
  publishDate,
  category,
  likes,
  subtitle,
  isAuthenticated,
  isLiked,
  isSaved,
  onLike,
  onSave,
  onShare,
  tags,
}) => {
  return (
    <div className="mb-8 sm:mb-16">
      {/* Blog Title */}
      <h1 className="text-white aabbss text-xl md:text-[24px] xlg:text-[32px] font-bold mb-8 xlg:mb-12">
        {title}
      </h1>

      {/* Blog Image */}
      <div className="mb-8">
        <Image
          src={proxiedImageUrl(image)}
          alt="Blog main image"
          width={820}
          height={350}
          className="w-full h-[300px] md:h-[350px] object-cover rounded-[10px]"
        />
      </div>

      {/* Blog Meta */}
      <div className="flex sm:items-center  gap-4 md:gap-8 mb-8 justify-between flex-col sm:flex-row">
        <div className="flex items-center gap-4 md:gap-8">
          <div className="flex items-center gap-2 md:gap-3">
            <FaClock className="text-greencolor w-6 h-6 md:w-8 md:h-8" />
            <span className="text-white aabbss text-sm md:text-xl">
              {publishDate}
            </span>
          </div>
          <div className="w-px h-6 md:h-8 bg-lightgray"></div>
          <div className="flex items-center gap-2 md:gap-3">
            <FaTh className="text-greencolor w-6 h-6 md:w-8 md:h-8" />
            <span className="text-white aabbss text-sm md:text-xl">
              {category}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {/* Like Button */}
          <button
            onClick={onLike}
            disabled={!isAuthenticated}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              isAuthenticated
                ? isLiked
                  ? "hover:bg-gray-700 cursor-pointer scale-95"
                  : "hover:bg-gray-700 cursor-pointer hover:scale-105"
                : "opacity-50 cursor-not-allowed"
            }`}
            title={
              !isAuthenticated
                ? "Login to like this post"
                : isLiked
                ? "Unlike"
                : "Like"
            }
          >
            {isLiked ? (
              <FaHeart className="text-red-500 w-6 h-6 md:w-8 md:h-8 transition-transform duration-200" />
            ) : (
              <FaRegHeart className="text-white w-6 h-6 md:w-8 md:h-8 transition-transform duration-200" />
            )}
            <span className="text-white aabbss text-sm md:text-xl font-semibold">
              {likes}
            </span>
          </button>

          <div className="w-[1px] h-6 md:h-8 bg-lightgray"></div>

          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={!isAuthenticated}
            className={`p-2 rounded-lg transition-all duration-200 ${
              isAuthenticated
                ? isSaved
                  ? "hover:bg-gray-700 cursor-pointer scale-95"
                  : "hover:bg-gray-700 cursor-pointer hover:scale-105"
                : "opacity-50 cursor-not-allowed"
            }`}
            title={
              !isAuthenticated
                ? "Login to save this post"
                : isSaved
                ? "Unsave"
                : "Save"
            }
          >
            {isSaved ? (
              <FaBookmark className="text-greencolor w-6 h-6 md:w-8 md:h-8 transition-transform duration-200" />
            ) : (
              <FaRegBookmark className="text-white w-6 h-6 md:w-8 md:h-8 transition-transform duration-200" />
            )}
          </button>

          <div className="w-[1px] h-6 md:h-8 bg-lightgray"></div>

          {/* Share Button */}
          <button
            onClick={onShare}
            className="p-2 rounded-lg hover:bg-gray-700 hover:scale-105 transition-all duration-200 cursor-pointer"
            title="Share this post"
          >
            <IoShareSocial className="text-greencolor w-6 h-6 md:w-8 md:h-8 transition-transform duration-200" />
          </button>
        </div>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map((blogTag: any) => (
            <span
              key={blogTag.tag.id}
              className="bg-greencolor text-white px-2 py-1 rounded text-xs lowercase"
            >
              #{blogTag.tag.name}
            </span>
          ))}
        </div>
      )}
      {/* Blog Subtitle */}
      <p className="text-white aabbss text-xl md:text-2xl font-bold ">
        {subtitle}
      </p>
    </div>
  );
};

export default BlogHeader;
