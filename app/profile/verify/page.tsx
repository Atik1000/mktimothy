"use client";

import Button from "@/components/globals/Button";
import { FullPageLoader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaCertificate,
  FaCheck,
  FaClock,
  FaFilePdf,
  FaImage,
  FaTimes,
  FaUpload,
} from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";

const ProfileVerifyPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [verificationHistory, setVerificationHistory] = useState<any[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentPreviews, setDocumentPreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    verificationType: "BLUE",
    reason: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load verification status
  useEffect(() => {
    if (user) {
      loadVerificationStatus();
    }
  }, [user]);

  const loadVerificationStatus = async () => {
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      const response = await fetch("/api/profile/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setVerificationHistory(result.data.history || []);
        }
      }
    } catch (error) {
      console.error("Failed to load verification status:", error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate files
    const validFiles: File[] = [];
    const previews: string[] = [];

    files.forEach((file) => {
      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ documents: "Please upload only PNG, JPG, or PDF files" });
        return;
      }

      // Check file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setErrors({ documents: "File size must be less than 10MB" });
        return;
      }

      validFiles.push(file);

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          previews.push(e.target?.result as string);
          setDocumentPreviews([...documentPreviews, ...previews]);
        };
        reader.readAsDataURL(file);
      } else {
        // For PDFs, just add a placeholder
        previews.push("pdf");
        setDocumentPreviews([...documentPreviews, ...previews]);
      }
    });

    if (validFiles.length > 0) {
      setDocuments([...documents, ...validFiles]);
      setErrors({ ...errors, documents: "" });
    }
  };

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    const newPreviews = documentPreviews.filter((_, i) => i !== index);
    setDocuments(newDocuments);
    setDocumentPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      setErrors({ reason: "Please provide a reason for verification" });
      return;
    }

    if (documents.length === 0) {
      setErrors({
        documents: "Please upload at least one supporting document",
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      // Create FormData to handle file uploads
      const formDataToSend = new FormData();
      formDataToSend.append("verificationType", formData.verificationType);
      formDataToSend.append("reason", formData.reason);

      // Append all documents
      documents.forEach((file, index) => {
        formDataToSend.append(`documents`, file);
      });

      const response = await fetch("/api/profile/verify", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(
          "Verification request submitted successfully! You will be notified once reviewed.",
        );
        setFormData({ verificationType: "BLUE", reason: "" });
        setDocuments([]);
        setDocumentPreviews([]);
        loadVerificationStatus();
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: "Failed to submit verification request" });
    } finally {
      setIsLoading(false);
    }
  };

  const verificationTypes = [
    {
      type: "BLUE",
      name: "Personal Verification",
      description: "Verify your identity with government-issued ID",
      icon: <FaCheck className="w-6 h-6" />,
      color: "blue",
    },
    {
      type: "GREEN",
      name: "Business Verification",
      description: "Verify your business with official business documents",
      icon: <FaCertificate className="w-6 h-6" />,
      color: "green",
    },
    {
      type: "GOLD",
      name: "Premium Verification",
      description: "Highest tier verification for established businesses",
      icon: <FaCertificate className="w-6 h-6" />,
      color: "yellow",
    },
  ];

  if (authLoading) {
    return <FullPageLoader message="Loading verification form..." />;
  }

  return (
    <div className="bg-[url('/images/background2.png')] bg-cover bg-center bg-no-repeat bg-fixed min-h-screen pt-[150px] pb-[100px]">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8">
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
              Profile Verification
            </h1>
          </div>
        </div>

        {/* Current Status */}
        {user?.isVerified && (
          <div className="mb-8 p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="flex items-center gap-3">
              <FaCheck className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="text-green-400 aabbss font-bold text-lg">
                  Verified Account
                </h3>
                <p className="text-green-300">
                  Your account is verified with a {user.verificationBadge} badge
                </p>
              </div>
            </div>
          </div>
        )}

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Verification Request Form */}
          <div className="bg-[#2C2C2C] rounded-lg p-6">
            <h2 className="text-white aabbss font-bold text-xl mb-6">
              Request Verification
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Verification Type */}
              <div>
                <label className="block text-white aabbss font-medium mb-4">
                  Verification Type *
                </label>
                <div className="space-y-3">
                  {verificationTypes.map((type) => (
                    <label
                      key={type.type}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        formData.verificationType === type.type
                          ? "border-greencolor bg-greencolor/10"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                    >
                      <input
                        type="radio"
                        name="verificationType"
                        value={type.type}
                        checked={formData.verificationType === type.type}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            verificationType: e.target.value,
                          }))
                        }
                        className="sr-only"
                      />
                      <div className="flex items-start gap-3">
                        <div className="text-greencolor">{type.icon}</div>
                        <div>
                          <h4 className="text-white aabbss font-medium">
                            {type.name}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-white aabbss font-medium mb-2">
                  Reason for Verification *
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  className={`w-full bg-transparent border-2 ${
                    errors.reason ? "border-red-500" : "border-lightgray"
                  } text-white aabbss text-lg py-2 px-3 focus:outline-none focus:border-greencolor transition-colors rounded-lg resize-none`}
                  rows={4}
                  placeholder="Explain why you need verification and how it will benefit your users..."
                />
                {errors.reason && (
                  <p className="text-red-400 text-sm mt-1">{errors.reason}</p>
                )}
              </div>

              {/* Document Upload */}
              <div>
                <label className="block text-white aabbss font-medium mb-2">
                  Supporting Documents *
                </label>
                <div className="space-y-4">
                  {/* File Input */}
                  <div>
                    <input
                      type="file"
                      id="document-upload"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="document-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-lightgray rounded-lg cursor-pointer hover:border-greencolor transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FaUpload className="w-8 h-8 mb-4 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-400">
                          PNG, JPG or PDF (MAX. 10MB each)
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Document Previews */}
                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-white aabbss font-medium text-sm">
                        Uploaded Documents ({documents.length})
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {documents.map((file, index) => (
                          <div
                            key={index}
                            className="relative bg-gray-700 rounded-lg p-3"
                          >
                            <div className="flex items-center gap-3">
                              {file.type.startsWith("image/") ? (
                                <div className="w-12 h-12 rounded overflow-hidden bg-gray-600">
                                  {documentPreviews[index] &&
                                  documentPreviews[index] !== "pdf" ? (
                                    <img
                                      src={documentPreviews[index]}
                                      alt="Preview"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <FaImage className="w-6 h-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded bg-red-600 flex items-center justify-center">
                                  <FaFilePdf className="w-6 h-6 text-white" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">
                                  {file.name}
                                </p>
                                <p className="text-gray-400 text-xs">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeDocument(index)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <FaTimes className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {errors.documents && (
                    <p className="text-red-400 text-sm">{errors.documents}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                text={
                  isLoading ? "Submitting..." : "Submit Verification Request"
                }
                type="submit"
                disabled={isLoading}
              />
            </form>
          </div>

          {/* Verification History */}
          <div className="bg-[#2C2C2C] rounded-lg p-6">
            <h2 className="text-white aabbss font-bold text-xl mb-6">
              Verification History
            </h2>

            {verificationHistory.length === 0 ? (
              <div className="text-center py-8">
                <FaClock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No verification requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {verificationHistory.map((request, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-600 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white aabbss font-medium">
                        {request.data?.verificationType} Verification
                      </h4>
                      <div className="flex items-center gap-2">
                        <FaClock className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-400 capitalize">
                          {request.data?.status || "Pending"}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {request.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileVerifyPage;

