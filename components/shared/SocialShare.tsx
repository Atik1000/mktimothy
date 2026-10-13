"use client";

import React from "react";
import {
  FaFacebook,
  FaLink,
  FaLinkedin,
  FaTelegram,
  FaTimes,
  FaTwitter,
  FaWhatsapp,
} from "react-icons/fa";

interface SocialShareProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  url: string;
  image?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({
  isOpen,
  onClose,
  title,
  description = "",
  url,
  image = "",
}) => {
  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description);
  const encodedImage = encodeURIComponent(image);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=YourAppName`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedDescription}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
      onClose();
    } catch (error) {
      console.error("Failed to copy link:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      alert("Link copied to clipboard!");
      onClose();
    }
  };

  const useNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        onClose();
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bgdark rounded-lg max-w-md w-full p-6 border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white aabbss font-bold text-xl">Share Post</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h4 className="text-white font-medium text-sm mb-2 line-clamp-2">
            {title}
          </h4>
          {description && (
            <p className="text-gray-400 text-xs line-clamp-3 mb-2">
              {description}
            </p>
          )}
          <p className="text-greencolor text-xs truncate">{url}</p>
        </div>

        {/* Social Media Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => handleShare("facebook")}
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#1877F2]/20 hover:bg-[#1877F2]/30 transition-colors group"
          >
            <FaFacebook className="text-[#1877F2] w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-white text-xs">Facebook</span>
          </button>

          <button
            onClick={() => handleShare("twitter")}
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 transition-colors group"
          >
            <FaTwitter className="text-[#1DA1F2] w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-white text-xs">Twitter</span>
          </button>

          <button
            onClick={() => handleShare("linkedin")}
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 transition-colors group"
          >
            <FaLinkedin className="text-[#0A66C2] w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-white text-xs">LinkedIn</span>
          </button>

          <button
            onClick={() => handleShare("whatsapp")}
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 transition-colors group"
          >
            <FaWhatsapp className="text-[#25D366] w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-white text-xs">WhatsApp</span>
          </button>

          <button
            onClick={() => handleShare("telegram")}
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-[#0088CC]/20 hover:bg-[#0088CC]/30 transition-colors group"
          >
            <FaTelegram className="text-[#0088CC] w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-white text-xs">Telegram</span>
          </button>

          <button
            onClick={copyToClipboard}
            className="flex flex-col items-center gap-2 p-4 rounded-lg bg-greencolor/20 hover:bg-greencolor/30 transition-colors group"
          >
            <FaLink className="text-greencolor w-6 h-6 group-hover:scale-110 transition-transform" />
            <span className="text-white text-xs">Copy Link</span>
          </button>
        </div>

        {/* Native Share Button (Mobile) */}
        {typeof navigator !== "undefined" &&
          typeof navigator.share === "function" && (
            <button
              onClick={useNativeShare}
              className="w-full bg-greencolor text-white py-3 px-4 rounded-lg hover:bg-greencolor/90 transition-colors font-medium"
            >
              Share via Device
            </button>
          )}
      </div>
    </div>
  );
};

export default SocialShare;
