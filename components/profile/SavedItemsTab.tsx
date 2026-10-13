"use client";

import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  Bookmark, FileText, LayoutGrid, Clock, Heart, MessageCircle, MapPin, 
  Search, Eye, User as UserIcon, Grid, Calendar
} from "lucide-react";

// Define interfaces for the data
interface SavedBlog {
  id: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  createdAt: string;
  publishedAt?: string;
  viewCount: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  _count: {
    likes: number;
    comments: number;
    savedBy: number;
  };
}

interface SavedListing {
  id: string;
  title: string;
  description: string;
  city?: string;
  state?: string;
  country?: string;
  images?: string[];
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
  _count: {
    likes: number;
    reviews: number;
  };
}

const SavedItemsTab = () => {
  const [activeTab, setActiveTab] = useState<"listings" | "blogs">("listings");
  const [savedBlogs, setSavedBlogs] = useState<SavedBlog[]>([]);
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true);
  const [isLoadingListings, setIsLoadingListings] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchSavedBlogs = async () => {
    setIsLoadingBlogs(true);
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      const response = await fetch("/api/users/saved/blogs", {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSavedBlogs(result.data.savedBlogs);
        }
      }
    } catch (error) {
      console.error("Error fetching saved blogs:", error);
    } finally {
      setIsLoadingBlogs(false);
    }
  };

  const fetchSavedListings = async () => {
    setIsLoadingListings(true);
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      const response = await fetch("/api/users/saved/listings", {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSavedListings(result.data.savedListings);
        }
      }
    } catch (error) {
      console.error("Error fetching saved listings:", error);
    } finally {
      setIsLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchSavedBlogs();
    fetchSavedListings();
  }, []);

  const filteredBlogs = savedBlogs.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredListings = savedListings.filter((l) =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const metrics = [
    { id: 1, title: 'Total Saved Items', value: (savedBlogs.length + savedListings.length).toString(), icon: Bookmark, color: 'emerald' },
    { id: 2, title: 'Saved Listings', value: savedListings.length.toString(), icon: LayoutGrid, color: 'blue' },
    { id: 3, title: 'Saved Blogs', value: savedBlogs.length.toString(), icon: FileText, color: 'purple' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex w-full h-full text-white">
      <div className="w-full space-y-6 sm:space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col gap-2 mb-8 mt-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Bookmark size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Saved Items</h1>
          </div>
          <p className="text-zinc-400 text-sm ml-11">Quick access to all your saved listings and blog posts.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const colorMap: Record<string, string> = {
              emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40',
              blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40',
              purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40',
            };
            
            return (
              <div key={metric.id} className="bg-[#18181b] border border-white/5 p-5 sm:p-6 rounded-2xl shadow-xl shadow-black/20 flex flex-col relative overflow-hidden group transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-colors ${colorMap[metric.color].split(' group-hover')[0]}`}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 font-medium mb-1">{metric.title}</p>
                    <h3 className={`text-2xl font-bold ${colorMap[metric.color].split(' ')[0]}`}>{metric.value}</h3>
                  </div>
                </div>
                <div className={`absolute bottom-0 left-0 w-full h-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-${metric.color}-500/50`}></div>
              </div>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="bg-[#18181b] border border-white/5 rounded-2xl shadow-xl shadow-black/20 overflow-hidden flex flex-col min-h-[500px]">
          
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-b border-white/5 bg-white/[0.01]">
            <div className="flex items-center w-full sm:w-auto">
              <button 
                onClick={() => setActiveTab('listings')}
                className={`flex-1 sm:flex-none px-6 py-4 text-sm font-semibold transition-all relative ${
                  activeTab === 'listings' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Saved Listings
                {activeTab === 'listings' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />
                )}
              </button>
              <button 
                onClick={() => setActiveTab('blogs')}
                className={`flex-1 sm:flex-none px-6 py-4 text-sm font-semibold transition-all relative ${
                  activeTab === 'blogs' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Saved Blogs
                {activeTab === 'blogs' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />
                )}
              </button>
            </div>
            
            <div className="p-3 w-full sm:w-auto sm:border-l border-white/5">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Search saved items..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#09090b] border border-white/10 text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-zinc-200 placeholder:text-zinc-500"
                />
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 sm:p-6 bg-[#09090b]/50 flex-1">
            
            {/* LISTINGS TAB */}
            {activeTab === "listings" && (
              isLoadingListings ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                  <p className="text-zinc-500 text-sm font-medium animate-pulse">Loading saved listings...</p>
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <LayoutGrid className="w-12 h-12 text-zinc-600 mb-3" />
                  <p className="text-zinc-400 font-medium">No saved listings found.</p>
                  <p className="text-zinc-600 text-sm mt-1">Items you save will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredListings.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/project/${listing.id}`}
                      className="group flex flex-col sm:flex-row gap-4 sm:gap-6 bg-[#09090b] border border-white/5 hover:border-emerald-500/30 rounded-2xl p-3 sm:p-4 transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="w-full sm:w-64 h-48 sm:h-auto shrink-0 relative rounded-xl overflow-hidden">
                        <Image
                          src={proxiedImageUrl(listing.images?.[0] || "/images/sp1.png")}
                          alt={listing.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 flex flex-col py-2">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-lg sm:text-xl font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors line-clamp-2">
                            {listing.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                          <MapPin size={14} className="text-emerald-500" />
                          <span>{[listing.city, listing.state, listing.country].filter(Boolean).join(", ")}</span>
                        </div>

                        <p className="text-sm text-zinc-500 line-clamp-2 sm:line-clamp-3 mb-6">
                          {listing.description}
                        </p>

                        <div className="mt-auto flex flex-wrap items-center gap-4 sm:gap-6 border-t border-white/5 pt-4">
                          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                            <Clock size={16} className="text-zinc-500" />
                            {formatDate(listing.createdAt)}
                          </div>
                          <div className="w-1 h-1 rounded-full bg-zinc-700 hidden sm:block"></div>
                          <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                            <Grid size={16} className="text-blue-500" />
                            {listing.category.name}
                          </div>
                          <div className="w-1 h-1 rounded-full bg-zinc-700 hidden sm:block"></div>
                          <div className="flex items-center gap-2 text-sm font-medium text-rose-400">
                            <Heart size={16} />
                            {listing._count.likes}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}

            {/* BLOGS TAB */}
            {activeTab === "blogs" && (
              isLoadingBlogs ? (
                <div className="h-64 flex flex-col items-center justify-center space-y-4">
                  <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                  <p className="text-zinc-500 text-sm font-medium animate-pulse">Loading saved blogs...</p>
                </div>
              ) : filteredBlogs.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center">
                  <FileText className="w-12 h-12 text-zinc-600 mb-3" />
                  <p className="text-zinc-400 font-medium">No saved blogs found.</p>
                  <p className="text-zinc-600 text-sm mt-1">Articles you save will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBlogs.map((blog) => (
                    <Link
                      key={blog.id}
                      href={`/blog-details/${blog.id}`}
                      className="group flex flex-col bg-[#09090b] border border-white/5 hover:border-purple-500/30 rounded-2xl overflow-hidden transition-all duration-300"
                    >
                      <div className="h-48 relative overflow-hidden">
                        {blog.coverImage ? (
                          <Image
                            src={proxiedImageUrl(blog.coverImage)}
                            alt={blog.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 flex items-center justify-center">
                            <span className="text-white font-bold text-3xl opacity-50">{blog.title.charAt(0)}</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-lg text-xs font-medium border border-white/10">
                          {blog.category.name}
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-3 mb-3 text-xs text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <UserIcon size={12} />
                            {blog.author.firstName} {blog.author.lastName}
                          </div>
                          <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} />
                            {formatDate(blog.publishedAt || blog.createdAt)}
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-zinc-100 group-hover:text-purple-400 transition-colors line-clamp-2 mb-2">
                          {blog.title}
                        </h3>

                        <p className="text-sm text-zinc-500 line-clamp-2 mb-4 flex-1">
                          {blog.excerpt}
                        </p>

                        <div className="flex items-center justify-between text-xs text-zinc-400 border-t border-white/5 pt-4 mt-auto">
                          <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                            <Eye size={14} /> {blog.viewCount || 0}
                          </div>
                          <div className="flex items-center gap-1.5 hover:text-rose-400 transition-colors">
                            <Heart size={14} /> {blog._count.likes}
                          </div>
                          <div className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                            <MessageCircle size={14} /> {blog._count.comments}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}

          </div>
        </div>

      </div>

      {/* Global CSS for custom scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}} />
    </div>
  );
};

export default SavedItemsTab;
