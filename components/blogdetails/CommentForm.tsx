import { Spinner } from "@/components/ui/Loader";
import React, { forwardRef, useImperativeHandle, useState } from "react";

interface FormData {
  comment: string;
}

interface CommentFormProps {
  onSubmit?: (formData: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface CommentFormRef {
  addReply: (author: string) => void;
}

const CommentForm = forwardRef<CommentFormRef, CommentFormProps>(
  ({ onSubmit, isSubmitting = false }, ref) => {
    const [formData, setFormData] = useState<FormData>({
      comment: "",
    });

    useImperativeHandle(ref, () => ({
      addReply: (author: string) => {
        setFormData((prev) => ({
          ...prev,
          comment: prev.comment ? `${prev.comment} @${author} ` : `@${author} `,
        }));
        setTimeout(() => {
          const textarea = document.getElementById("comment-textarea");
          if (textarea) {
            textarea.focus();
            textarea.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      },
    }));

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      // Basic validation
      if (!formData.comment.trim()) {
        alert("Please enter a comment");
        return;
      }

      if (onSubmit) {
        try {
          await onSubmit(formData);
          // Clear the form on successful submission
          setFormData({
            comment: "",
          });
        } catch (error) {
          console.error("Form submission error:", error);
        }
      }
    };

    return (
      <div className="bg-[#303030] rounded-[20px] p-4 sm:p-8 mb-8">
        <h3 className="text-white aabbss text-base sm:text-xl font-bold mb-4 sm:mb-6">
          Add a Comment
        </h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-white aabbss text-base block mb-2">
              Comment *
            </label>
            <textarea
              id="comment-textarea"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              rows={4}
              disabled={isSubmitting}
              required
              placeholder="Share your thoughts..."
              className="w-full bg-transparent border-b border-lightgray pb-2 text-white aabbss text-base outline-none resize-none disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.comment.trim()}
            className={`aabbss text-base sm:text-xl font-bold py-3 px-4 sm:px-8 rounded-lg ml-auto block transition-all duration-200 ${
              isSubmitting || !formData.comment.trim()
                ? "bg-gray-600 text-gray-300 cursor-not-allowed opacity-60"
                : "bg-greencolor text-white hover:bg-greencolor/90 hover:scale-105"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Spinner size="w-4 h-4" className="text-white" />
                Submitting...
              </div>
            ) : (
              "Submit Comment"
            )}
          </button>
        </form>
      </div>
    );
  },
);

export default CommentForm;

