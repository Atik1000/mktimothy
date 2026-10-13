"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Share2,
  Heart,
  Bookmark,
  MessageSquare,
  MapPin,
  Globe,
  Briefcase,
  Layers,
  Building2,
  ChevronRight,
  CheckCircle2,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import RelatedPosts from "@/components/shared/RelatedPosts";
import { ConnectToContinueModal } from "@/components/globals/ConnectToContinueModal";
import SocialShare from "@/components/shared/SocialShare";
import { FullPageLoader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/providers/auth-provider";
import { fetchBlogs } from "@/lib/services/blog";
import { fetchListings } from "@/lib/services/listing";

interface ListingData {
  id: string;
  title: string;
  description: string;
  content?: string;
  businessName?: string;
  businessType?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  images: string[];
  price?: number;
  priceType?: string;
  currency: string;
  status: string;
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
  viewCount: number;
  likeCount: number;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
    phone?: string;
    location?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color?: string;
  };
  sector: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
  };
  _count: {
    likes: number;
    reviews: number;
    savedBy: number;
  };
  displayAuthorName?: string;
  meta?: { metaKey: string; metaValue: string }[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState<ListingData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auth Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState("");

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/listings/${params.id}`);
        const result = await response.json();

        if (result.success) {
          setListing(result.data);
          if (isAuthenticated && result.data.likes) {
            setIsLiked(
              result.data.likes.some((like: any) => like.user.id === user?.id),
            );
          }
          if (isAuthenticated && result.data.savedBy) {
            setIsSaved(
              result.data.savedBy.some(
                (save: any) => save.user.id === user?.id,
              ),
            );
          }
          await fetchRelatedContent(result.data);
        } else {
          setError(result.error || "Failed to fetch listing");
        }
      } catch (err) {
        setError("Network error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchListing();
    }
  }, [params.id, user?.id, isAuthenticated]);

  const fetchRelatedContent = async (currentListing: ListingData) => {
    try {
      const [relatedListingsResult, relatedBlogsResult] = await Promise.all([
        fetchListings(
          {
            categoryId: currentListing.category.id,
            status: "ACTIVE",
            isActive: true,
          },
          1,
          4,
        ),
        fetchBlogs(
          {
            categoryId: currentListing.category.id,
            status: "PUBLISHED",
            isActive: true,
          },
          1,
          4,
        ),
      ]);

      let combinedRelated: any[] = [];

      if (relatedListingsResult.success) {
        const filteredListings = relatedListingsResult.data.listings
          .filter((listing: any) => listing.id !== currentListing.id)
          .slice(0, 3)
          .map((listing: any) => ({
            id: listing.id,
            title: listing.title,
            description: listing.description,
            image: listing.images?.[0],
            link: `/project/${listing.id}`,
            type: "listing" as const,
            category: listing.category,
            sector: listing.sector,
            user: listing.user,
            stats: {
              likeCount: listing.likeCount || 0,
              viewCount: listing.viewCount || 0,
            },
            price: listing.price,
            currency: listing.currency,
            createdAt: listing.createdAt,
            isFeatured: listing.isFeatured,
          }));
        combinedRelated = [...combinedRelated, ...filteredListings];
      }

      if (relatedBlogsResult.success) {
        const relatedBlogsMapped = relatedBlogsResult.data.blogs
          .slice(0, 3)
          .map((blog: any) => ({
            id: blog.id,
            title: blog.title,
            excerpt: blog.excerpt,
            coverImage: blog.coverImage,
            link: `/blog-details/${blog.id}`,
            type: "blog" as const,
            category: blog.category,
            tags: blog.tags,
            author: blog.author,
            stats: {
              likeCount: blog.likeCount || 0,
              viewCount: blog.viewCount || 0,
              comments: blog._count?.comments || 0,
            },
            createdAt: blog.createdAt,
            publishedAt: blog.publishedAt,
            isFeatured: blog.isFeatured,
          }));
        combinedRelated = [...combinedRelated, ...relatedBlogsMapped];
      }

      const shuffled = combinedRelated
        .sort(() => Math.random() - 0.5)
        .slice(0, 6);
      setRelatedPosts(shuffled);
    } catch (error) {
      console.error("Error fetching related content:", error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      setAuthModalMessage("You need to sign up to like projects.");
      setShowAuthModal(true);
      return;
    }
    const previousLiked = isLiked;
    const previousLikeCount = listing?.likeCount || 0;
    setIsLiked(!isLiked);
    if (listing) {
      setListing({
        ...listing,
        likeCount: !isLiked
          ? previousLikeCount + 1
          : Math.max(previousLikeCount - 1, 0),
      });
    }
    try {
      const response = await fetch(`/api/listings/${params.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token") || sessionStorage.getItem("auth-token")}`,
        },
      });
      const result = await response.json();
      if (!result.success) {
        setIsLiked(previousLiked);
        if (listing) setListing({ ...listing, likeCount: previousLikeCount });
      }
    } catch (error) {
      setIsLiked(previousLiked);
      if (listing) setListing({ ...listing, likeCount: previousLikeCount });
    }
  };

  const handleSave = async () => {
    if (!isAuthenticated) {
      setAuthModalMessage("You need to sign up to save projects.");
      setShowAuthModal(true);
      return;
    }
    const previousSaved = isSaved;
    setIsSaved(!isSaved);
    try {
      const response = await fetch(`/api/listings/${params.id}/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token") || sessionStorage.getItem("auth-token")}`,
        },
      });
      const result = await response.json();
      if (!result.success) {
        setIsSaved(previousSaved);
      }
    } catch (error) {
      setIsSaved(previousSaved);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const formatPrice = (price: number, currency: string, priceType?: string) => {
    const formattedPrice = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
    }).format(price);

    if (priceType) {
      return `${formattedPrice}/${priceType}`;
    }
    return formattedPrice;
  };

  if (isLoading) {
    return (
      <FullPageLoader variant="bgdark" message="Loading project details..." />
    );
  }

  if (error || !listing) {
    return (
      <div className="bg-[url('/images/background2.png')] bg-cover bg-center bg-no-repeat bg-fixed min-h-screen flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="text-rose-400 text-xl mb-4">
            {error || "Listing not found"}
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

  const keyDetails = [];
  if (listing.city || listing.country) {
    keyDetails.push({
      label: "Location",
      value: [listing.city, listing.state, listing.country]
        .filter(Boolean)
        .join(", "),
      icon: MapPin,
    });
  }
  if (listing.sector) {
    keyDetails.push({
      label: "Sector",
      value: listing.sector.name,
      icon: Layers,
    });
  }
  if (listing.category) {
    keyDetails.push({
      label: "Category",
      value: listing.category.name,
      icon: Briefcase,
    });
  }
  if (listing.website) {
    keyDetails.push({
      label: "Website",
      value: listing.website,
      icon: Globe,
      isLink: true,
    });
  }
  if (listing.businessType) {
    keyDetails.push({
      label: "Business Type",
      value: listing.businessType,
      icon: Building2,
    });
  }
  listing.meta?.forEach((m) => {
    const displayKey = m.metaKey
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
    keyDetails.push({
      label: displayKey,
      value: m.metaValue,
      icon: CheckCircle2,
    });
  });

  return (
    <div className="min-h-screen bg-[url('/images/background2.png')] bg-cover bg-center bg-no-repeat bg-fixed text-zinc-200 font-sans selection:bg-emerald-500/30">
      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Breadcrumb & Back */}
        <div className="flex items-center justify-between mb-8 mt-12 md:mt-24">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Listings
          </button>

          <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-500">
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">
              Home
            </span>
            <ChevronRight size={14} />
            <span className="hover:text-zinc-300 cursor-pointer transition-colors">
              {listing.category.name}
            </span>
            <ChevronRight size={14} />
            <span className="text-emerald-400 truncate max-w-[200px]">
              {listing.title}
            </span>
          </div>
        </div>

        {/* Modern Bento Image Gallery */}
        {listing.images && listing.images.length > 0 && (
          <div
            className={`grid grid-cols-1 ${listing.images.length > 1 ? "md:grid-cols-4 md:grid-rows-2" : ""} gap-3 sm:gap-4 h-[350px] sm:h-[400px] md:h-[500px] mb-10 sm:mb-12`}
          >
            {/* Main Feature Image */}
            <div
              onClick={() => {
                setCurrentImageIndex(0);
                setShowGallery(true);
              }}
              className={`${listing.images.length > 1 ? "md:col-span-2 md:row-span-2" : "col-span-1"} rounded-2xl sm:rounded-3xl overflow-hidden relative group cursor-pointer`}
            >
              <img
                src={proxiedImageUrl(listing.images[0])}
                alt="Main view"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* Secondary Images */}
            {listing.images[1] && (
              <div
                onClick={() => {
                  setCurrentImageIndex(1);
                  setShowGallery(true);
                }}
                className="hidden md:block rounded-3xl overflow-hidden relative group cursor-pointer"
              >
                <img
                  src={proxiedImageUrl(listing.images[1])}
                  alt="View 2"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            )}
            {listing.images[2] && (
              <div
                onClick={() => {
                  setCurrentImageIndex(2);
                  setShowGallery(true);
                }}
                className="hidden md:block rounded-3xl overflow-hidden relative group cursor-pointer"
              >
                <img
                  src={proxiedImageUrl(listing.images[2])}
                  alt="View 3"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            )}
            {listing.images[3] && (
              <div
                onClick={() => {
                  setCurrentImageIndex(3);
                  setShowGallery(true);
                }}
                className={`hidden md:block ${listing.images.length > 3 ? "md:col-span-2" : ""} rounded-3xl overflow-hidden relative group cursor-pointer`}
              >
                <img
                  src={proxiedImageUrl(listing.images[3])}
                  alt="View 4"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* View All Photos Overlay */}
                {listing.images.length > 4 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(0);
                      setShowGallery(true);
                    }}
                    className="absolute bottom-4 right-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-lg"
                  >
                    View all {listing.images.length} photos
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16">
          {/* Left Column: Details & Description */}
          <div className="lg:col-span-8 space-y-10 sm:space-y-12">
            {/* Title & Badges */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-bold tracking-wider uppercase">
                  Published
                </span>
                <span className="px-3 py-1 bg-white/5 text-zinc-300 border border-white/10 rounded-full text-xs font-bold tracking-wider uppercase">
                  {listing.category?.name || "Project"}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
                {listing.title}
              </h1>
            </div>

            {/* Description */}
            <section className="space-y-5">
              <h3 className="text-xl font-bold text-white tracking-tight">
                About this opportunity
              </h3>
              <p className="text-[15px] sm:text-base text-zinc-400 leading-relaxed">
                {listing.description}
              </p>

              {listing.content && (
                <div
                  className="mt-6 prose prose-invert max-w-none prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:text-[15px] sm:prose-p:text-base prose-headings:text-white prose-a:text-emerald-400"
                  dangerouslySetInnerHTML={{ __html: listing.content }}
                />
              )}
            </section>

            {/* Divider */}
            <div className="w-full h-px bg-white/5"></div>

            {/* Key Details Grid */}
            <section className="space-y-6">
              <h3 className="text-xl font-bold text-white tracking-tight">
                Key Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {keyDetails.map((detail, index) => {
                  const Icon = detail.icon || CheckCircle2;
                  return (
                    <div
                      key={index}
                      className="bg-[#18181b] border border-white/5 p-4 rounded-2xl flex items-start gap-3 hover:border-white/10 transition-colors group"
                    >
                      <div className="p-2 bg-white/5 rounded-lg text-zinc-400 group-hover:text-emerald-400 transition-colors shrink-0">
                        <Icon size={18} />
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">
                          {detail.label}
                        </p>
                        {detail.isLink ? (
                          <a
                            href={detail.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-emerald-400 hover:text-emerald-300 hover:underline transition-all"
                          >
                            Visit Website
                          </a>
                        ) : (
                          <p className="text-sm font-medium text-zinc-200">
                            {detail.value}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Column: Sticky Sidebar Area */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              {/* Primary Action Card (Price & Message) */}
              <div className="bg-[#18181b] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
                <p className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Listing Price
                </p>
                <div className="flex items-baseline gap-2 mb-8">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                    {listing.price
                      ? formatPrice(listing.price, listing.currency)
                      : "Price on Request"}
                  </h2>
                  {listing.priceType && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                      {listing.priceType}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={async () => {
                      if (!isAuthenticated || !user) {
                        setAuthModalMessage(
                          "You need to sign up to contact the business.",
                        );
                        setShowAuthModal(true);
                        return;
                      }
                      // Don't let an owner message their own listing.
                      if (listing.user && user.id === listing.user.id) {
                        toast.error("This is your own listing.");
                        return;
                      }
                      try {
                        toast.loading("Opening conversation...", {
                          id: "open-chat",
                        });
                        const res = await fetch("/api/chat/rooms", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            targetUserId: listing.user?.id,
                          }),
                        });
                        const data = await res.json();
                        toast.dismiss("open-chat");
                        if (data.success) {
                          router.push(`/messages?room=${data.room.id}`);
                        } else {
                          toast.error(data.error || "Could not open chat");
                        }
                      } catch (e) {
                        toast.dismiss("open-chat");
                        toast.error("Could not open chat");
                      }
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 px-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={18} />
                    Message Business
                  </button>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={handleLike}
                      className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border transition-all ${
                        isLiked
                          ? "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          : "bg-[#09090b] border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Heart
                        size={18}
                        className={isLiked ? "fill-rose-400" : ""}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {isLiked ? "Liked" : "Like"}
                      </span>
                    </button>

                    <button
                      onClick={handleSave}
                      className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl border transition-all ${
                        isSaved
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          : "bg-[#09090b] border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Bookmark
                        size={18}
                        className={isSaved ? "fill-blue-400" : ""}
                      />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {isSaved ? "Saved" : "Save"}
                      </span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex flex-col items-center justify-center gap-1.5 py-3 rounded-2xl bg-[#09090b] border border-white/5 text-zinc-400 hover:bg-white/5 hover:text-white transition-all"
                    >
                      <Share2 size={18} />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        Share
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Business Owner Card — logged-out visitors get the same
                  "Connect to continue" popup as the Message Business button */}
              {listing.user && (
                <Link
                  href={`/profile/${listing.user.id}`}
                  onClick={(e) => {
                    if (!isAuthenticated || !user) {
                      e.preventDefault();
                      setShowAuthModal(true);
                    }
                  }}
                  className="bg-[#18181b] border border-white/5 rounded-3xl p-6 shadow-xl flex items-center justify-between group cursor-pointer hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={
                          listing.user.avatar
                            ? proxiedImageUrl(listing.user.avatar)
                            : "/images/blogger.png"
                        }
                        alt={listing.user.firstName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/10"
                      />
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#18181b] rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-0.5">
                        Business Owner
                      </p>
                      <h4 className="text-[15px] font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {listing.displayAuthorName ||
                          `${listing.user.firstName}`}
                      </h4>
                    </div>
                  </div>
                  
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="mt-12 pt-12 border-t border-white/50">
          <RelatedPosts
            posts={relatedPosts}
            title="Related Content"
            type="mixed"
            maxPosts={6}
            showStats={true}
            layout="grid"
          />
        </div>
      )}

      {/* Social Share Modal */}
      {listing && (
        <SocialShare
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={listing.title}
          description={listing.description}
          url={typeof window !== "undefined" ? window.location.href : ""}
          image={
            listing.images?.[0] ? proxiedImageUrl(listing.images[0]) : undefined
          }
        />
      )}

      {/* Image Gallery Modal */}
      {showGallery && listing.images.length > 0 && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50">
            <p className="text-white font-medium">
              {currentImageIndex + 1} / {listing.images.length}
            </p>
            <button
              onClick={() => setShowGallery(false)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Main Image */}
          <div className="relative w-full max-w-5xl h-[70vh] flex items-center justify-center px-12">
            <img
              src={proxiedImageUrl(listing.images[currentImageIndex])}
              alt={`Gallery image ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>

          {/* Controls */}
          {listing.images.length > 1 && (
            <>
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === 0 ? listing.images.length - 1 : prev - 1,
                  )
                }
                className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <button
                onClick={() =>
                  setCurrentImageIndex((prev) =>
                    prev === listing.images.length - 1 ? 0 : prev + 1,
                  )
                }
                className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors rotate-180"
              >
                <ArrowLeft size={24} />
              </button>
            </>
          )}

          {/* Thumbnails */}
          <div className="absolute bottom-6 left-0 right-0 px-6 flex justify-center gap-2 overflow-x-auto pb-4">
            {listing.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  currentImageIndex === idx
                    ? "border-emerald-500 opacity-100 scale-105"
                    : "border-transparent opacity-50 hover:opacity-75"
                }`}
              >
                <img
                  src={proxiedImageUrl(img)}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <ConnectToContinueModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      </div>
  );
}
