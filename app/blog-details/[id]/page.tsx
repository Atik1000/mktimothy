"use client";

import React, { useState, useEffect } from 'react';
import { 
  Heart, Bookmark, Share2, Calendar, FolderOpen, 
  Star, MoreVertical, MessageCircle, ArrowLeft, 
  Clock
} from 'lucide-react';
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/providers/auth-provider";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import { FullPageLoader } from "@/components/ui/Loader";
import {
  addBlogComment,
  deleteBlogComment,
  editBlogComment,
  fetchBlogById,
  fetchBlogs,
  toggleBlogLike,
  toggleBlogSave,
} from "@/lib/services/blog";
import Link from 'next/link';
import { getTotalStat } from "@/lib/utils/mock-stats";

/**
 * Normalises blog content for rendering.
 *
 * TipTap can store content in several formats depending on how it was entered:
 *   A) Clean HTML:            <h2>My Heading</h2>       → pass-through
 *   B) Heading tag + prefix:  <h2>## My Heading</h2>   → strip the ##
 *   C) Paragraph + markdown:  <p>## My Heading</p>     → convert to <h2>
 *   D) Pure markdown text:    ## My Heading             → convert to <h2>
 *
 * All four passes always run so it handles mixed content correctly.
 */
function markdownToHtml(content: string): string {
  if (!content) return '';

  let html = content;

  // ── Pass A+B: Strip markdown prefixes from inside existing heading tags ──────
  // e.g. <h2>## Actual Heading</h2>  →  <h2>Actual Heading</h2>
  // The `s` flag makes . match newlines; `?` is lazy to avoid runaway matches.
  html = html.replace(/<(h[1-6])([^>]*)>\s*#{1,6}\s*([\s\S]*?)\s*<\/h[1-6]>/gi,
    (_match, tag, attrs, inner) => `<${tag}${attrs}>${inner}</${tag}>`
  );

  // ── Pass C: <p>## text</p>  →  <h2>text</h2> ───────────────────────────────
  html = html
    .replace(/<p([^>]*)>\s*#{6}\s*([\s\S]*?)\s*<\/p>/gi, '<h6>$2</h6>')
    .replace(/<p([^>]*)>\s*#{5}\s*([\s\S]*?)\s*<\/p>/gi, '<h5>$2</h5>')
    .replace(/<p([^>]*)>\s*#{4}\s*([\s\S]*?)\s*<\/p>/gi, '<h4>$2</h4>')
    .replace(/<p([^>]*)>\s*#{3}\s*([\s\S]*?)\s*<\/p>/gi, '<h3>$2</h3>')
    .replace(/<p([^>]*)>\s*#{2}\s*([\s\S]*?)\s*<\/p>/gi, '<h2>$2</h2>')
    .replace(/<p([^>]*)>\s*#([^#][\s\S]*?)\s*<\/p>/gi, '<h1>$2</h1>')
    // Blockquote: <p>&gt; text</p> or <p>> text</p>
    .replace(/<p([^>]*)>\s*(?:&gt;|>)\s*([\s\S]*?)\s*<\/p>/gi, '<blockquote><p>$2</p></blockquote>');

  // ── Pass D: Raw markdown lines (pure markdown or leftover ## after above) ───
  html = html
    .replace(/^#{6}\s+(.+)$/gm, '<h6>$1</h6>')
    .replace(/^#{5}\s+(.+)$/gm, '<h5>$1</h5>')
    .replace(/^#{4}\s+(.+)$/gm, '<h4>$1</h4>')
    .replace(/^#{3}\s+(.+)$/gm, '<h3>$1</h3>')
    .replace(/^#{2}\s+(.+)$/gm, '<h2>$1</h2>')
    .replace(/^#\s+(.+)$/gm, '<h1>$1</h1>')
    .replace(/^>\s+(.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^[-*+]\s+(.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> items in <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`);

  // Wrap bare lines (not block-level tags) in <p> — only for pure-markdown content
  if (!content.trimStart().startsWith('<')) {
    const blockTags = /^<(h[1-6]|ul|ol|li|blockquote|pre|div|article|section)/;
    html = html
      .split('\n')
      .map(line => {
        if (!line.trim()) return '';
        if (blockTags.test(line.trim())) return line;
        return `<p>${line}</p>`;
      })
      .join('\n');
  }

  return html;
}

export default function BlogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [blog, setBlog] = useState<any>(null);
  const [similarBlogs, setSimilarBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchBlogData();
    }
  }, [params.id, user?.id]);

  const fetchBlogData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const blogResult = await fetchBlogById(params.id as string);

      if (blogResult.success) {
        setBlog(blogResult.data);

        if (isAuthenticated && user) {
          const userLiked = blogResult.data.likes?.some(
            (like: any) => like.user.id === user.id,
          );
          const userSaved = blogResult.data.savedBy?.some(
            (save: any) => save.user.id === user.id,
          );
          setIsLiked(userLiked || false);
          setIsSaved(userSaved || false);
        }

        await fetchRelatedContent(blogResult.data);
      } else {
        setError(blogResult.error || "Blog not found");
      }
    } catch (error) {
      console.error("Error fetching blog:", error);
      setError("Failed to load blog");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedContent = async (currentBlog: any) => {
    try {
      const similarBlogsResult = await fetchBlogs(
        {
          status: "PUBLISHED",
          isActive: true,
        },
        1,
        5,
      );

      if (similarBlogsResult.success) {
        const filteredSimilar = similarBlogsResult.data.blogs
          .filter((b: any) => b.id !== currentBlog.id)
          .slice(0, 3);
        setSimilarBlogs(filteredSimilar);
      }
    } catch (error) {
      console.error("Error fetching related content:", error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const previousLiked = isLiked;
    const previousLikeCount = blog?.likeCount || 0;

    setIsLiked(!isLiked);
    if (blog) {
      setBlog({
        ...blog,
        likeCount: !isLiked
          ? previousLikeCount + 1
          : Math.max(previousLikeCount - 1, 0),
      });
    }

    try {
      const result = await toggleBlogLike(params.id as string);

      if (!result.success) {
        setIsLiked(previousLiked);
        if (blog) {
          setBlog({
            ...blog,
            likeCount: previousLikeCount,
          });
        }
      }
    } catch (error) {
      setIsLiked(previousLiked);
      if (blog) {
        setBlog({
          ...blog,
          likeCount: previousLikeCount,
        });
      }
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    const previousSaved = isSaved;
    setIsSaved(!isSaved);

    try {
      const result = await toggleBlogSave(params.id as string);

      if (!result.success) {
        setIsSaved(previousSaved);
      }
    } catch (error) {
      setIsSaved(previousSaved);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: blog?.title,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleCommentSubmit = async () => {
    if (!isAuthenticated || !user) {
      alert("Please login to comment");
      router.push("/login");
      return;
    }

    if (!commentInput.trim()) {
      return;
    }

    setIsSubmittingComment(true);

    try {
      const result = await addBlogComment(
        params.id as string,
        commentInput,
        rating, 
      );

      if (result.success) {
        setCommentInput('');
        setRating(0);
        const updatedBlog = await fetchBlogById(params.id as string);
        if (updatedBlog.success) {
          setBlog(updatedBlog.data);
        }
      } else {
        alert(result.error || "Failed to add comment");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to add comment. Please try again.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (parentId: string) => {
    if (!isAuthenticated || !user) {
      alert("Please login to comment");
      return;
    }
    if (!replyInput.trim()) return;
    try {
      const result = await addBlogComment(
        params.id as string,
        replyInput,
        undefined,
        parentId,
      );
      if (result.success) {
        setReplyingTo(null);
        setReplyInput('');
        const updatedBlog = await fetchBlogById(params.id as string);
        if (updatedBlog.success) {
          setBlog(updatedBlog.data);
        }
      } else {
        alert(result.error || "Failed to submit reply");
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  const handleCommentEdit = async (commentId: string) => {
    if (!isAuthenticated || !user) return;
    if (!editInput.trim()) return;
    try {
      const result = await editBlogComment(
        params.id as string,
        commentId,
        editInput,
      );
      if (result.success) {
        setEditingComment(null);
        setEditInput('');
        const updatedBlog = await fetchBlogById(params.id as string);
        if (updatedBlog.success) {
          setBlog(updatedBlog.data);
        }
      }
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleCommentDelete = async (commentId: string) => {
    if (!isAuthenticated || !user) return;
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const result = await deleteBlogComment(params.id as string, commentId);
      if (result.success) {
        const updatedBlog = await fetchBlogById(params.id as string);
        if (updatedBlog.success) {
          setBlog(updatedBlog.data);
        }
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const renderStars = (count: number, size = 14, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : "button"}
            onClick={() => interactive && setRating(star)}
            onMouseEnter={() => interactive && setHoveredRating(star)}
            onMouseLeave={() => interactive && setHoveredRating(0)}
            className={`${interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}`}
            disabled={!interactive}
          >
            <Star
              size={size}
              className={`
                ${(interactive ? (hoveredRating || rating) >= star : count >= star) 
                  ? 'fill-amber-400 text-amber-400' 
                  : 'text-zinc-600'
                } transition-colors
              `}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return <FullPageLoader variant="bgdark" message="Loading blog details..." />;
  }

  if (error || !blog) {
    return (
      <div className="bg-[#09090b] min-h-screen flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="text-rose-400 text-xl mb-4">
            {error || "Blog not found"}
          </div>
          <button
            onClick={() => router.back()}
            className="bg-emerald-600 text-[#09090b] font-bold px-6 py-2 rounded-lg hover:bg-emerald-500 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const articleData = {
    title: blog.title,
    category: blog.category?.name || "Uncategorized",
    date: new Date(blog.publishedAt || blog.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    readTime: "5 min read",
    likes: getTotalStat(blog.id, blog.likeCount || 0, 'likes'),
    tags: blog.tags?.length > 0 
      ? blog.tags.map((t: any) => typeof t === 'string' ? t : (t.tag?.name || t.name || "")) 
      : ["#blog", `#${blog.category?.slug || "general"}`],
    author: {
      name: blog.displayAuthorName || `${blog.author?.firstName || ""} ${blog.author?.lastName || ""}`.trim() || "Anonymous",
      role: blog.author?.role || "Author",
      avatar: proxiedImageUrl(blog.author?.avatar) || "/images/blogger.png"
    },
    image: proxiedImageUrl(blog.coverImage) || "/images/blogger.png"
  };

  const commentsData = blog.comments?.map((c: any) => ({
    id: c.id,
    userId: c.userId,
    author: `${c.user?.firstName || ""} ${c.user?.lastName || ""}`.trim() || "Anonymous",
    avatar: proxiedImageUrl(c.user?.avatar),
    initial: (c.user?.firstName?.[0] || "A").toUpperCase(),
    bg: "bg-emerald-600",
    date: new Date(c.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    rating: c.rating || 0,
    text: c.content,
    approvalStatus: c.approvalStatus,
    replies: c.replies?.map((r: any) => ({
      id: r.id,
      userId: r.userId,
      author: `${r.user?.firstName || ""} ${r.user?.lastName || ""}`.trim() || "Anonymous",
      avatar: proxiedImageUrl(r.user?.avatar),
      date: new Date(r.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      text: r.content,
      approvalStatus: r.approvalStatus
    })) || []
  })) || [];

  const similarBlogsMapped = similarBlogs.map((b: any) => ({
    id: b.id,
    title: b.title,
    image: proxiedImageUrl(b.coverImage) || "",
    category: b.category?.name || "Blog",
    author: `${b.author?.firstName || ""} ${b.author?.lastName || ""}`.trim() || "Anonymous",
    date: new Date(b.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    views: b.viewCount || 0,
    likes: b.likeCount || 0
  }));

  return (
    <div className="min-h-screen bg-[url('/images/background2.png')] bg-cover bg-center bg-no-repeat bg-fixed text-zinc-200 font-sans selection:bg-emerald-500/30">
      <main className="max-w-[1400px] mx-auto px-4 py-8 lg:py-12 ">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors mb-8 group w-fit mt-20"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Blogs
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16">
          
          {/* Left Column: Article Content */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Article Header */}
            <header className="space-y-6">
              <div className="flex items-center gap-3 text-sm font-medium">
                <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <FolderOpen size={14} />
                  {articleData.category}
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Calendar size={14} />
                  {articleData.date}
                </span>
                <span className="flex items-center gap-1.5 text-zinc-400 hidden sm:flex">
                  <Clock size={14} />
                  {articleData.readTime}
                </span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                {articleData.title}
              </h1>
            </header>

            {/* Featured Image */}
            <div className="w-full aspect-[16/9] bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
              <img 
                src={articleData.image} 
                alt="Featured" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content Body */}
            <article 
              className="prose prose-invert max-w-none prose-lg prose-p:text-zinc-300 prose-p:leading-relaxed prose-headings:text-white prose-a:text-emerald-400"
              dangerouslySetInnerHTML={{ __html: markdownToHtml(blog.content || '') || '<p>No content available.</p>' }}
            />

            {/* Tags & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-y border-white/5">
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {articleData.tags.map((tag: string) => (
                  <span key={tag} className="px-3 py-1 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-sm font-medium transition-colors cursor-pointer border border-white/5">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <button 
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${
                    isLiked 
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
                      : 'bg-[#18181b] text-zinc-400 border-white/5 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Heart size={18} className={isLiked ? 'fill-rose-400' : ''} />
                  <span>{articleData.likes}</span>
                </button>
                <button 
                  onClick={handleSave}
                  className={`p-2.5 rounded-xl transition-all border ${
                    isSaved
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : 'bg-[#18181b] text-zinc-400 border-white/5 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Bookmark size={18} className={isSaved ? 'fill-blue-400' : ''} />
                </button>
                <button 
                  onClick={handleShare}
                  className="p-2.5 rounded-xl bg-[#18181b] text-zinc-400 border border-white/5 hover:bg-white/5 hover:text-white transition-all"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="pt-4">
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                Comments 
                <span className="text-sm font-medium bg-white/10 text-zinc-300 py-0.5 px-2.5 rounded-full">
                  {commentsData.length}
                </span>
              </h3>

              <div className="space-y-8">
                {commentsData.map((comment: any) => (
                  <div key={comment.id} className="flex gap-4">
                    {/* Avatar */}
                    <div className="shrink-0">
                      {comment.avatar ? (
                        <img src={comment.avatar} alt={comment.author} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${comment.bg} shadow-inner`}>
                          {comment.initial}
                        </div>
                      )}
                    </div>
                    
                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      <div className="bg-[#18181b] border border-white/5 rounded-2xl rounded-tl-sm p-4 sm:p-5 relative group">
                        
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-sm font-semibold text-white">{comment.author}</h4>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-zinc-500">{comment.date}</span>
                              {comment.rating > 0 && renderStars(comment.rating, 12)}
                              {comment.approvalStatus !== 'APPROVED' && (
                                <span className="text-[10px] font-semibold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase">
                                  {comment.approvalStatus === 'REJECTED' ? 'Rejected' : 'Pending Approval'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {user?.id === comment.userId && (
                              <button 
                                onClick={() => { setEditingComment(comment.id); setEditInput(comment.text); }}
                                className="text-xs text-zinc-400 hover:text-white"
                              >
                                Edit
                              </button>
                            )}
                            {(user?.id === comment.userId || user?.role === 'ADMIN') && (
                              <button 
                                onClick={() => handleCommentDelete(comment.id)}
                                className="text-xs text-zinc-400 hover:text-rose-400"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Text */}
                        {editingComment === comment.id ? (
                          <div className="mt-2 space-y-2">
                            <textarea 
                              value={editInput}
                              onChange={e => setEditInput(e.target.value)}
                              className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-sm text-zinc-200"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handleCommentEdit(comment.id)} className="text-xs bg-emerald-600 text-white px-3 py-1 rounded">Save</button>
                              <button onClick={() => setEditingComment(null)} className="text-xs bg-white/10 text-white px-3 py-1 rounded">Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[15px] text-zinc-300 leading-relaxed">
                            {comment.text}
                          </p>
                        )}
                        
                        {/* Action */}
                        <div className="mt-3">
                          <button 
                            onClick={() => { setReplyingTo(comment.id); setReplyInput(''); }}
                            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            Reply
                          </button>
                        </div>
                        {replyingTo === comment.id && (
                          <div className="mt-3 space-y-2">
                            <textarea 
                              value={replyInput}
                              onChange={e => setReplyInput(e.target.value)}
                              placeholder="Write a reply..."
                              className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-sm text-zinc-200"
                            />
                            <div className="flex gap-2">
                              <button onClick={() => handleReplySubmit(comment.id)} className="text-xs bg-emerald-600 text-white px-3 py-1 rounded">Submit</button>
                              <button onClick={() => setReplyingTo(null)} className="text-xs bg-white/10 text-white px-3 py-1 rounded">Cancel</button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Replies */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-4 pl-4 sm:pl-6 space-y-4 border-l-2 border-white/5">
                          {comment.replies.map((reply: any) => (
                            <div key={reply.id} className="flex gap-3">
                              {reply.avatar ? (
                                <img src={reply.avatar} alt={reply.author} className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs bg-zinc-700 shadow-inner shrink-0">
                                  {reply.author[0]?.toUpperCase()}
                                </div>
                              )}
                              <div className="flex-1 bg-[#18181b]/50 border border-white/5 rounded-2xl rounded-tl-sm p-4 group">
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-semibold text-white">{reply.author}</h4>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-zinc-500">{reply.date}</span>
                                    {reply.approvalStatus !== 'APPROVED' && (
                                      <span className="text-[10px] font-semibold tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 uppercase">
                                        {reply.approvalStatus === 'REJECTED' ? 'Rejected' : 'Pending Approval'}
                                      </span>
                                    )}
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {user?.id === reply.userId && (
                                        <button 
                                          onClick={() => { setEditingComment(reply.id); setEditInput(reply.text); }}
                                          className="text-xs text-zinc-400 hover:text-white"
                                        >
                                          Edit
                                        </button>
                                      )}
                                      {(user?.id === reply.userId || user?.role === 'ADMIN') && (
                                        <button 
                                          onClick={() => handleCommentDelete(reply.id)}
                                          className="text-xs text-zinc-400 hover:text-rose-400"
                                        >
                                          Delete
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {editingComment === reply.id ? (
                                  <div className="mt-2 space-y-2">
                                    <textarea 
                                      value={editInput}
                                      onChange={e => setEditInput(e.target.value)}
                                      className="w-full bg-[#09090b] border border-white/10 rounded-lg p-3 text-sm text-zinc-200"
                                    />
                                    <div className="flex gap-2">
                                      <button onClick={() => handleCommentEdit(reply.id)} className="text-xs bg-emerald-600 text-white px-3 py-1 rounded">Save</button>
                                      <button onClick={() => setEditingComment(null)} className="text-xs bg-white/10 text-white px-3 py-1 rounded">Cancel</button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[14px] text-zinc-300 leading-relaxed">
                                    {reply.text}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              
              {/* Author Card */}
              <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">Written By</p>
                <img 
                  src={articleData.author.avatar} 
                  alt={articleData.author.name} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/10 shadow-lg mb-4"
                />
                <h3 className="text-lg font-bold text-white">{articleData.author.name}</h3>
                <p className="text-sm text-emerald-400 mt-1">{articleData.author.role}</p>
                <Link href={`/profile/${blog?.author?.id || '#'}`} className="w-full">
                  <button className="w-full mt-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-semibold transition-all">
                    View Profile
                  </button>
                </Link>
              </div>

              {/* Add Comment Card */}
              <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <MessageCircle size={18} className="text-emerald-400" />
                  Leave a Comment
                </h3>
                <div className="space-y-4">
                  <textarea 
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Share your thoughts here..." 
                    className="w-full h-32 bg-[#09090b] border border-white/10 rounded-xl p-4 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"
                  ></textarea>
                  <button 
                    onClick={handleCommentSubmit}
                    disabled={!commentInput.trim() || isSubmittingComment}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${
                      commentInput.trim() && !isSubmittingComment
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20 active:scale-[0.98]' 
                        : 'bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {isSubmittingComment ? "Submitting..." : "Submit Comment"}
                  </button>
                </div>
              </div>

              {/* Rating Card */}
              <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center">
                <h3 className="text-[15px] font-bold text-white mb-4">Find this article useful?</h3>
                <div className="p-4 bg-[#09090b] rounded-xl border border-white/5 inline-block">
                  {renderStars(0, 28, true)}
                </div>
                {rating > 0 && (
                  <p className="text-sm text-emerald-400 font-medium mt-3 animate-in fade-in zoom-in duration-300">
                    Thanks for your {rating}-star rating!
                  </p>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Similar Blogs Section */}
        {similarBlogsMapped.length > 0 && (
          <div className="mt-20 pt-12 border-t border-white/5">
            <h2 className="text-2xl font-bold text-white mb-8">Similar Blogs</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarBlogsMapped.map((similarBlog) => (
                <Link key={similarBlog.id} href={`/blog-details/${similarBlog.id}`}>
                  <div className="bg-[#18181b] border border-white/5 rounded-2xl overflow-hidden shadow-xl group hover:border-white/10 transition-colors flex flex-col h-full cursor-pointer">
                    <div className="relative h-48 overflow-hidden bg-zinc-900 shrink-0">
                      <img 
                        src={similarBlog.image} 
                        alt={similarBlog.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 bg-emerald-500 text-white rounded-md text-[10px] font-bold tracking-wider uppercase shadow-md">
                          Published
                        </span>
                        <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md border border-white/10 text-white rounded-md text-[10px] font-bold tracking-wider shadow-md">
                          {similarBlog.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="text-lg font-bold text-white mb-3 leading-tight group-hover:text-emerald-400 transition-colors line-clamp-2">
                        {similarBlog.title}
                      </h3>
                      
                      <div className="flex items-center justify-between text-xs text-zinc-400 mb-6 mt-auto">
                        <div className="flex items-center gap-1.5">
                          <span className="text-zinc-300 font-medium">{similarBlog.author}</span>
                        </div>
                        <span>{similarBlog.date}</span>
                      </div>

                      <div className="flex items-center gap-4 pt-4 border-t border-white/5 text-zinc-500 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <Star size={14} className="fill-amber-400/20 text-amber-400" />
                          <span className="text-xs font-medium text-zinc-300">4.8</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/10"></div>
                        <div className="flex items-center gap-1.5">
                          <Heart size={14} />
                          <span className="text-xs font-medium">{similarBlog.likes}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>
      </div>
  );
}
