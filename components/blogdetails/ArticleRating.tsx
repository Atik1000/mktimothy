import React, { useState } from "react";
import { FaStar } from "react-icons/fa6";

interface ArticleRatingProps {
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
}

const ArticleRating: React.FC<ArticleRatingProps> = ({
  initialRating = 3,
  onRatingChange,
}) => {
  const [rating, setRating] = useState(initialRating);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
    if (onRatingChange) {
      onRatingChange(newRating);
    }
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-3xl sm:text-4xl cursor-pointer ${
          i < rating ? "text-greencolor" : "text-white"
        }`}
        onClick={() => handleRatingChange(i + 1)}
      >
        <FaStar />
      </span>
    ));
  };

  return (
    <div className="bg-[#303030] rounded-[20px] p-4 sm:p-8">
      <h3 className="text-white aabbss text-base sm:text-xl font-bold mb-4 sm:mb-6">
        Find this article useful?
      </h3>
      <div className="flex gap-2 ">{renderStars()}</div>
    </div>
  );
};

export default ArticleRating;
