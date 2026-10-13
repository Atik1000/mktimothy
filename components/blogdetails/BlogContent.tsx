import React from "react";

interface BlogContentProps {
  content: string[];
}

const BlogContent: React.FC<BlogContentProps> = ({ content }) => {
  return (
    <div className="text-white aabbss text-sm sm:text-xl space-y-3 md:space-y-6 mb-16">
      {content.map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  );
};

export default BlogContent;
