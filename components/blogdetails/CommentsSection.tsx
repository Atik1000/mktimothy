"use client";

import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { FaStar, FaEllipsisV, FaUser } from "react-icons/fa";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";

export interface Comment {
  id: string;
  userId: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
  rating?: number;
  approvalStatus?: string;
  replies?: Comment[];
}

interface CommentsSectionProps {
  comments: Comment[];
  currentUserId?: string;
  onReplySubmit?: (parentId: string, text: string) => Promise<void>;
  onEditSubmit?: (commentId: string, text: string) => Promise<void>;
  onDelete?: (commentId: string) => Promise<void>;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  currentUserId,
  onReplySubmit,
  onEditSubmit,
  onDelete,
}) => {
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editCommentId, setEditCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = () => setMenuOpenId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <FaStar
        key={i}
        className={`w-3 h-3 md:w-4 md:h-4 ${
          i < rating ? "text-greencolor" : "text-gray-400"
        }`}
      />
    ));
  };

  const handleReplyClick = (commentId: string) => {
    setActiveReplyId(activeReplyId === commentId ? null : commentId);
    setReplyText("");
    setEditCommentId(null);
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyText.trim() || !onReplySubmit) return;
    setIsSubmitting(true);
    await onReplySubmit(parentId, replyText);
    setIsSubmitting(false);
    setActiveReplyId(null);
    setReplyText("");
  };

  const handleEditClick = (comment: Comment) => {
    setEditCommentId(comment.id);
    setEditText(comment.text);
    setActiveReplyId(null);
  };

  const handleSubmitEdit = async (commentId: string) => {
    if (!editText.trim() || !onEditSubmit) return;
    setIsSubmitting(true);
    await onEditSubmit(commentId, editText);
    setIsSubmitting(false);
    setEditCommentId(null);
  };

  const handleDelete = (commentId: string) => {
    setDeleteConfirmId(commentId);
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={`flex gap-4 ${isReply ? "mt-4" : ""}`}>
      {comment.avatar ? (
        <Image
          src={proxiedImageUrl(comment.avatar)}
          alt={comment.author}
          width={40}
          height={40}
          className={`${
            isReply ? "w-6 h-6 md:w-8 md:h-8" : "w-8 h-8 md:w-10 md:h-10"
          } rounded-full`}
        />
      ) : (
        <div
          className={`${
            isReply ? "w-6 h-6 md:w-8 md:h-8" : "w-8 h-8 md:w-10 md:h-10"
          } rounded-full bg-greencolor flex items-center justify-center`}
        >
          <FaUser className="text-white w-3 h-3 md:w-3.5 md:h-3.5" />
        </div>
      )}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div className="flex flex-col xsm:flex-row xsm:items-center xsm:gap-4 mb-2">
            <h4 className="text-white aabbss text-[14px] md:text-[18px] font-semibold">
              {comment.author}
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 aabbss text-xs">
                {comment.time}
              </span>
              {comment.approvalStatus === "PENDING" && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  Pending Admin Approval
                </span>
              )}
            </div>
            {comment.rating && !isReply && (
              <div className="flex gap-1 items-center">
                {renderStars(comment.rating)}
                <span className="text-greencolor text-xs ml-1">
                  ({comment.rating}/5)
                </span>
              </div>
            )}
          </div>

          {/* 3-dot Menu for Owner */}
          {currentUserId === comment.userId && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.nativeEvent.stopImmediatePropagation();
                  setMenuOpenId((prev) => (prev === comment.id ? null : comment.id));
                }}
                className="text-gray-400 hover:text-white p-2 relative z-20 cursor-pointer"
              >
                <FaEllipsisV className="pointer-events-none" />
              </button>
              {menuOpenId === comment.id && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-[#303030] border border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(comment);
                      setMenuOpenId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(comment.id);
                      setMenuOpenId(null);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comment Content / Edit Mode */}
        {editCommentId === comment.id ? (
          <div className="mt-2 flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full bg-transparent border-b border-gray-600 pb-2 text-white text-sm outline-none focus:border-greencolor transition-colors"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => setEditCommentId(null)}
                  className="text-white px-3 py-1 text-sm rounded-full hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitEdit(comment.id)}
                  disabled={!editText.trim() || isSubmitting}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    !editText.trim() || isSubmitting
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-greencolor text-white hover:bg-greencolor/90"
                  }`}
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <p className="text-white aabbss text-sm xsm:text-base md:text-[16px] mb-2">
              {comment.text}
            </p>
            {!isReply && (
              <button
                onClick={() => handleReplyClick(comment.id)}
                className="text-gray-400 hover:text-white aabbss text-xs xsm:text-sm md:text-sm font-bold transition-colors"
              >
                Reply
              </button>
            )}
          </>
        )}

        {/* Inline Reply Form */}
        {activeReplyId === comment.id && !isReply && (
          <div className="mt-4 flex gap-3">
             <div className="flex-1">
              <input
                type="text"
                placeholder="Add a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full bg-transparent border-b border-gray-600 pb-2 text-white text-sm outline-none focus:border-greencolor transition-colors"
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => handleReplyClick(comment.id)}
                  className="text-white px-3 py-1 text-sm rounded-full hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyText.trim() || isSubmitting}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    !replyText.trim() || isSubmitting
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-greencolor text-white hover:bg-greencolor/90"
                  }`}
                >
                  {isSubmitting ? "Replying..." : "Reply"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 pl-4 border-l-2 border-gray-700 space-y-4">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    </div>
  );

  if (comments.length === 0) {
    return (
      <div className="pb-16 pt-10 width">
        <h2 className="text-white aabbss text-[24px] md:text-[32px] font-bold  mb-4 md:mb-8">
          No comments yet. Be the first to comment!
        </h2>
      </div>
    );
  }

  return (
    <div className="pb-16 pt-10 width">
      <h2 className="text-white aabbss text-[24px] md:text-[32px] font-bold  mb-4 md:mb-8">
        Comments
      </h2>

      <div className="space-y-8">
        {comments.map((comment) => renderComment(comment))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#303030] rounded-xl p-6 max-w-sm w-full border border-gray-700 shadow-2xl">
            <h3 className="text-white text-xl font-bold mb-3">Delete Comment</h3>
            <p className="text-gray-300 mb-6 text-sm">
              Are you sure you want to delete this comment? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-white hover:bg-gray-700 rounded-lg transition-colors text-sm"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!onDelete) return;
                  setIsSubmitting(true);
                  await onDelete(deleteConfirmId);
                  setIsSubmitting(false);
                  setDeleteConfirmId(null);
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;
