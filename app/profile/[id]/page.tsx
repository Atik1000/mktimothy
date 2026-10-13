"use client";

import Button from "@/components/globals/Button";
import CreateBlogModal from "@/components/profile/CreateBlogModal";
import CreateListingModal from "@/components/profile/CreateListingModal";
import SavedItemsTab from "@/components/profile/SavedItemsTab";
import { FullPageLoader, SectionLoader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/providers/auth-provider";
import { fetchUserBlogs } from "@/lib/services/blog";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, List, Rss, Share2, Bookmark, Settings, Calendar, LayoutGrid, DollarSign, Edit, Trash2, ArrowRight } from 'lucide-react';
import toast from "react-hot-toast";
import {
  FaBlog,
  FaBookmark,
  FaCheck,
  FaCog,
  FaEdit,
  FaFacebook,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaTh,
  FaTwitter,
} from "react-icons/fa";
import { FaClock, FaDollarSign, FaPhone } from "react-icons/fa6";
import {
  IoApps,
  IoListSharp,
  IoLocation,
  IoMail,
  IoPersonSharp,
  IoShareSocial,
  IoTime,
  IoHeartOutline,
  IoChatbubbleOutline,
  IoEyeOutline,
  IoPencilOutline,
  IoTrashOutline
} from "react-icons/io5";

const ProfilePage = ({ params }: { params: { id: string } }) => {
  const {
    user: currentUser,
    isLoading: authLoading,
    handleApiResponse,
  } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [showCreateListingModal, setShowCreateListingModal] = useState(false);
  const [showCreateBlogModal, setShowCreateBlogModal] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [userBlogs, setUserBlogs] = useState([]);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showDeleteBlogModal, setShowDeleteBlogModal] = useState<string | null>(
    null,
  );

  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleCopyProfileLink = () => {
    setShowSuccessToast(true);
    navigator.clipboard.writeText(window.location.href);
  };

  useEffect(() => {
    if (showSuccessToast) {
      toast.success("Profile link copied to clipboard");
      setShowSuccessToast(false); // Reset the state after showing toast
    }
  }, [showSuccessToast]);

  // State for the profile user (the user whose profile we're viewing)
  const [profileUser, setProfileUser] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const isProfileInvestor = profileUser?.role === "INVESTOR";
  const [showProfileNotFound, setShowProfileNotFound] = useState(false);
  const elipsis = (text: string) => {
    return text.length > 10 ? text.slice(0, 10) + "..." : text;
  };

  // Helper function to format working days
  const formatWorkingDays = (workingDays: string | undefined) => {
    if (!workingDays || workingDays.trim() === "") {
      return "Not specified";
    }
    return workingDays;
  };

  // Fetch profile user data
  const fetchProfileUser = async () => {
    try {
      setProfileLoading(true);
      setShowProfileNotFound(false);

      // Record start time for minimum loading duration
      const startTime = Date.now();
      const MINIMUM_LOADING_TIME = 5000; // 5 seconds

      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/users/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const handleResult = async (success: boolean, userData?: any) => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MINIMUM_LOADING_TIME - elapsedTime);

        // Wait for minimum loading time if needed
        if (remainingTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingTime));
        }

        if (success && userData) {
          setProfileUser(userData);
          setIsOwnProfile(currentUser?.id === params.id);
        } else {
          setShowProfileNotFound(true);
        }

        setProfileLoading(false);
      };

      if (!response.ok) {
        if (response.status === 404) {
          await handleResult(false);
          return;
        }
        throw new Error("Failed to fetch user profile");
      }

      const result = await response.json();
      if (result.success) {
        await handleResult(true, result.data);
      } else {
        console.error("Failed to fetch profile:", result.error);
        await handleResult(false);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);

      // Still respect minimum loading time even for errors
      const elapsedTime = Date.now() - (Date.now() - 5000); // Rough estimate
      setTimeout(
        () => {
          setShowProfileNotFound(true);
          setProfileLoading(false);
        },
        Math.max(0, 5000 - elapsedTime),
      );
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser, authLoading, router]);

  // Fetch profile user when params change
  useEffect(() => {
    if (params.id && currentUser) {
      fetchProfileUser();
    }
  }, [params.id, currentUser]);

  // Fetch user listings and blogs when profile user is loaded
  useEffect(() => {
    if (profileUser) {
      fetchUserListings();
      fetchUserBlogsData();
    }
  }, [profileUser]);

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "twitter":
        return <FaTwitter className="w-5 h-5" />;
      case "linkedin":
        return <FaLinkedin className="w-5 h-5" />;
      case "facebook":
        return <FaFacebook className="w-5 h-5" />;
      case "instagram":
        return <FaInstagram className="w-5 h-5" />;
      case "github":
        return <FaGithub className="w-5 h-5" />;
      default:
        return <FaGlobe className="w-5 h-5" />;
    }
  };

  const getVerificationBadge = () => {
    if (!profileUser?.isVerified) return null;

    const badgeColors = {
      BLUE: "text-blue-400",
      GREEN: "text-green-400",
      GOLD: "text-yellow-400",
    };

    return (
      <div
        className={`flex items-center gap-1 ${
          badgeColors[
            profileUser.verificationBadge as keyof typeof badgeColors
          ] || "text-blue-400"
        }`}
      >
        <FaCheck className="w-4 h-4" />
        <span className="text-sm font-medium">Verified</span>
      </div>
    );
  };

  const fetchUserListings = async () => {
    if (!profileUser) {
      if (!profileLoading) {
        console.log("No profile user found, skipping fetch");
      }
      return;
    }

    console.log("Fetching listings for user:", profileUser.id);
    setListingsLoading(true);
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      if (!token) {
        console.log("No token found");
        return;
      }

      // For public profiles, only show published listings
      const status = isOwnProfile ? "" : "PUBLISHED,SOLD,UNDER_OFFER";
      const response = await fetch(
        `/api/listings?userId=${profileUser.id}${
          status ? `&status=${status}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      console.log("Response status:", response.status);
      if (response.ok) {
        const result = await response.json();
        console.log("Listings API Result:", result);

        if (result.success) {
          const listings = result.data?.listings || result.listings || [];
          console.log("Found listings:", listings.length);
          setUserListings(listings);
        }
      } else {
        console.log("Failed to fetch listings:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch user listings:", error);
    } finally {
      setListingsLoading(false);
    }
  };

  const fetchUserBlogsData = async () => {
    if (!profileUser) {
      if (!profileLoading) {
        console.log("No profile user found, skipping blog fetch");
      }
      return;
    }

    console.log("Fetching blogs for user:", profileUser.id);
    setBlogsLoading(true);
    try {
      const result = await fetchUserBlogs(profileUser.id);
      console.log("Blog API Result:", result);

      if (result.success) {
        const blogs = result.data?.blogs || [];
        // For public profiles, only show published blogs
        const filteredBlogs = isOwnProfile
          ? blogs
          : blogs.filter((blog: any) => blog.status === "PUBLISHED");
        console.log("Found blogs:", filteredBlogs.length);
        setUserBlogs(filteredBlogs);
      }
    } catch (error) {
      console.error("Failed to fetch user blogs:", error);
    } finally {
      setBlogsLoading(false);
    }
  };

  const handleCreateListingSuccess = () => {
    // Refresh listings after successful creation
    fetchUserListings();
    console.log("Listing created successfully!");
  };

  const handleCreateBlogSuccess = () => {
    // Refresh blogs after successful creation
    fetchUserBlogsData();
    console.log("Blog created successfully!");
  };

  const handleEditListing = (listing: any) => {
    // For now, just open the edit modal with pre-filled data
    // You can create an EditListingModal component similar to CreateListingModal
    console.log("Edit listing:", listing);
    setEditingListing(listing);
    setShowCreateListingModal(true); // Reuse the create modal for editing
  };

  const handleEditBlog = (blog: any) => {
    console.log("Edit blog:", blog);
    setEditingBlog(blog);
    setShowCreateBlogModal(true);
  };

  const handleDeleteListing = async (listingId: string) => {
    if (!listingId) return;

    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch(`/api/listings/${listingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const isValidResponse = await handleApiResponse(response);
      if (!isValidResponse) return;

      const result = await response.json();
      if (result.success) {
        console.log("Listing deleted successfully");
        // Refresh the listings
        fetchUserListings();
        setShowDeleteModal(null);
      } else {
        console.error("Failed to delete listing:", result.error);
      }
    } catch (error) {
      console.error("Error deleting listing:", error);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!blogId) return;

    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      if (!token) {
        console.error("No auth token found");
        return;
      }

      const response = await fetch(`/api/blogs/${blogId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const isValidResponse = await handleApiResponse(response);
      if (!isValidResponse) return;

      const result = await response.json();
      if (result.success) {
        console.log("Blog deleted successfully");
        // Refresh the blogs
        fetchUserBlogsData();
        setShowDeleteBlogModal(null);
      } else {
        console.error("Failed to delete blog:", result.error);
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const confirmDelete = (listingId: string) => {
    setShowDeleteModal(listingId);
  };

  const confirmDeleteBlog = (blogId: string) => {
    setShowDeleteBlogModal(blogId);
  };

  const getBlogStatusColor = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "DRAFT":
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
      case "SCHEDULED":
        return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "ARCHIVED":
        return "bg-red-500/20 text-red-400 border border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  if (authLoading) {
    return <FullPageLoader />;
  }

  if (profileLoading) {
    return <FullPageLoader message="Loading profile..." />;
  }

  if (showProfileNotFound) {
    return (
      <div className="bg-[url('/images/background2.png')] bg-cover bg-center bg-no-repeat bg-fixed min-h-screen flex items-center justify-center">
        <div className="text-white">Profile not found</div>
      </div>
    );
  }

  if (!profileUser) {
    return <FullPageLoader message="Loading profile..." />;
  }

  return (
    <div className="bg-[url('/images/background2.png')] bg-cover bg-center bg-no-repeat bg-fixed min-h-screen">
      {/* Hero Section with Profile */}
      <div className="relative pt-[200px] pb-[100px] bg-[url('/images/bgmainpage.png')] bg-cover bg-center">
        {/* Profile Circle */}
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-[100px] z-10">
          <div className="relative">
            <div className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] rounded-full border-[8px] border-[#2C2C2C]  bg-gray-600 relative">
              {profileUser.avatar ? (
                <Image
                  src={proxiedImageUrl(profileUser.avatar)}
                  alt={`${profileUser.firstName} ${profileUser.lastName}`}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <IoPersonSharp className="w-16 h-16" />
                </div>
              )}
              {isOwnProfile && (
                <div className="absolute -bottom-2 right-2 z-50">
                  <Link
                    href="/profile/edit"
                    className="w-[40px] h-[40px] md:w-[57px] md:h-[57px] bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-greencolor/80 transition-colors"
                  >
                    <FaEdit className="w-[16px] h-[16px] md:w-[22px] md:h-[22px] text-white" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-[120px] pb-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <h1 className="font-semibold text-[24px] md:text-[36px] text-white">
            {profileUser.firstName} {profileUser.lastName}
          </h1>
          {getVerificationBadge()}
        </div>

        {profileUser.jobTitle && (
          <p className="font-medium text-[16px] md:text-[20px] text-white mb-2 md:mb-4">
            {profileUser.jobTitle}
            {profileUser.company && ` at ${profileUser.company}`}
          </p>
        )}

        {profileUser.bio && (
          <p className="text-gray-300 max-w-2xl mx-auto text-[14px] md:text-[16px] mb-2 ">
            {profileUser.bio}
          </p>
        )}

        {/* Contact Info */}
        {/* <div className="flex items-center justify-center gap-8 mb-8 text-gray-300">
          {user.showLocation && user.location && (
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="w-4 h-4" />
              <span>{user.location}</span>
            </div>
          )}
          {user.showEmail && (
            <div className="flex items-center gap-2">
              <FaEnvelope className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
          )}
         
          {user.website && (
            <div className="flex items-center gap-2">
              <FaGlobe className="w-4 h-4" />
              <a
                href={user.website}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-greencolor transition-colors"
              >
                Website
              </a>
            </div>
          )}
        </div> */}
        {profileUser.showPhone && profileUser.phone && (
          <div className="flex items-center gap-2 mx-auto justify-center text-white mb-2">
            <FaPhone className="w-4 h-4" />
            <span>{profileUser.phone}</span>
          </div>
        )}

        {/* Social Links */}
        {profileUser.socialLinks &&
          Object.values(profileUser.socialLinks).some((link) => link) && (
            <div className="flex items-center justify-center gap-4 mb-8">
              {Object.entries(profileUser.socialLinks).map(
                ([platform, url]) => {
                  if (!url) return null;
                  return (
                    <a
                      key={platform}
                      href={url as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-greencolor transition-colors"
                    >
                      {getSocialIcon(platform)}
                    </a>
                  );
                },
              )}
            </div>
          )}

        {/* Skills and Languages */}
        {/* <div className="max-w-4xl mx-auto mb-8">
          {user.skills && user.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white aabbss font-bold text-lg mb-3">
                Skills
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {user.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-greencolor/20 text-greencolor px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.languages && user.languages.length > 0 && (
            <div className="mb-6">
              <h3 className="text-white aabbss font-bold text-lg mb-3">
                Languages
              </h3>
              <div className="flex flex-wrap justify-center gap-2">
                {user.languages.map((language, index) => (
                  <span
                    key={index}
                    className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm"
                  >
                    {language}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div> */}

        {/* Action Buttons */}
        <div className="flex justify-center px-5 mb-8">
          <div className="bg-[#18181b] border border-white/5 rounded-3xl p-2.5 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 shadow-2xl shadow-black/50">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              ...(!isProfileInvestor ? [
                { id: 'catalog', label: 'Catalog', icon: List },
                { id: 'blog', label: 'Blog', icon: Rss }
              ] : []),
              { id: 'share', label: 'Share', icon: Share2 },
              ...(isOwnProfile ? [
                { id: 'saved', label: 'Saved', icon: Bookmark },
                { id: 'settings', label: 'Settings', icon: Settings, isLink: true }
              ] : [])
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              if (item.isLink) {
                return (
                  <Link
                    key={item.id}
                    href="/profile/settings"
                    className="relative group flex flex-col items-center justify-center w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl transition-all duration-300 ease-out text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                  >
                    <Icon 
                      strokeWidth={2} 
                      className="w-6 h-6 mb-1.5 transition-transform duration-300 group-hover:scale-110" 
                    />
                    <span className="text-[11px] font-medium tracking-wide transition-colors duration-300">
                      {item.label}
                    </span>
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`
                    relative group flex flex-col items-center justify-center w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-2xl transition-all duration-300 ease-out
                    ${isActive 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.07)]' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <Icon 
                    strokeWidth={isActive ? 2.5 : 2} 
                    className={`
                      w-6 h-6 mb-1.5 transition-transform duration-300
                      ${isActive ? 'scale-110' : 'group-hover:scale-110'}
                    `} 
                  />
                  <span className={`text-[11px] font-medium tracking-wide transition-colors duration-300 ${isActive ? 'text-emerald-400' : ''}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-1.5 w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {/* <div className="width pb-16">
        <div className="flex justify-center gap-4">
          <Button text="Edit Profile" link="/profile/edit" secondary />
          {!user.isVerified && (
            <Button text="Get Verified" link="/profile/verify" />
          )}
          <Button text="Account Settings" link="/profile/settings" secondary />
        </div>
      </div> */}

      {/* Conditional Content Based on Active Tab */}
      {activeTab === "profile" && (
        <div className="width pb-16">
          {isOwnProfile &&
            !isProfileInvestor &&
            (userListings.length == 0 ||
              (userBlogs.length == 0 && (
                <div className="text-center mb-8">
                  <h2 className="aabbss font-bold text-[32px] leading-[44px] text-white mb-4">
                    My Content
                  </h2>
                  <div className="flex justify-center gap-4">
                    <Button
                      text="Create New Listing"
                      onClick={() => setShowCreateListingModal(true)}
                    />
                    <Button
                      text="Create New Blog"
                      onClick={() => setShowCreateBlogModal(true)}
                      secondary
                    />
                  </div>
                </div>
              )))}
          {/* Recent Listings */}
          {listingsLoading ? (
            <SectionLoader height="h-24" message="Loading your listings..." />
          ) : userListings.length === 0 ? (
            !isProfileInvestor ? (
              <div className="text-center mb-8">
                <p className="text-gray-400 mb-4">
                  {isOwnProfile
                    ? "You haven't created any listings yet."
                    : "This user hasn't created any listings yet."}
                </p>
              </div>
            ) : null
          ) : (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white aabbss font-bold text-xl">
                  Projects ({userListings.length})
                </h3>
                <button
                  onClick={() => setActiveTab("catalog")}
                  className="text-greencolor hover:text-greencolor/80 transition-colors"
                >
                  View All →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {userListings.slice(0, 3).map((listing: any) => (
                  <Link
                    key={listing.id}
                    href={`/project/${listing.id}`}
                    className=" rounded-lg border border-white/10 hover:border-greencolor/50 transition-colors"
                  >
                    {listing.images && listing.images.length > 0 && (
                      <div className="w-full h-48 bg-gray-600 rounded-lg overflow-hidden">
                        <img
                          src={proxiedImageUrl(listing.images[0])}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className={` py-8 md:py-16`}>
            <div className="text-white aabbuu font-normal text-[14px] sm:text-[16px] md:text-[20px]">
              {/* Pitch Idea Details */}
              {profileUser.pitchIdea && (
                <div className="mb-12 bg-white/5 rounded-xl p-6 border border-white/10">
                  <p className="mb-6">
                    <strong className="text-greencolor text-2xl">
                      Pitch Idea Details
                    </strong>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profileUser.pitchIdea.businessStage && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Main Objective
                        </strong>
                        <span className="text-white whitespace-pre-wrap">
                          {profileUser.pitchIdea.businessStage}
                        </span>
                      </div>
                    )}
                    {profileUser.pitchIdea.fundingStatus && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Business / Idea Details
                        </strong>
                        <span className="text-white whitespace-pre-wrap">
                          {profileUser.pitchIdea.fundingStatus}
                        </span>
                      </div>
                    )}
                    {profileUser.pitchIdea.investorType && (
                      <div className="col-span-1 md:col-span-2">
                        <strong className="block text-gray-400 text-sm mb-1">
                          Financial Overview
                        </strong>
                        <span className="text-white whitespace-pre-wrap">
                          {profileUser.pitchIdea.investorType}
                        </span>
                      </div>
                    )}
                    {profileUser.pitchIdea.experience && (
                      <div className="col-span-1 md:col-span-2">
                        <strong className="block text-gray-400 text-sm mb-1">
                          Goal Details
                        </strong>
                        <span className="text-white whitespace-pre-wrap">
                          {profileUser.pitchIdea.experience}
                        </span>
                      </div>
                    )}
                    {profileUser.pitchIdea.timeToFunding && (
                      <div className="col-span-1 md:col-span-2">
                        <strong className="block text-gray-400 text-sm mb-1">
                          Additional Information
                        </strong>
                        <span className="text-white whitespace-pre-wrap">
                          {profileUser.pitchIdea.timeToFunding}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Investor Profile Details */}
              {profileUser.investorProfile && (
                <div className="mb-12 bg-white/5 rounded-xl p-6 border border-white/10">
                  <p className="mb-6">
                    <strong className="text-greencolor text-2xl">
                      Investor Profile Details
                    </strong>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {profileUser.investorProfile.investorType && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Investor Type
                        </strong>
                        <span className="text-white">
                          {profileUser.investorProfile.investorType}
                        </span>
                      </div>
                    )}
                    {profileUser.investorProfile.investmentStage && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Investment Ambition
                        </strong>
                        <span className="text-white">
                          {profileUser.investorProfile.investmentStage}
                        </span>
                      </div>
                    )}
                    {profileUser.investorProfile.checkSize && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Capital Ready to Deploy
                        </strong>
                        <span className="text-white">
                          {profileUser.investorProfile.checkSize}
                        </span>
                      </div>
                    )}
                    {profileUser.investorProfile.valueAdd && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Preferred Investment Method
                        </strong>
                        <span className="text-white">
                          {profileUser.investorProfile.valueAdd}
                        </span>
                      </div>
                    )}
                    {profileUser.investorProfile.targetRegion && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Target Region
                        </strong>
                        <span className="text-white">
                          {profileUser.investorProfile.targetRegion}
                        </span>
                      </div>
                    )}
                    {profileUser.investorProfile.industries && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Sectors of Interest
                        </strong>
                        <span className="text-white">
                          {profileUser.investorProfile.industries}
                        </span>
                      </div>
                    )}
                    {profileUser.investorProfile.revenueRange && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Annual Revenue Range
                        </strong>
                        <span className="text-white">
                          {profileUser.investorProfile.revenueRange}
                        </span>
                      </div>
                    )}
                    {profileUser.investorProfile.employeeCount && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Number of Employees
                        </strong>
                        <span className="text-white">
                          {profileUser.investorProfile.employeeCount}
                        </span>
                      </div>
                    )}
                    {profileUser.investorProfile.businessModel && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Preferred Business Type
                        </strong>
                        <span className="text-white">
                          {profileUser.investorProfile.businessModel}
                        </span>
                      </div>
                    )}
                    {profileUser.investorProfile.postInvestmentEngagement && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Post-Investment Engagement
                        </strong>
                        <span className="text-white">
                          {profileUser.investorProfile.postInvestmentEngagement}
                        </span>
                      </div>
                    )}
                    {profileUser.investorProfile.businessPlanStatus && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Business Plan Status
                        </strong>
                        <span className="text-white">
                          {profileUser.investorProfile.businessPlanStatus}
                        </span>
                      </div>
                    )}
                    {profileUser.investorProfile.localPartnershipNeeds && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Local Partnership Needs
                        </strong>
                        <span className="text-white">
                          {profileUser.investorProfile.localPartnershipNeeds}
                        </span>
                      </div>
                    )}
                    {profileUser.investorProfile.launchTimeline && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Projected Launch Timeline
                        </strong>
                        <span className="text-white">
                          {profileUser.investorProfile.launchTimeline}
                        </span>
                      </div>
                    )}
                    {profileUser.investorProfile.referenceCode && (
                      <div>
                        <strong className="block text-gray-400 text-sm mb-1">
                          Partner Reference Code
                        </strong>
                        <span className="text-white">
                          {profileUser.investorProfile.referenceCode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Original About Section */}
              {profileUser.bio && (
                <>
                  <p className="mb-4 md:mb-8">
                    <strong className="text-greencolor text-xl">About</strong>
                  </p>
                  <p className="mb-4 md:mb-8 text-gray-300">
                    {profileUser.bio}
                  </p>
                </>
              )}


            </div>
            <div
              className={`py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`}
            >
              {/* Working Hours */}
              <div className="flex items-center gap-4">
                <IoTime className="w-[30px] h-[30px] text-white" />
                <div>
                  <span className="aabbuu font-medium text-[16px] sm:text-[20px] text-white">
                    {formatWorkingDays(profileUser.workingDays)}
                  </span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-4 overflow-hidden">
                <IoMail className="w-[30px] h-[30px] text-white flex-shrink-0" />
                <span className="aabbuu font-medium text-[14px] sm:text-[16px] text-white line-clamp-1">
                  {profileUser.email}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4 overflow-hidden">
                <IoLocation className="w-[30px] h-[30px] text-white" />
                <span className="aabbuu font-medium text-[14px] sm:text-[16px] text-white line-clamp-1">
                  {profileUser.city && profileUser.country
                    ? `${profileUser.city}, ${profileUser.country}`
                    : "No location provided"}
                </span>
              </div>

              {/* Business Type */}
              <div className="flex items-center gap-4">
                <IoApps className="w-[30px] h-[30px] text-white" />
                <span className="aabbuu font-medium text-[14px] sm:text-[16px] text-white line-clamp-1">
                  {profileUser.businessType
                    ? profileUser.businessType
                    : "No business type provided"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "catalog" && (
        <div className="width pb-16">
          <div
            className={`text-center mb-8 ${isOwnProfile && !isProfileInvestor ? "" : "hidden"}`}
          >
            <h2 className="aabbss font-bold text-[32px] leading-[44px] text-white mb-4">
              My Listings
            </h2>
            <div className="flex justify-center gap-4">
              <Button
                text="Create New Listing"
                onClick={() => setShowCreateListingModal(true)}
              />
              <Button text="View All Listings" link="/all-listings" secondary />
            </div>
          </div>

          {listingsLoading ? (
            <SectionLoader height="h-24" message="Loading listings..." />
          ) : userListings.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-400 mb-8">
                {isOwnProfile
                  ? "You haven't created any listings yet."
                  : "This user hasn't created any listings yet."}
              </p>
              {isOwnProfile && !isProfileInvestor && (
                <Button
                  text="Create Your First Listing"
                  onClick={() => setShowCreateListingModal(true)}
                />
              )}
            </div>
          ) : (
            <div className="grid  gap-6">
              {userListings.map((listing: any) => (
                <div key={listing.id} className="w-full bg-[#18181b] border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-5 sm:gap-6 shadow-2xl shadow-black/40 group hover:border-white/10 transition-colors duration-300">
                  
                  {/* Fixed aspect ratio container for the image with a subtle inner shadow */}
                  <div className="relative w-full sm:w-56 aspect-[4/3] sm:aspect-square shrink-0 bg-zinc-800 rounded-xl overflow-hidden group-hover:shadow-lg transition-shadow">
                    {listing.images && listing.images[0] ? (
                      <img 
                        src={proxiedImageUrl(listing.images[0])} 
                        alt={listing.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500">No Image</div>
                    )}
                    {/* Subtle gradient overlay to ensure image doesn't look flat */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  <div className="flex-1 flex flex-col py-1">
                    
                    {/* Header Row: Title & Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4 mb-2">
                      <div>
                        <h2 className="text-xl font-semibold text-white tracking-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                          {listing.title}
                        </h2>
                        <p className="text-sm text-zinc-400 mt-1 line-clamp-1">
                          Listing ID: {listing.id}
                        </p>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-md ${
                          listing.status === "PUBLISHED"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : listing.status === "SOLD" || listing.status === "UNDER_OFFER"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            : listing.status === "DRAFT"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {listing.status === "PUBLISHED" ? "ACTIVE" : listing.status.replace("_", " ")}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase backdrop-blur-md ${
                          listing.approvalStatus === "APPROVED"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : listing.approvalStatus === "PENDING"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {listing.approvalStatus === "PENDING" ? "APPROVAL PENDING" : listing.approvalStatus}
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-px bg-white/5 my-4 sm:my-auto" />

                    {/* Clean, icon-driven metadata replacing the heavy green blocks */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-5">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Calendar size={16} className="text-zinc-500" />
                        <span className="text-sm font-medium">{new Date(listing.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Category */}
                      <div className="flex items-center gap-2 text-zinc-400">
                        <LayoutGrid size={16} className="text-zinc-500" />
                        <span className="text-sm font-medium truncate max-w-[200px]" title={listing.category.name}>
                          {listing.category.name}
                        </span>
                      </div>

                      {/* Price/Value */}
                      <div className="flex items-center gap-1.5 text-zinc-200">
                        <DollarSign size={16} className="text-emerald-400" />
                        <span className="text-sm font-semibold tracking-wide">{listing.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 mt-auto border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                      
                      {/* Secondary Actions (Edit/Delete) */}
                      {isOwnProfile && (
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleEditListing(listing)}
                            className="p-2 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all border border-transparent hover:border-blue-500/20 active:scale-95"
                            title="Edit Listing"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => confirmDelete(listing.id)}
                            className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all border border-transparent hover:border-rose-500/20 active:scale-95"
                            title="Delete Listing"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      )}

                      {/* Primary Action (View) */}
                      <Link 
                        href={`/project/${listing.id}`}
                        className="flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 py-2 px-5 rounded-lg text-sm font-semibold transition-all active:scale-95 flex-1 sm:flex-none"
                      >
                        <span>View Details</span>
                        <ArrowRight size={16} className="text-zinc-600" />
                      </Link>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "blog" && (
        <div className="width pb-16">
          <div className={`text-center mb-8 ${isOwnProfile ? "" : "hidden"}`}>
            <h2 className="aabbss font-bold text-[32px] leading-[44px] text-white mb-4">
              My Blog Posts
            </h2>
            <div className="flex justify-center gap-4">
              <Button
                text="Create New Blog Post"
                onClick={() => setShowCreateBlogModal(true)}
              />
              <Button text="View All Blogs" link="/blogs" secondary />
            </div>
          </div>

          {blogsLoading ? (
            <SectionLoader height="h-24" message="Loading blog posts..." />
          ) : userBlogs.length === 0 ? (
            <div className="text-center">
              <p className="text-gray-400 mb-8">
                {isOwnProfile
                  ? "You haven't created any blog posts yet."
                  : "This user hasn't created any blog posts yet."}
              </p>
              {isOwnProfile && (
                <Button
                  text="Create Your First Blog Post"
                  onClick={() => setShowCreateBlogModal(true)}
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userBlogs.map((blog: any) => (
                <div
                  key={blog.id}
                  className="w-full max-w-[400px] bg-[#18181b] border border-white/5 rounded-2xl overflow-hidden shadow-2xl flex flex-col transition-all hover:shadow-black/50 hover:border-white/10 mx-auto"
                >
                  {/* Image Section */}
                  <div className="relative w-full h-52 sm:h-60 bg-[#27272a] group">
                    {blog.coverImage ? (
                      <img
                        src={proxiedImageUrl(blog.coverImage)}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                    
                    {/* Top Gradient Overlay for readability of badges */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent opacity-80" />
                    
                    {/* Floating Status Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 items-end z-10">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm ${getBlogStatusColor(blog.status)}`}>
                        {blog.status}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase backdrop-blur-md shadow-sm ${
                        blog.approvalStatus === "APPROVED"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : blog.approvalStatus === "PENDING"
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}>
                        {blog.approvalStatus === "PENDING" ? "APPROVAL PENDING" : blog.approvalStatus}
                      </span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5 flex flex-col flex-1">
                    
                    {/* Title & Description */}
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-white mb-1.5 tracking-tight line-clamp-2">{blog.title}</h2>
                      <p className="text-sm text-zinc-400 leading-relaxed line-clamp-3">
                        {blog.excerpt || (blog.content ? blog.content.substring(0, 150) + "..." : "")}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {blog.tags &&
                        blog.tags
                          .slice(0, 3)
                          .map((blogTag: any, index: number) => (
                            <span
                              key={index}
                              className="px-2.5 py-1 bg-emerald-950/40 text-emerald-400 rounded-md text-xs font-medium hover:bg-emerald-900/50 transition-colors cursor-pointer border border-emerald-900/30 lowercase"
                            >
                              #{blogTag.tag.name}
                            </span>
                          ))}
                    </div>

                    {/* Stats & Date */}
                    <div className="flex items-center justify-between py-4 mt-auto border-t border-white/5">
                      <div className="flex items-center gap-4 text-zinc-500">
                        {/* Likes */}
                        <div className="flex items-center gap-1.5 group cursor-pointer hover:text-rose-400 transition-colors">
                          <IoHeartOutline className="w-[14px] h-[14px]" />
                          <span className="text-xs font-medium">{blog.likeCount || 0}</span>
                        </div>
                        {/* Comments */}
                        <div className="flex items-center gap-1.5 group cursor-pointer hover:text-blue-400 transition-colors">
                          <IoChatbubbleOutline className="w-[14px] h-[14px]" />
                          <span className="text-xs font-medium">{blog._count?.comments || 0}</span>
                        </div>
                        {/* Views */}
                        <div className="flex items-center gap-1.5 group cursor-pointer hover:text-white transition-colors">
                          <IoEyeOutline className="w-[14px] h-[14px]" />
                          <span className="text-xs font-medium">{blog.viewCount || 0}</span>
                        </div>
                      </div>
                      
                      {/* Date */}
                      <span className="text-xs font-medium text-zinc-500">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4">
                      {/* Primary Action */}
                      <Link
                        href={`/blog-details/${blog.id}`}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] shadow-lg shadow-emerald-900/20 text-center"
                      >
                        View Content
                      </Link>
                      
                      {/* Secondary Actions */}
                      {isOwnProfile && (
                        <>
                          <button 
                            onClick={() => handleEditBlog(blog)}
                            className="p-2.5 text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all active:scale-[0.98] border border-transparent hover:border-blue-500/20" 
                            aria-label="Edit"
                          >
                            <IoPencilOutline className="w-[18px] h-[18px]" />
                          </button>
                          <button 
                            onClick={() => confirmDeleteBlog(blog.id)}
                            className="p-2.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all active:scale-[0.98] border border-transparent hover:border-rose-500/20" 
                            aria-label="Delete"
                          >
                            <IoTrashOutline className="w-[18px] h-[18px]" />
                          </button>
                        </>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "share" && (
        <div className="width pb-16">
          <div className="text-center">
            <h2 className="aabbss font-bold text-[32px] leading-[44px] text-white mb-8">
              Share Profile
            </h2>
            <p className="text-gray-400 mb-8">
              Share your profile with others to grow your network.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                text="Copy Profile Link"
                onClick={() => {
                  handleCopyProfileLink();
                }}
              />
              <Button
                text="Share on WhatsApp"
                secondary
                onClick={() => {
                  const url = encodeURIComponent(window.location.href);
                  const text = encodeURIComponent(
                    `Check out ${profileUser.firstName}'s profile`,
                  );
                  window.open(`https://wa.me/?text=${text}%20${url}`, "_blank");
                }}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === "saved" && isOwnProfile && (
        <div className="width pb-16">
          <SavedItemsTab />
        </div>
      )}

      {/* Create Listing Modal */}
      <CreateListingModal
        profileUser={profileUser}
        isOpen={showCreateListingModal}
        onClose={() => {
          setShowCreateListingModal(false);
          setEditingListing(null);
        }}
        onSuccess={handleCreateListingSuccess}
        editingListing={editingListing}
      />

      {/* Create Blog Modal */}
      <CreateBlogModal
        profileUser={profileUser}
        isOpen={showCreateBlogModal}
        onClose={() => {
          setShowCreateBlogModal(false);
          setEditingBlog(null);
        }}
        onSuccess={handleCreateBlogSuccess}
        editingBlog={editingBlog}
      />

      {/* Delete Listing Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2C2C2C] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-white aabbss font-bold text-xl mb-4">
              Delete Listing
            </h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this listing? This action cannot
              be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteListing(showDeleteModal)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Blog Confirmation Modal */}
      {showDeleteBlogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#2C2C2C] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-white aabbss font-bold text-xl mb-4">
              Delete Blog Post
            </h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this blog post? This action cannot
              be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteBlogModal(null)}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBlog(showDeleteBlogModal)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

