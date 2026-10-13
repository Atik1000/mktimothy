"use client";

import { useAuth } from "@/lib/providers/auth-provider";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FaTimes, FaTrash, FaUpload, FaStar } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import toast from "react-hot-toast";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingListing?: any;
  profileUser?: any;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
}

interface Sector {
  id: string;
  name: string;
  slug: string;
}

interface FormData {
  title: string;
  description: string;
  content: string;
  businessName: string;
  businessType: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  price: string;
  priceType: string;
  currency: string;
  categoryId: string;
  sectorId: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  status: string;
  isFeatured: boolean;
  moduleType: string;
  meta: Record<string, string>;
}

const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingListing,
  profileUser,
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [featuredImageIndex, setFeaturedImageIndex] = useState(0);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    content: "",
    businessName: "",
    businessType: "",
    website: "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
    price: "",
    priceType: "FIXED",
    currency: "USD",
    categoryId: "",
    sectorId: "",
    metaTitle: "",
    metaDescription: "",
    keywords: "",
    status: "DRAFT",
    isFeatured: false,
    moduleType: "",
    meta: {},
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("Fetching categories...");
        const response = await fetch("/api/categories");
        const result = await response.json();
        console.log("Categories response:", result);

        if (result.success) {
          setCategories(result.data);
          console.log("Categories set:", result.data);
        } else {
          console.error("Failed to fetch categories:", result.error);
          setErrors({ general: "Failed to load categories" });
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        setErrors({ general: "Network error while loading categories" });
      }
    };

    const fetchSectors = async () => {
      try {
        const response = await fetch("/api/sectors");
        const result = await response.json();
        if (result.success) setSectors(result.data);
      } catch (error) {
        console.error("Error fetching sectors:", error);
      }
    };

    if (isOpen) {
      fetchCategories();
      fetchSectors();
    }
  }, [isOpen]);

  // Populate form when editing
  useEffect(() => {
    if (editingListing && isOpen) {
      setFormData({
        title: editingListing.title || "",
        description: editingListing.description || "",
        content: editingListing.content || "",
        businessName: editingListing.businessName || "",
        businessType: editingListing.businessType || "",
        website: editingListing.website || "",
        email: editingListing.email || user?.email || "",
        phone: editingListing.phone || user?.phone || "",
        address: editingListing.address || "",
        city: editingListing.city || "",
        state: editingListing.state || "",
        country: editingListing.country || "",
        zipCode: editingListing.zipCode || "",
        price: editingListing.price?.toString() || "",
        priceType: editingListing.priceType || "FIXED",
        currency: editingListing.currency || "USD",
        categoryId: editingListing.categoryId || "",
        sectorId: editingListing.sectorId || "",
        metaTitle: editingListing.metaTitle || "",
        metaDescription: editingListing.metaDescription || "",
        keywords: editingListing.keywords?.join(", ") || "",
        status: editingListing.status || "DRAFT",
        isFeatured: editingListing.isFeatured || false,
        moduleType: editingListing.meta
          ? editingListing.meta.find((m: any) => m.metaKey === "moduleType")
              ?.metaValue || ""
          : "",
        meta: editingListing.meta
          ? Object.fromEntries(
              editingListing.meta.map((m: any) => [m.metaKey, m.metaValue]),
            )
          : {},
      });

      // Set existing images if any
      if (editingListing.images && editingListing.images.length > 0) {
        setImagePreviews(editingListing.images);
        if (editingListing.listingImages) {
          const featuredIdx = editingListing.listingImages.findIndex(
            (img: any) => img.isFeatured,
          );
          setFeaturedImageIndex(featuredIdx >= 0 ? featuredIdx : 0);
        }
      }
    } else if (!editingListing && isOpen) {
      // Reset form for new listing
      setFormData({
        title: "",
        description: "",
        content: "",
        businessName: "",
        businessType: "",
        website: "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: "",
        city: "",
        state: "",
        country: "",
        zipCode: "",
        price: "",
        priceType: "FIXED",
        currency: "USD",
        categoryId: "",
        sectorId: "",
        metaTitle: "",
        metaDescription: "",
        keywords: "",
        status: "DRAFT",
        isFeatured: false,
        moduleType: "",
        meta: {},
      });
      setImages([]);
      setImagePreviews([]);
      setFeaturedImageIndex(0);
      setCurrentStep(1);
    }
  }, [editingListing, isOpen, user]);

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean,
  ) => {
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

  const handleMetaChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      meta: {
        ...prev.meta,
        [key]: value,
      },
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const MAX_FILE_SIZE = 4.5 * 1024 * 1024; // 4.5MB per file for Vercel limit
    const validFiles: File[] = [];

    for (const file of files) {
      const isValidType = file.type.startsWith("image/");
      if (!isValidType) {
        toast.error(`File ${file.name} is not an image.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast.error(`Image ${file.name} is too large. Each image must be under 4.5MB.`);
        continue;
      }

      validFiles.push(file);
    }

    setImages((prev) => [...prev, ...validFiles].slice(0, 15)); // Max 15 images

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (featuredImageIndex === index) {
      setFeaturedImageIndex(0);
    } else if (featuredImageIndex > index) {
      setFeaturedImageIndex((prev) => prev - 1);
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.moduleType)
        newErrors.moduleType = "Module type is required";
      if (!formData.title.trim()) newErrors.title = "Title is required";
      if (!formData.description.trim())
        newErrors.description = "Description is required";
      if (!formData.categoryId) newErrors.categoryId = "Category is required";
      if (!formData.sectorId) newErrors.sectorId = "Sector is required";
    }

    if (step === 2) {
      if (!formData.businessName.trim())
        newErrors.businessName = "Business name is required";
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Valid email is required";
      }
      if (formData.website && !formData.website.startsWith("http")) {
        newErrors.website = "Website must start with http:// or https://";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    const totalImages =
      images.length +
      (editingListing?.listingImages?.length ||
        editingListing?.images?.length ||
        0);
    if (totalImages < 4) {
      toast.error("A minimum of 4 images are required.");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      // First upload images if any NEW images
      let imageUrls: string[] = [];

      // Include existing images if editing
      if (editingListing && editingListing.images) {
        imageUrls = [...editingListing.images];
      } else if (editingListing && editingListing.listingImages) {
        imageUrls = editingListing.listingImages.map((i: any) => i.url);
      }

      if (images.length > 0) {
        const token =
          localStorage.getItem("auth-token") ||
          sessionStorage.getItem("auth-token");

        // Upload images individually to bypass Vercel's 4.5MB per-request payload limit
        const uploadPromises = images.map(async (image) => {
          const imageFormData = new FormData();
          imageFormData.append("images", image);

          const uploadResponse = await fetch("/api/upload/images", {
            method: "POST",
            headers: {
              ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: imageFormData,
          });

          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload ${image.name}`);
          }

          const uploadResult = await uploadResponse.json();
          return uploadResult.urls || [];
        });

        try {
          const results = await Promise.all(uploadPromises);
          // Combine all URL arrays into a single array
          const newUrls = results.flat();
          imageUrls = [...imageUrls, ...newUrls];
        } catch (error) {
          setIsLoading(false);
          toast.error("Failed to upload some images. Please ensure each image is under 4.5MB.");
          return;
        }
      }

      // Prepare listing data
      const listingData = {
        ...formData,
        meta: { ...formData.meta, moduleType: formData.moduleType },
        price: formData.price ? parseFloat(formData.price) : undefined,
        keywords: formData.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        listingImages: imageUrls.map((url, i) => ({
          url,
          isFeatured: i === featuredImageIndex,
          order: i,
        })),
        approvalStatus: "PENDING", // Set approval status to PENDING for new listings
      };

      // Use PUT for editing, POST for creating
      const url = editingListing
        ? `/api/listings/${editingListing.id}`
        : "/api/listings";
      const method = editingListing ? "PUT" : "POST";

      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(listingData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(
          editingListing
            ? "Listing updated successfully!"
            : "Listing created successfully!",
        );
        setTimeout(() => {
          onSuccess?.();
          onClose();
          // Reset form
          setCurrentStep(1);
          setFormData({
            title: "",
            description: "",
            content: "",
            businessName: "",
            businessType: "",
            website: "",
            email: user?.email || "",
            phone: user?.phone || "",
            address: "",
            city: "",
            state: "",
            country: "",
            zipCode: "",
            price: "",
            priceType: "FIXED",
            currency: "USD",
            categoryId: "",
            sectorId: "",
            metaTitle: "",
            metaDescription: "",
            keywords: "",
            status: "DRAFT",
            isFeatured: false,
            moduleType: "",
            meta: {},
          });
          setImages([]);
          setImagePreviews([]);
          setFeaturedImageIndex(0);
        }, 2000);
      } else {
        setErrors({
          general:
            result.error ||
            (editingListing
              ? "Failed to update listing"
              : "Failed to create listing"),
        });
      }
    } catch (error) {
      setErrors({ general: "Network error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const priceTypes = [
    { value: "FIXED", label: "Fixed Price" },
    { value: "HOURLY", label: "Per Hour" },
    { value: "MONTHLY", label: "Per Month" },
    { value: "YEARLY", label: "Per Year" },
    { value: "NEGOTIABLE", label: "Negotiable" },
    { value: "FREE", label: "Free" },
    { value: "CONTACT_FOR_PRICE", label: "Contact for Price" },
  ];

  const currencies = [
    { value: "USD", label: "USD ($)" },
    { value: "EUR", label: "EUR (€)" },
    { value: "GBP", label: "GBP (£)" },
    { value: "CAD", label: "CAD (C$)" },
  ];

  const businessTypes = [
    "Service Provider",
    "Retailer",
    "Manufacturer",
    "Consultant",
    "Agency",
    "Freelancer",
    "Startup",
    "Enterprise",
    "Non-Profit",
    "Other",
  ];

  const isAdminOrModerator =
    user?.role === "ADMIN" || user?.role === "MODERATOR";

  if (!isAdminOrModerator && profileUser?.approvalStatus !== "APPROVED") {
    return (
      <div
        className={` inset-0 bg-black/50 flex items-center justify-center z-[100] p-8 fixed ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div className="relative">
          <IoClose
            className="w-6 h-6 absolute top-4 right-4 text-white"
            onClick={onClose}
          />
          <div className="bg-bgdark rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <p className="text-white aabbss font-bold text-xl mb-4">
                Your account is not approved yet. Please wait for approval.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-[#09090b] border border-white/10 shadow-2xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto thin-green-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-zinc-100 font-bold text-2xl">
            {editingListing ? "Edit Listing" : "Create New Listing"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="p-6 border-b border-white/5 overflow-x-auto scrollbar pb-3">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step <= currentStep
                      ? "bg-greencolor text-white"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {step}
                </div>
                <span
                  className={`ml-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    step <= currentStep ? "text-zinc-100" : "text-zinc-500"
                  }`}
                >
                  {step === 1 && "Basic Info"}
                  {step === 2 && "Business Details"}
                  {step === 3 && "Location & Pricing"}
                  {step === 4 && "Images & SEO"}
                </span>
                {step < 4 && (
                  <div
                    className={`w-7 xsm:w-10 md:w-16 h-0.5 mx-2 xsm:mx-4 transition-colors ${
                      step < currentStep ? "bg-greencolor" : "bg-zinc-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl m-6">
            <p className="text-emerald-400 text-sm font-medium">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {errors.general && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl m-6">
            <p className="text-rose-400 text-sm font-medium">
              {errors.general}
            </p>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-zinc-100 font-bold text-xl mb-6">
                Basic Information
              </h3>

              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Listing Module *
                </label>
                <select
                  value={formData.moduleType}
                  onChange={(e) =>
                    handleInputChange("moduleType", e.target.value)
                  }
                  className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                >
                  <option value="">Select Module Type</option>
                  <option value="Investment Project">
                    Investment Project Seeking Capital
                  </option>
                  <option value="Business for Sale">Business for Sale</option>
                  <option value="Joint Venture">
                    Joint Venture Opportunity
                  </option>
                  <option value="Bankable Project">Bankable Project</option>
                </select>
                {errors.moduleType && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.moduleType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Listing Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                  placeholder="Enter a compelling title for your listing"
                />
                {errors.title && (
                  <p className="text-red-400 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl resize-none"
                  rows={4}
                  placeholder="Describe your business or service..."
                />
                {errors.description && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Category *
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    handleInputChange("categoryId", e.target.value)
                  }
                  className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.categoryId}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Sector *
                </label>
                <select
                  value={formData.sectorId}
                  onChange={(e) =>
                    handleInputChange("sectorId", e.target.value)
                  }
                  className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                >
                  <option value="">Select a sector</option>
                  {sectors.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
                {errors.sectorId && (
                  <p className="text-red-400 text-sm mt-1">{errors.sectorId}</p>
                )}
              </div>

              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Detailed Content (Optional)
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl resize-none"
                  rows={6}
                  placeholder="Add more detailed information about your business..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Business Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-zinc-100 font-bold text-xl mb-6">
                Business Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      handleInputChange("businessName", e.target.value)
                    }
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                    placeholder="Your business name"
                  />
                  {errors.businessName && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.businessName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Business Type
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) =>
                      handleInputChange("businessType", e.target.value)
                    }
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                  >
                    <option value="">Select business type</option>
                    {businessTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                    placeholder="business@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      handleInputChange("website", e.target.value)
                    }
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                    placeholder="https://www.yourbusiness.com"
                  />
                  {errors.website && (
                    <p className="text-red-400 text-sm mt-1">
                      {errors.website}
                    </p>
                  )}
                </div>

                {/* Dynamic Module Fields */}
                {formData.moduleType === "Investment Project" && (
                  <>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Business Age
                      </label>
                      <select
                        value={formData.meta.businessAge || ""}
                        onChange={(e) =>
                          handleMetaChange("businessAge", e.target.value)
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Age</option>
                        <option value="Less than 1 year">
                          Less than 1 year
                        </option>
                        <option value="1 to 3 years">1 to 3 years</option>
                        <option value="3 to 5 years">3 to 5 years</option>
                        <option value="5 to 10 years">5 to 10 years</option>
                        <option value="More than 10 years">
                          More than 10 years
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Profitability Status
                      </label>
                      <select
                        value={formData.meta.profitabilityStatus || ""}
                        onChange={(e) =>
                          handleMetaChange(
                            "profitabilityStatus",
                            e.target.value,
                          )
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Status</option>
                        <option value="Pre-revenue">Pre-revenue</option>
                        <option value="Profitable">Profitable</option>
                        <option value="Break-even">Break-even</option>
                        <option value="Loss-making">Loss-making</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Employee Count
                      </label>
                      <select
                        value={formData.meta.employeeCount || ""}
                        onChange={(e) =>
                          handleMetaChange("employeeCount", e.target.value)
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Count</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="500+">500+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Run Rate
                      </label>
                      <select
                        value={formData.meta.runRate || ""}
                        onChange={(e) =>
                          handleMetaChange("runRate", e.target.value)
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Run Rate</option>
                        <option value="< $100k">&lt; $100k</option>
                        <option value="$100k - $500k">$100k - $500k</option>
                        <option value="$500k - $1M">$500k - $1M</option>
                        <option value="$1M - $5M">$1M - $5M</option>
                        <option value="$5M+">$5M+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Stage
                      </label>
                      <select
                        value={formData.meta.stage || ""}
                        onChange={(e) =>
                          handleMetaChange("stage", e.target.value)
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Stage</option>
                        <option value="Seed">Seed</option>
                        <option value="Early Stage">Early Stage</option>
                        <option value="Growth">Growth</option>
                        <option value="Expansion">Expansion</option>
                        <option value="Mature">Mature</option>
                      </select>
                    </div>
                  </>
                )}

                {formData.moduleType === "Business for Sale" && (
                  <>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Business Age
                      </label>
                      <select
                        value={formData.meta.businessAge || ""}
                        onChange={(e) =>
                          handleMetaChange("businessAge", e.target.value)
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Age</option>
                        <option value="Less than 1 year">
                          Less than 1 year
                        </option>
                        <option value="1 to 3 years">1 to 3 years</option>
                        <option value="3 to 5 years">3 to 5 years</option>
                        <option value="5 to 10 years">5 to 10 years</option>
                        <option value="More than 10 years">
                          More than 10 years
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Profitability Status
                      </label>
                      <select
                        value={formData.meta.profitabilityStatus || ""}
                        onChange={(e) =>
                          handleMetaChange(
                            "profitabilityStatus",
                            e.target.value,
                          )
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Status</option>
                        <option value="Pre-revenue">Pre-revenue</option>
                        <option value="Profitable">Profitable</option>
                        <option value="Break-even">Break-even</option>
                        <option value="Loss-making">Loss-making</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Employee Count
                      </label>
                      <select
                        value={formData.meta.employeeCount || ""}
                        onChange={(e) =>
                          handleMetaChange("employeeCount", e.target.value)
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Count</option>
                        <option value="1-10">1-10</option>
                        <option value="11-50">11-50</option>
                        <option value="51-200">51-200</option>
                        <option value="201-500">201-500</option>
                        <option value="500+">500+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Run Rate
                      </label>
                      <select
                        value={formData.meta.runRate || ""}
                        onChange={(e) =>
                          handleMetaChange("runRate", e.target.value)
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Run Rate</option>
                        <option value="< $100k">&lt; $100k</option>
                        <option value="$100k - $500k">$100k - $500k</option>
                        <option value="$500k - $1M">$500k - $1M</option>
                        <option value="$1M - $5M">$1M - $5M</option>
                        <option value="$5M+">$5M+</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Reason for Selling
                      </label>
                      <select
                        value={formData.meta.reasonForSelling || ""}
                        onChange={(e) =>
                          handleMetaChange("reasonForSelling", e.target.value)
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Reason</option>
                        <option value="Retirement">Retirement</option>
                        <option value="Relocation">Relocation</option>
                        <option value="New Venture">New Venture</option>
                        <option value="Financial Issues">
                          Financial Issues
                        </option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Business Status
                      </label>
                      <select
                        value={formData.meta.businessStatus || ""}
                        onChange={(e) =>
                          handleMetaChange("businessStatus", e.target.value)
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Status</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Franchise">Franchise</option>
                        <option value="Independent">Independent</option>
                      </select>
                    </div>
                  </>
                )}

                {formData.moduleType === "Joint Venture" && (
                  <>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Partner Contribution
                      </label>
                      <select
                        value={formData.meta.partnerContribution || ""}
                        onChange={(e) =>
                          handleMetaChange(
                            "partnerContribution",
                            e.target.value,
                          )
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Contribution</option>
                        <option value="Capital">Capital</option>
                        <option value="Land/Real Estate">
                          Land/Real Estate
                        </option>
                        <option value="Technology/IP">Technology/IP</option>
                        <option value="Operations/Management">
                          Operations/Management
                        </option>
                        <option value="Market Access">Market Access</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        JV Structure
                      </label>
                      <select
                        value={formData.meta.jvStructure || ""}
                        onChange={(e) =>
                          handleMetaChange("jvStructure", e.target.value)
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Structure</option>
                        <option value="50/50 Equity">50/50 Equity</option>
                        <option value="Minority Stake">Minority Stake</option>
                        <option value="Majority Stake">Majority Stake</option>
                        <option value="Revenue Share">Revenue Share</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Project Stage
                      </label>
                      <select
                        value={formData.meta.projectStage || ""}
                        onChange={(e) =>
                          handleMetaChange("projectStage", e.target.value)
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Stage</option>
                        <option value="Concept/Idea">Concept/Idea</option>
                        <option value="Feasibility Study">
                          Feasibility Study
                        </option>
                        <option value="Ready to Launch">Ready to Launch</option>
                        <option value="Operational">Operational</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Partnership Duration
                      </label>
                      <select
                        value={formData.meta.partnershipDuration || ""}
                        onChange={(e) =>
                          handleMetaChange(
                            "partnershipDuration",
                            e.target.value,
                          )
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Duration</option>
                        <option value="Short-term">Short-term</option>
                        <option value="Long-term">Long-term</option>
                        <option value="Open-ended">Open-ended</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Expected Partner Role
                      </label>
                      <select
                        value={formData.meta.expectedPartnerRole || ""}
                        onChange={(e) =>
                          handleMetaChange(
                            "expectedPartnerRole",
                            e.target.value,
                          )
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Role</option>
                        <option value="Passive Investor">
                          Passive Investor
                        </option>
                        <option value="Active Management">
                          Active Management
                        </option>
                        <option value="Technical Partner">
                          Technical Partner
                        </option>
                        <option value="Strategic Advisor">
                          Strategic Advisor
                        </option>
                      </select>
                    </div>
                  </>
                )}

                {formData.moduleType === "Bankable Project" && (
                  <>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Project Type
                      </label>
                      <select
                        value={formData.meta.projectType || ""}
                        onChange={(e) =>
                          handleMetaChange("projectType", e.target.value)
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Type</option>
                        <option value="Infrastructure">Infrastructure</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Energy">Energy</option>
                        <option value="Technology">Technology</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Agriculture">Agriculture</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Investment Type
                      </label>
                      <select
                        value={formData.meta.investmentType || ""}
                        onChange={(e) =>
                          handleMetaChange("investmentType", e.target.value)
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Investment Type</option>
                        <option value="Debt Financing">Debt Financing</option>
                        <option value="Equity Investment">
                          Equity Investment
                        </option>
                        <option value="Mezzanine Financing">
                          Mezzanine Financing
                        </option>
                        <option value="Grant/Subsidies">Grant/Subsidies</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Proposed Investment
                      </label>
                      <select
                        value={formData.meta.proposedInvestment || ""}
                        onChange={(e) =>
                          handleMetaChange("proposedInvestment", e.target.value)
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Investment</option>
                        <option value="Minority Stake">Minority Stake</option>
                        <option value="Majority Stake">Majority Stake</option>
                        <option value="Full Acquisition">
                          Full Acquisition
                        </option>
                        <option value="Project Finance">Project Finance</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-zinc-300 text-sm font-medium mb-2">
                        Financing Type
                      </label>
                      <select
                        value={formData.meta.financingType || ""}
                        onChange={(e) =>
                          handleMetaChange("financingType", e.target.value)
                        }
                        className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                      >
                        <option value="">Select Financing</option>
                        <option value="Seed Capital">Seed Capital</option>
                        <option value="Series A/B/C">Series A/B/C</option>
                        <option value="Bridge Loan">Bridge Loan</option>
                        <option value="Working Capital">Working Capital</option>
                        <option value="Asset Financing">Asset Financing</option>
                      </select>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Location & Pricing */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-zinc-100 font-bold text-xl mb-6">
                Location & Pricing
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                    placeholder="State or Province"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                    placeholder="Country"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    ZIP/Postal Code
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) =>
                      handleInputChange("zipCode", e.target.value)
                    }
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                    placeholder="ZIP or Postal Code"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Price
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Price Type
                  </label>
                  <select
                    value={formData.priceType}
                    onChange={(e) =>
                      handleInputChange("priceType", e.target.value)
                    }
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                  >
                    {priceTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      handleInputChange("currency", e.target.value)
                    }
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                  >
                    {currencies.map((currency) => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Images & SEO */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-zinc-100 font-bold text-xl mb-6">
                Images & SEO
              </h3>

              {/* Image Upload */}
              <div>
                <label className="block text-zinc-300 text-sm font-medium mb-2">
                  Images (Max 15)
                </label>
                <div className="border border-dashed border-white/20 bg-zinc-900/30 rounded-xl p-8 text-center hover:border-greencolor/50 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <FaUpload className="w-8 h-8 text-gray-400" />
                    <span className="text-gray-400">
                      Click to upload images or drag and drop
                    </span>
                    <span className="text-gray-500 text-sm">
                      PNG, JPG, GIF up to 4.5MB each
                    </span>
                  </label>
                </div>
                {errors.images && (
                  <p className="text-red-400 text-sm mt-1">{errors.images}</p>
                )}

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          width={150}
                          height={150}
                          className={`w-full h-32 object-cover rounded-lg ${featuredImageIndex === index ? "ring-2 ring-yellow-500" : ""}`}
                        />
                        <button
                          type="button"
                          onClick={() => setFeaturedImageIndex(index)}
                          className={`absolute top-2 left-2 text-white rounded-full p-1 ${featuredImageIndex === index ? "bg-yellow-500" : "bg-gray-600 hover:bg-gray-500"}`}
                          title={
                            featuredImageIndex === index
                              ? "Featured Image"
                              : "Set as Featured Image"
                          }
                        >
                          <FaStar className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SEO Fields */}
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Meta Title (SEO)
                  </label>
                  <input
                    type="text"
                    value={formData.metaTitle}
                    onChange={(e) =>
                      handleInputChange("metaTitle", e.target.value)
                    }
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                    placeholder="SEO title for search engines"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Meta Description (SEO)
                  </label>
                  <textarea
                    value={formData.metaDescription}
                    onChange={(e) =>
                      handleInputChange("metaDescription", e.target.value)
                    }
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl resize-none"
                    rows={3}
                    placeholder="Brief description for search engines"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.keywords}
                    onChange={(e) =>
                      handleInputChange("keywords", e.target.value)
                    }
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                    className="w-full bg-zinc-900/50 border border-white/10 text-zinc-100 text-[15px] py-2.5 px-3 focus:outline-none focus:border-greencolor focus:ring-1 focus:ring-greencolor transition-all rounded-xl"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Active</option>
                    <option value="UNDER_OFFER">Under Offer</option>
                    <option value="SOLD">Sold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Featured Listing
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        handleInputChange("isFeatured", e.target.checked)
                      }
                      className="w-5 h-5 text-greencolor bg-transparent border-2 border-lightgray rounded focus:ring-greencolor focus:ring-2"
                    />
                    <span className="text-white aabbss text-sm">
                      Mark this listing as featured (will be displayed
                      prominently)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/5 bg-zinc-900/20">
          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={handlePrev}
                disabled={isLoading}
                className="bg-zinc-800 text-zinc-300 px-6 py-2 rounded-xl hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-50 font-medium"
              >
                Previous
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                disabled={isLoading}
                className="bg-greencolor text-white font-semibold px-6 py-2 rounded-xl hover:bg-greencolor/90 transition-all disabled:opacity-50"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-greencolor text-white font-semibold px-6 py-2 rounded-xl hover:bg-greencolor/90 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
              >
                {isLoading
                  ? editingListing
                    ? "Updating..."
                    : "Creating..."
                  : editingListing
                    ? "Update Listing"
                    : "Create Listing"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListingModal;
