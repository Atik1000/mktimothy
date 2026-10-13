"use client";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";

import Button from "@/components/globals/Button";
import { FullPageLoader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaTrash, FaUpload, FaUser } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  website: string;
  jobTitle: string;
  company: string;
  skills: string[];
  languages: string[];
  businessType: string;
  workingDays: string;
  address: string;
  city: string;
  country: string;
  zipCode: string;
  socialLinks: {
    twitter: string;
    linkedin: string;
    facebook: string;
    instagram: string;
    github: string;
  };
  isProfilePublic: boolean;
  showEmail: boolean;
  showPhone: boolean;
  showLocation: boolean;
  allowMessages: boolean;
}

const ProfileEditPage = () => {
  const {
    user,
    isLoading: authLoading,
    refreshAuth,
    handleApiResponse,
  } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    website: "",
    jobTitle: "",
    company: "",
    skills: [],
    languages: [],
    businessType: "",
    workingDays: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
    socialLinks: {
      twitter: "",
      linkedin: "",
      facebook: "",
      instagram: "",
      github: "",
    },
    isProfilePublic: true,
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowMessages: true,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
        location: user.location || "",
        website: user.website || "",
        jobTitle: user.jobTitle || "",
        company: user.company || "",
        skills: user.skills || [],
        languages: user.languages || [],
        businessType: user.businessType || "",
        workingDays: Array.isArray(user.workingDays)
          ? user.workingDays.join(", ")
          : typeof user.workingDays === "string"
            ? user.workingDays
            : "",
        address: user.address || "",
        city: user.city || "",
        country: user.country || "",
        zipCode: user.zipCode || "",
        socialLinks: {
          twitter: user.socialLinks?.twitter || "",
          linkedin: user.socialLinks?.linkedin || "",
          facebook: user.socialLinks?.facebook || "",
          instagram: user.socialLinks?.instagram || "",
          github: user.socialLinks?.github || "",
        },
        isProfilePublic: user.isProfilePublic ?? true,
        showEmail: user.showEmail ?? false,
        showPhone: user.showPhone ?? false,
        showLocation: user.showLocation ?? true,
        allowMessages: user.allowMessages ?? true,
      });
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSocialLinkChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value,
      },
    }));
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const addLanguage = () => {
    if (
      languageInput.trim() &&
      !formData.languages.includes(languageInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, languageInput.trim()],
      }));
      setLanguageInput("");
    }
  };

  const removeLanguage = (language: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l !== language),
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Clear the input so selecting the same file again (e.g. after cropping)
    // still fires onChange.
    const resetInput = () => {
      e.target.value = "";
    };
    if (file) {
      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors({
          avatar: "Please select a valid image file (JPEG, PNG, GIF, WebP)",
        });
        resetInput();
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setErrors({ avatar: "File size must be less than 5MB" });
        resetInput();
        return;
      }

      // Read + preview the image, then enforce square (1:1) aspect ratio.
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const img = new window.Image();
        img.onload = () => {
          const w = img.naturalWidth;
          const h = img.naturalHeight;
          // Allow a 2px tolerance for rounding.
          if (Math.abs(w - h) > 2) {
            setAvatarFile(null);
            setAvatarPreview("");
            setErrors({
              avatar: `Profile photo must be square (1:1). Your image is ${w}×${h}px. Please crop it to a square.`,
            });
            resetInput();
            return;
          }
          if (w < 200 || h < 200) {
            setAvatarFile(null);
            setAvatarPreview("");
            setErrors({
              avatar: `Image is too small. Minimum size is 200×200px (yours is ${w}×${h}px).`,
            });
            resetInput();
            return;
          }
          // All good — accept the file, show preview, clear errors.
          setAvatarFile(file);
          setAvatarPreview(dataUrl);
          setErrors((prev) => ({ ...prev, avatar: "" }));
        };
        img.onerror = () => {
          setAvatarFile(null);
          setAvatarPreview("");
          setErrors({
            avatar: "Could not read the image. Please try a different file.",
          });
          resetInput();
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setIsUploadingAvatar(true);
    setErrors((prev) => ({ ...prev, avatar: "" }));

    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      if (!token) {
        setErrors({ avatar: "Please log in again to upload avatar" });
        return;
      }

      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      // Use the auth provider's response handler
      const isValidResponse = await handleApiResponse(response);
      if (!isValidResponse) {
        // Token expired or other auth error - user will be redirected automatically
        return;
      }

      const result = await response.json();

      if (result.success) {
        setSuccess("Profile picture updated successfully!");
        setAvatarFile(null);
        setAvatarPreview("");
        await refreshAuth(); // Refresh user data
      } else {
        setErrors({ avatar: result.error });
      }
    } catch (error) {
      setErrors({ avatar: "Failed to upload profile picture" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    setIsUploadingAvatar(true);
    setErrors((prev) => ({ ...prev, avatar: "" }));

    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      if (!token) {
        setErrors({ avatar: "Please log in again to remove avatar" });
        return;
      }

      const response = await fetch("/api/profile/avatar", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Use the auth provider's response handler
      const isValidResponse = await handleApiResponse(response);
      if (!isValidResponse) {
        // Token expired or other auth error - user will be redirected automatically
        return;
      }

      const result = await response.json();

      if (result.success) {
        setSuccess("Profile picture removed successfully!");
        await refreshAuth(); // Refresh user data
      } else {
        setErrors({ avatar: result.error });
      }
    } catch (error) {
      setErrors({ avatar: "Failed to remove profile picture" });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    setErrors({});

    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      if (!token) {
        setErrors({ general: "Please log in again to update your profile" });
        router.push("/login");
        return;
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      // Use the auth provider's response handler
      const isValidResponse = await handleApiResponse(response);
      if (!isValidResponse) {
        // Token expired or other auth error - user will be redirected automatically
        return;
      }

      const result = await response.json();

      if (result.success) {
        setSuccess("Profile updated successfully!");
        // Refresh user data in auth provider
        await refreshAuth();
        setTimeout(() => {
          router.push(`/profile/${user?.id}`);
        }, 2000);
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: "Failed to update profile" });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: "personal", label: "Personal Info" },
    { id: "contact", label: "Contact Details" },
    { id: "social", label: "Social Links" },
    { id: "privacy", label: "Privacy Settings" },
  ];

  if (authLoading) {
    return <FullPageLoader message="Loading profile editor..." />;
  }

  return (
    <div className="bg-[url('/images/background2.png')] bg-cover bg-center bg-no-repeat bg-fixed min-h-screen pt-[150px] pb-[100px]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-white hover:text-greencolor transition-colors"
            >
              <IoArrowBack className="w-6 h-6" />
            </button>
            <h1 className="text-white aabbss font-bold text-2xl">
              Edit Profile
            </h1>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tabs */}
          <div className="flex gap-1 bg-[#2C2C2C] rounded-lg p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 px-4 rounded-md aabbss font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-greencolor text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-[#2C2C2C] rounded-lg p-6">
            {activeTab === "personal" && (
              <div className="space-y-6">
                <h3 className="text-white aabbss font-bold text-lg mb-4">
                  Personal Information
                </h3>

                {/* Profile Picture Upload */}
                <div className="mb-6">
                  <label className="block text-white aabbss font-medium mb-4">
                    Profile Picture
                  </label>

                  <div className="flex items-start gap-6">
                    {/* Current Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                        {avatarPreview ? (
                          <img
                            src={proxiedImageUrl(avatarPreview)}
                            alt="Avatar preview"
                            className="w-full h-full object-cover"
                          />
                        ) : user?.avatar ? (
                          <img
                            src={proxiedImageUrl(user.avatar)}
                            alt="Current avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaUser className="text-gray-400 w-8 h-8" />
                        )}
                      </div>
                    </div>

                    {/* Upload Controls */}
                    <div className="flex-1">
                      <div className="space-y-3">
                        {/* File Input */}
                        <div>
                          <input
                            type="file"
                            id="avatar-upload"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                          />
                          <label
                            htmlFor="avatar-upload"
                            className="inline-flex items-center gap-2 bg-greencolor text-white px-4 py-2 rounded-lg hover:bg-greencolor/90 transition-colors cursor-pointer"
                          >
                            <FaUpload className="w-4 h-4" />
                            Choose Photo
                          </label>
                        </div>

                        {/* Upload/Remove Buttons */}
                        {avatarFile && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleAvatarUpload}
                              disabled={isUploadingAvatar}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                              {isUploadingAvatar ? "Uploading..." : "Upload"}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAvatarFile(null);
                                setAvatarPreview("");
                              }}
                              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        )}

                        {/* Remove Current Avatar */}
                        {user?.avatar && !avatarFile && (
                          <button
                            type="button"
                            onClick={handleAvatarRemove}
                            disabled={isUploadingAvatar}
                            className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            <FaTrash className="w-4 h-4" />
                            {isUploadingAvatar ? "Removing..." : "Remove Photo"}
                          </button>
                        )}

                        {/* Error Message */}
                        {errors.avatar && (
                          <p className="text-red-400 text-sm">
                            {errors.avatar}
                          </p>
                        )}

                        {/* Help Text */}
                        <p className="text-gray-400 text-sm">
                          <span className="text-gray-300">Required:</span> a
                          square (1:1) image, at least 200×200 pixels.
                          Non-square images will be rejected. Max file size:
                          5MB.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white aabbss font-medium mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        handleInputChange("firstName", e.target.value)
                      }
                      className="w-full bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label className="block text-white aabbss font-medium mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        handleInputChange("lastName", e.target.value)
                      }
                      className="w-full bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div>
                    <label className="block text-white aabbss font-medium mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) =>
                        handleInputChange("jobTitle", e.target.value)
                      }
                      className="w-full bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                      placeholder="Enter your job title"
                    />
                  </div>

                  <div>
                    <label className="block text-white aabbss font-medium mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) =>
                        handleInputChange("company", e.target.value)
                      }
                      className="w-full bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                      placeholder="Enter your company"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white aabbss font-medium mb-2">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="w-full bg-transparent border-2 border-lightgray text-white aabbss text-lg py-2 px-3 focus:outline-none focus:border-greencolor transition-colors rounded-lg resize-none"
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Skills */}
                {/* <div>
                  <label className="block text-white aabbss font-medium mb-2">
                    Skills
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      className="flex-1 bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                      placeholder="Add a skill"
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addSkill())
                      }
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="bg-greencolor text-white px-4 py-2 rounded-lg hover:bg-greencolor/90 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-greencolor/20 text-greencolor px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div> */}

                {/* Languages */}
                {/* <div>
                  <label className="block text-white aabbss font-medium mb-2">
                    Languages
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={languageInput}
                      onChange={(e) => setLanguageInput(e.target.value)}
                      className="flex-1 bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                      placeholder="Add a language"
                      onKeyPress={(e) =>
                        e.key === "Enter" && (e.preventDefault(), addLanguage())
                      }
                    />
                    <button
                      type="button"
                      onClick={addLanguage}
                      className="bg-greencolor text-white px-4 py-2 rounded-lg hover:bg-greencolor/90 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((language, index) => (
                      <span
                        key={index}
                        className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {language}
                        <button
                          type="button"
                          onClick={() => removeLanguage(language)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div> */}

                {/* Business Type */}
                <div>
                  <label className="block text-white aabbss font-medium mb-2">
                    Business Type
                  </label>
                  <input
                    type="text"
                    value={formData.businessType}
                    onChange={(e) =>
                      handleInputChange("businessType", e.target.value)
                    }
                    className="w-full bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                    placeholder="e.g., Freelancer, Agency, Corporation"
                  />
                </div>

                {/* Working Days  */}
                <div>
                  <label className="block text-white aabbss font-medium mb-2">
                    Working Days
                  </label>
                  <input
                    type="text"
                    value={formData.workingDays}
                    onChange={(e) =>
                      handleInputChange("workingDays", e.target.value)
                    }
                    className="w-full bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                    placeholder="e.g., Monday to Friday, Weekends, Mon-Wed-Fri"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Enter your working days or schedule
                  </p>
                </div>
              </div>
            )}

            {activeTab === "contact" && (
              <div className="space-y-6">
                <h3 className="text-white aabbss font-bold text-lg mb-4">
                  Contact Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-white aabbss font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-white aabbss font-medium mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-white aabbss font-medium mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className="w-full bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                      placeholder="Enter your address"
                    />
                  </div>

                  <div>
                    <label className="block text-white aabbss font-medium mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) =>
                        handleInputChange("city", e.target.value)
                      }
                      className="w-full bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                      placeholder="Enter your city"
                    />
                  </div>

                  <div>
                    <label className="block text-white aabbss font-medium mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value={formData.country}
                      onChange={(e) =>
                        handleInputChange("country", e.target.value)
                      }
                      className="w-full bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                      placeholder="Enter your country"
                    />
                  </div>

                  <div>
                    <label className="block text-white aabbss font-medium mb-2">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={formData.zipCode}
                      onChange={(e) =>
                        handleInputChange("zipCode", e.target.value)
                      }
                      className="w-full bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                      placeholder="Enter your zip code"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-white aabbss font-medium mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    className="w-full bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                    placeholder="Enter your location"
                  />
                </div>
              </div>
            )}

            {activeTab === "social" && (
              <div className="space-y-6">
                <h3 className="text-white aabbss font-bold text-lg mb-4">
                  Social Media Links
                </h3>

                <div className="space-y-4">
                  {Object.entries(formData.socialLinks).map(
                    ([platform, url]) => (
                      <div key={platform}>
                        <label className="block text-white aabbss font-medium mb-2 capitalize">
                          {platform}
                        </label>
                        <input
                          type="url"
                          value={url}
                          onChange={(e) =>
                            handleSocialLinkChange(platform, e.target.value)
                          }
                          className="w-full bg-transparent border-b-2 border-lightgray text-white aabbss text-lg py-2 px-2 focus:outline-none focus:border-greencolor transition-colors"
                          placeholder={`https://${platform}.com/yourprofile`}
                        />
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-6">
                <h3 className="text-white aabbss font-bold text-lg mb-4">
                  Privacy Settings
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white aabbss font-medium">
                        Public Profile
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Allow others to view your profile
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isProfilePublic}
                        onChange={(e) =>
                          handleInputChange("isProfilePublic", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white aabbss font-medium">
                        Show Email
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Display your email address on your profile
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showEmail}
                        onChange={(e) =>
                          handleInputChange("showEmail", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white aabbss font-medium">
                        Show Phone
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Display your phone number on your profile
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showPhone}
                        onChange={(e) =>
                          handleInputChange("showPhone", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white aabbss font-medium">
                        Show Location
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Display your location on your profile
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.showLocation}
                        onChange={(e) =>
                          handleInputChange("showLocation", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white aabbss font-medium">
                        Allow Messages
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Allow other users to send you messages
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowMessages}
                        onChange={(e) =>
                          handleInputChange("allowMessages", e.target.checked)
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              text="Cancel"
              secondary
              onClick={() => router.back()}
              disabled={isLoading}
            />
            <Button
              text={isLoading ? "Saving..." : "Save Changes"}
              type="submit"
              disabled={isLoading}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditPage;

