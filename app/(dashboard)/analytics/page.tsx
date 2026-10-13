"use client";

import { useAuth } from "@/lib/providers/auth-provider";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Search, Eye, Heart, Share2, BarChart2, Edit2, ChevronDown, TrendingUp, X
} from "lucide-react";

interface ListingAnalytic {
  id: string;
  title: string;
  businessName?: string;
  status: string;
  viewCount: number;
  likeCount: number;
  shareCount: number;
  createdAt: string;
  publishedAt?: string;
  displayAuthorName?: string;
  category: { name: string; color?: string };
  user: { firstName: string; lastName: string };
  _count: { likes: number; reviews: number; savedBy: number };
}

interface AuthorModalProps {
  listing: ListingAnalytic;
  onClose: () => void;
  onSave: (id: string, name: string) => void;
}

function AuthorModal({ listing, onClose, onSave }: AuthorModalProps) {
  const [name, setName] = useState(listing.displayAuthorName || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await onSave(listing.id, name);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm font-sans">
      <div className="bg-[#18181b] border border-white/10 shadow-2xl rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-lg tracking-tight">Override Author Name</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-md">
            <X size={18} />
          </button>
        </div>
        <p className="text-zinc-400 text-sm mb-4">
          Listing: <span className="text-zinc-200 font-medium">{listing.title}</span>
        </p>
        <p className="text-zinc-500 text-xs mb-3">
          Actual author: {listing.user.firstName} {listing.user.lastName}
        </p>
        <label className="block text-zinc-300 text-sm font-medium mb-2">Display Author Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Leave blank to show actual author"
          className="w-full bg-[#09090b] border border-white/10 rounded-xl px-4 py-2.5 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600 mb-6"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-white/10 text-zinc-300 py-2.5 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-emerald-500 text-[#09090b] py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-400 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

const getCategoryColor = (category: string) => {
  if (category.includes('Agriculture')) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  if (category.includes('Businesses')) return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
  if (category.includes('Tourism')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  if (category.includes('Investment')) return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
  return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
};

export default function ListingAnalytics() {
  const { user, handleApiResponse } = useAuth();
  const [listings, setListings] = useState<ListingAnalytic[]>([]);
  const [total, setTotal] = useState(0);
  const [totals, setTotals] = useState({ views: 0, likes: 0, shares: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("viewCount");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [authorModal, setAuthorModal] = useState<ListingAnalytic | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth-token") || sessionStorage.getItem("auth-token");
      if (!token) return;

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10", // Using 10 to match UI sizing
        sortBy,
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/admin/analytics?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const isValid = await handleApiResponse(response);
      if (!isValid) return;

      const result = await response.json();
      if (result.success) {
        setListings(result.data.listings);
        setTotal(result.data.total);
        setTotalPages(result.data.totalPages);
        setTotals(result.data.totals);
      }
    } catch (error) {
      console.error("Analytics fetch error:", error);
      toast.error("Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchAnalytics();
  }, [user, page, sortBy, searchQuery]);

  const handleAuthorSave = async (id: string, displayAuthorName: string) => {
    try {
      const token = localStorage.getItem("auth-token") || sessionStorage.getItem("auth-token");
      const response = await fetch(`/api/admin/listings/${id}/author`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ displayAuthorName }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Author name updated");
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, displayAuthorName: displayAuthorName || undefined } : l))
        );
      } else {
        toast.error(result.error || "Failed to update author");
      }
    } catch {
      toast.error("Failed to update author");
    }
  };

  const analyticsCards = [
    { id: 1, title: 'Total Views', value: totals.views.toLocaleString(), icon: Eye, color: 'blue' },
    { id: 2, title: 'Total Likes', value: totals.likes.toLocaleString(), icon: Heart, color: 'rose' },
    { id: 3, title: 'Total Shares', value: totals.shares.toLocaleString(), icon: Share2, color: 'purple' },
    { id: 4, title: 'Total Listings', value: total.toLocaleString(), icon: BarChart2, color: 'emerald' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar bg-[#09090b] text-zinc-100 font-sans min-h-screen">
      {authorModal && (
        <AuthorModal
          listing={authorModal}
          onClose={() => setAuthorModal(null)}
          onSave={handleAuthorSave}
        />
      )}

      <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Listing Analytics</h1>
            <p className="text-zinc-400 text-sm mt-1">Track views, likes, shares and manage author display.</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-sm font-medium">
            <TrendingUp size={16} />
            <span>{total} listings tracked</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {analyticsCards.map((card) => {
            const Icon = card.icon;
            const colorMap: Record<string, string> = {
              blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]',
              rose: 'text-rose-400 bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/40 group-hover:shadow-[0_0_20px_rgba(244,63,94,0.1)]',
              purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]',
              emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]',
            };
            
            return (
              <div key={card.id} className="bg-[#18181b] border border-white/5 p-5 sm:p-6 rounded-2xl shadow-xl shadow-black/20 flex flex-col relative overflow-hidden group transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl transition-colors ${colorMap[card.color].split(' group-hover')[0]}`}>
                    <Icon size={20} />
                  </div>
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-1">{card.value}</h3>
                  <p className="text-sm text-zinc-400 font-medium">{card.title}</p>
                </div>
                {/* Decorative bottom glow */}
                <div className={`absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity bg-${card.color}-500/50`} style={{boxShadow: `0 -5px 15px var(--tw-shadow-color)`}}></div>
              </div>
            );
          })}
        </div>

        {/* Table Container Card */}
        <div className="bg-[#18181b] border border-white/5 rounded-2xl shadow-xl shadow-black/20 flex flex-col overflow-hidden">
          
          {/* Table Controls (Search & Sort) */}
          <div className="p-4 sm:p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.01]">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Search listings..." 
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="w-full bg-[#09090b] border border-white/10 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-zinc-200 placeholder:text-zinc-500"
              />
            </div>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                className="appearance-none w-full sm:w-auto flex items-center justify-between gap-3 px-4 py-2.5 pr-10 bg-[#09090b] hover:bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-zinc-300 transition-colors focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                <option value="viewCount">Sort by Views</option>
                <option value="likeCount">Sort by Likes</option>
                <option value="shareCount">Sort by Shares</option>
                <option value="createdAt">Sort by Date</option>
              </select>
              <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          </div>

          {/* Responsive Table Wrapper */}
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="py-4 px-6 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider w-[30%]">Listing</th>
                  <th className="py-4 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Category</th>
                  <th className="py-4 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-center">
                    <span className="flex items-center justify-center gap-1.5"><Eye size={14}/> Views</span>
                  </th>
                  <th className="py-4 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-center">
                    <span className="flex items-center justify-center gap-1.5"><Heart size={14}/> Likes</span>
                  </th>
                  <th className="py-4 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-center">
                    <span className="flex items-center justify-center gap-1.5"><Share2 size={14}/> Shares</span>
                  </th>
                  <th className="py-4 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-center">Saves</th>
                  <th className="py-4 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-center">Reviews</th>
                  <th className="py-4 px-4 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Author Shown</th>
                  <th className="py-4 px-6 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              
              {/* Table Body */}
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5 animate-pulse">
                      {Array.from({ length: 9 }).map((__, j) => (
                        <td key={j} className="py-4 px-4">
                          <div className="h-4 bg-white/5 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : listings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-zinc-500 text-sm">
                      No listings found.
                    </td>
                  </tr>
                ) : (
                  listings.map((listing) => {
                    const authorShown = listing.displayAuthorName || `${listing.user.firstName} ${listing.user.lastName}`;
                    const isCustomAuthor = !!listing.displayAuthorName;

                    return (
                      <tr 
                        key={listing.id} 
                        className="hover:bg-white/[0.02] transition-colors group"
                      >
                        {/* Listing Info */}
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-1.5">
                            <p className="text-sm font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors line-clamp-1 truncate pr-4">
                              {listing.title}
                            </p>
                            <p className="text-xs text-zinc-500">{listing.businessName || "No business name"}</p>
                            <div className="mt-1">
                              {listing.status === 'PUBLISHED' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Published
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                  {listing.status.replace("_", " ")}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-medium border whitespace-nowrap ${getCategoryColor(listing.category.name)}`}>
                            {listing.category.name}
                          </span>
                        </td>

                        {/* Metrics (Views, Likes, Shares) */}
                        <td className="py-4 px-4 text-center">
                          <span className={`text-sm font-semibold ${listing.viewCount > 0 ? 'text-blue-400' : 'text-zinc-500'}`}>
                            {listing.viewCount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`text-sm font-semibold ${listing.likeCount > 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
                            {listing.likeCount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`text-sm font-medium ${listing.shareCount > 0 ? 'text-purple-400' : 'text-zinc-500'}`}>
                            {listing.shareCount.toLocaleString()}
                          </span>
                        </td>

                        {/* Other Metrics (Saves, Reviews) */}
                        <td className="py-4 px-4 text-center">
                          <span className="text-sm text-zinc-400">{listing._count?.savedBy || 0}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="text-sm text-zinc-400">{listing._count?.reviews || 0}</span>
                        </td>

                        {/* Author */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-300">{authorShown}</span>
                            {isCustomAuthor && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Custom
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => setAuthorModal(listing)}
                            className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/10"
                            title="Edit Author"
                          >
                            <Edit2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="p-4 border-t border-white/5 bg-[#09090b] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <span>
              Showing {listings.length} of {total} listings
            </span>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1.5 bg-[#18181b] border border-white/10 rounded-lg text-zinc-300 text-sm disabled:opacity-40 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Previous
                </button>
                <span className="px-2 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1.5 bg-[#18181b] border border-white/10 rounded-lg text-zinc-300 text-sm disabled:opacity-40 hover:bg-white/5 hover:text-white transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Global CSS for custom scrollbar to keep it sleek */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}} />
    </div>
  );
}
