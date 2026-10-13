import Image from "next/image";
import Link from "next/link";
import { FaBookmark, FaClock, FaStar, FaTh } from "react-icons/fa";
import { ImArrowUp } from "react-icons/im";
import {proxiedImageUrl} from "@/lib/utils/proxied-image"


export interface Article {
  id: number;
  title: string;
  location: string;
  description: string;
  timeAgo: string;
  category: string;
  rating: string;
  image: string;
  upvotes: string;
  isEditorsPick: boolean;
  link: string;
}

interface ArticleCardProps {
  article: Article;
}

const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <div className="relative">
      {/* Article Container */}
      <Link
        href={article.link}
        className="bg-bgdark rounded-[12px] sm:rounded-[20px] p-2 sm:p-3 md:p-[20px] flex flex-col md:flex-row gap-2 sm:gap-3 md:gap-[20px] "
      >
        {/* Article Image */}
        <div className="flex-shrink-0 relative  md:w-[240px] md:h-[240px] xlg:w-[280px] xlg:h-[280px]">
          <Image
            src={proxiedImageUrl(article.image)}
            alt={article.title}
            width={280}
            height={281}
            className="w-full md:w-[240px] md:h-[240px] xlg:w-[280px] xlg:h-[280px] object-cover rounded-[8px] sm:rounded-[10px]"
          />

          {/* Upvote Badge - Mobile position */}
          <div className="absolute right-2 top-2 sm:hidden bg-bgdark/70 backdrop-blur-md rounded-[8px] p-[6px] flex items-center gap-[4px] min-w-[50px] h-[32px]">
            <ImArrowUp className="text-sm text-white" />
            <span className="text-white aabbss font-semibold text-[14px] leading-[18px]">
              {article.upvotes}
            </span>
          </div>
          {/* Editor's Pick Badge */}
          {article.isEditorsPick && (
            <div className="absolute left-[15px]  bottom-[15px]  bg-black/50 backdrop-blur-md rounded-[8px] sm:rounded-[10px] px-[10px] sm:px-[15px] py-[4px] sm:py-[6px]">
              <span className="text-white aabbss font-semibold text-[14px] sm:text-[16px] leading-[18px] sm:leading-[22px]">
                Editor's Pick
              </span>
            </div>
          )}
        </div>

        {/* Article Content */}
        <div className="flex-1 flex flex-col justify-between py-2 sm:py-[15px] md:py-[30px]">
          {/* Top Section */}
          <div>
            <div className="flex justify-between items-start mb-[8px] xlg:mb-[10px]">
              <h3 className="text-white aabbss font-bold text-[16px] xs:text-[18px] sm:text-[20px] xlg:text-[24px] max-w-[280px] sm:max-w-[400px] md:max-w-[600px]">
                {article.title}
              </h3>
              <button className="text-white aabbss font-semibold text-[14px] sm:text-[16px] leading-[18px] sm:leading-[22px] hover:text-white/80 transition-colors flex items-center gap-[4px] sm:gap-[5px] flex-shrink-0 ml-2">
                <FaBookmark className="w-[16px] h-[14px] sm:w-[19px] sm:h-[17px]" />
                <span className="hidden xs:inline">Save</span>
              </button>
            </div>

            <p className="text-white aabbss text-[14px] xs:text-[16px] sm:text-[18px] xlg:text-[20px] mb-[15px] sm:mb-[16px] xlg:mb-[30px]">
              {article.location}
            </p>

            <p className="text-white aabbss text-[14px] sm:text-[16px] xlg:text-[20px] max-w-full sm:max-w-[600px] md:max-w-[800px] mb-[10px] sm:mb-[16px] xlg:mb-[30px] line-clamp-3 sm:line-clamp-none">
              {article.description}
            </p>
          </div>

          {/* Bottom Section - Metadata */}
          <div className="flex flex-wrap items-center gap-[15px] sm:gap-[20px] xlg:gap-[30px]">
            {/* Time */}
            <div className="flex items-center gap-[8px] sm:gap-[10px] xlg:gap-[15px]">
              <FaClock className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] xlg:w-[31px] xlg:h-[31px] text-greencolor flex-shrink-0" />
              <span className="text-white aabbss text-[12px] xs:text-[14px] sm:text-[16px] xlg:text-[20px] whitespace-nowrap">
                {article.timeAgo}
              </span>
            </div>

            {/* Separator */}
            <div className="w-[1px] h-[20px] sm:h-[24px] md:h-[31px] bg-lightgray hidden sm:block"></div>

            {/* Category */}
            <div className="flex items-center gap-[8px] sm:gap-[10px] xlg:gap-[15px]">
              <FaTh className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] xlg:w-[31px] xlg:h-[31px] text-greencolor flex-shrink-0" />
              <span className="text-white aabbss text-[12px] xs:text-[14px] sm:text-[16px] xlg:text-[20px] ">
                {article.category}
              </span>
            </div>

            {/* Separator */}
            <div className="w-[1px] h-[20px] sm:h-[24px] md:h-[31px] bg-lightgray hidden sm:block"></div>

            {/* Rating */}
            <div className="flex items-center gap-[8px] sm:gap-[10px] xlg:gap-[15px]">
              <FaStar className="w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] xlg:w-[31px] xlg:h-[31px] text-greencolor flex-shrink-0" />
              <span className="text-white aabbss text-[12px] xs:text-[14px] sm:text-[16px] xlg:text-[20px]">
                {article.rating}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Upvote Badge - Desktop position */}
      <div className="absolute left-[15px] sm:left-[20px] md:left-[30px] top-[15px] sm:top-[20px] md:top-[30px] bg-bgdark/50 backdrop-blur-md rounded-[8px] sm:rounded-[10px] p-[6px] sm:p-[8px] items-center gap-[4px] sm:gap-[5px] min-w-[50px] sm:min-w-[64px] h-[32px] sm:h-[40px] hidden sm:flex">
        <ImArrowUp className="text-base sm:text-lg text-white" />
        <span className="text-white aabbss font-semibold text-[14px] sm:text-[16px] leading-[18px] sm:leading-[22px]">
          {article.upvotes}
        </span>
      </div>
    </div>
  );
};

export default ArticleCard;
