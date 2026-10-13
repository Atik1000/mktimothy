"use client";

import { useAuth } from "@/lib/providers/auth-provider";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaStar } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

interface PendingComment {
  id: string;
  content: string;
  user: { firstName: string; lastName: string; email: string };
  blog: { id: string; title: string };
  createdAt: string;
  parentId?: string | null;
  parent?: { user: { firstName: string; lastName: string } } | null;
}

interface PendingReview {
  id: string;
  content: string;
  rating: number;
  user: { firstName: string; lastName: string; email: string };
  listing: { id: string; title: string };
  createdAt: string;
}

export default function CommentsPage() {
  const { user: currentUser } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("comments");
  const [comments, setComments] = useState<PendingComment[]>([]);
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (
      currentUser?.role === "MODERATOR" &&
      !currentUser.subAdminPermissions?.includes("manage-content")
    ) {
      toast.error("You do not have permission to access this page");
      router.push("/dashboard");
      return;
    }

    if (currentUser) {
      fetchPendingContent();
    }
  }, [currentUser, router]);

  const fetchPendingContent = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/pending-content?type=all");
      const result = await res.json();
      if (result.success) {
        setComments(result.data.comments || []);
        setReviews(result.data.reviews || []);
      }
    } catch (error) {
      console.error("Failed to fetch pending content:", error);
      toast.error("Failed to fetch pending comments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, type: "comment" | "review", action: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/admin/approve-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, action }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`${type === 'comment' ? 'Comment' : 'Review'} has been ${action.toLowerCase()}`);
        if (type === "comment") {
          setComments((prev) => prev.filter((c) => c.id !== id));
        } else if (type === "review") {
          setReviews((prev) => prev.filter((r) => r.id !== id));
        }
      } else {
        toast.error(result.error || "Failed to process action");
      }
    } catch (error) {
      console.error("Error performing action:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar bg-[#09090b] text-zinc-100 min-h-[calc(100vh-64px)] font-sans">
      <div className="max-w-[1400px] mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Content Approvals</h1>

        <div className="bg-[#18181b] border border-white/5 rounded-2xl shadow-xl flex flex-col overflow-hidden">
          
          {/* Tabs */}
          <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex items-center p-1 bg-[#09090b] border border-white/5 rounded-xl self-start">
              <button 
                onClick={() => setActiveTab('comments')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'comments' 
                    ? 'bg-zinc-800 text-emerald-400 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Comments ({comments.length})
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'reviews' 
                    ? 'bg-zinc-800 text-yellow-400 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Reviews ({reviews.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar min-h-[400px]">
             {isLoading ? (
               <div className="flex items-center justify-center h-64 text-zinc-500">Loading...</div>
             ) : activeTab === 'comments' ? (
                // Comments Table
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#09090b] border-b border-white/5 text-zinc-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold">User</th>
                      <th className="px-6 py-4 font-semibold">Content</th>
                      <th className="px-6 py-4 font-semibold">Blog Post</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {comments.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No pending comments</td></tr>
                    ) : comments.map(comment => (
                      <tr key={comment.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{comment.user.firstName} {comment.user.lastName}</div>
                          <div className="text-xs text-zinc-500">{comment.user.email}</div>
                        </td>
                        <td className="px-6 py-4 max-w-[300px] whitespace-normal">
                          {comment.parent && (
                            <span className="text-emerald-400 text-xs font-medium block mb-1">
                              Reply to {comment.parent.user.firstName}
                            </span>
                          )}
                          <p className="text-zinc-300 text-sm line-clamp-2">"{comment.content}"</p>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/blog-details/${comment.blog.id}`} target="_blank" className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                            <span className="truncate max-w-[150px]">{comment.blog.title}</span>
                            <ExternalLink size={14} />
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-zinc-400">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleAction(comment.id, "comment", "APPROVED")} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Approve">
                              <CheckCircle2 size={18} />
                            </button>
                            <button onClick={() => handleAction(comment.id, "comment", "REJECTED")} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors" title="Reject">
                              <XCircle size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             ) : (
                // Reviews Table
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#09090b] border-b border-white/5 text-zinc-400">
                    <tr>
                      <th className="px-6 py-4 font-semibold">User</th>
                      <th className="px-6 py-4 font-semibold">Review</th>
                      <th className="px-6 py-4 font-semibold">Listing</th>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reviews.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No pending reviews</td></tr>
                    ) : reviews.map(review => (
                      <tr key={review.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-white">{review.user.firstName} {review.user.lastName}</div>
                          <div className="text-xs text-zinc-500">{review.user.email}</div>
                        </td>
                        <td className="px-6 py-4 max-w-[300px] whitespace-normal">
                          <div className="flex items-center gap-1 text-yellow-400 mb-1">
                            {[...Array(review.rating)].map((_, i) => <FaStar key={i} size={12} />)}
                          </div>
                          <p className="text-zinc-300 text-sm line-clamp-2">"{review.content}"</p>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/listing/${review.listing?.id}`} target="_blank" className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                            <span className="truncate max-w-[150px]">{review.listing?.title || "Listing"}</span>
                            <ExternalLink size={14} />
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-zinc-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleAction(review.id, "review", "APPROVED")} className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors" title="Approve">
                              <CheckCircle2 size={18} />
                            </button>
                            <button onClick={() => handleAction(review.id, "review", "REJECTED")} className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors" title="Reject">
                              <XCircle size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
