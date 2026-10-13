"use client";

import Button from "@/components/globals/Button";
import { FullPageLoader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaTrash,
} from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";

const ProfileSettingsPage = () => {
  const { user, isLoading: authLoading, logout, handleApiResponse } = useAuth();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [deactivateData, setDeactivateData] = useState({
    password: "",
    reason: "",
  });

  const [deleteData, setDeleteData] = useState({
    password: "",
    confirmDelete: false,
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deactivateData.password) {
      setErrors({ password: "Password is required" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      const response = await fetch("/api/profile/deactivate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(deactivateData),
      });

      // Use the auth provider's response handler for automatic logout on token expiration
      const isValidResponse = await handleApiResponse(response);
      if (!isValidResponse) {
        // Token expired or other auth error - user will be redirected automatically
        return;
      }

      const result = await response.json();

      if (result.success) {
        setSuccess("Account deactivated successfully. You will be logged out.");
        setTimeout(() => {
          logout();
          router.push("/");
        }, 2000);
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: "Failed to deactivate account" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!deleteData.password) {
      setErrors({ password: "Password is required" });
      return;
    }

    if (!deleteData.confirmDelete) {
      setErrors({ confirm: "Please confirm account deletion" });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");
      const response = await fetch("/api/profile/deactivate", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(deleteData),
      });

      // Use the auth provider's response handler for automatic logout on token expiration
      const isValidResponse = await handleApiResponse(response);
      if (!isValidResponse) {
        // Token expired or other auth error - user will be redirected automatically
        return;
      }

      const result = await response.json();

      if (result.success) {
        setSuccess(
          "Account deleted successfully. You will be redirected to the homepage."
        );
        setTimeout(() => {
          logout();
          router.push("/");
        }, 2000);
      } else {
        setErrors({ general: result.error });
      }
    } catch (error) {
      setErrors({ general: "Failed to delete account" });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return <FullPageLoader />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-[url('/images/background2.png')] bg-cover bg-center bg-no-repeat bg-fixed min-h-screen pt-[150px] pb-[100px] font-sans text-zinc-100">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/5"
            >
              <IoArrowBack className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Account Settings
              </h1>
              <p className="text-zinc-400 text-sm mt-1">Manage your account preferences and security.</p>
            </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Account Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-xl shadow-black/20">
              <h2 className="text-white font-bold text-xl mb-6">
                Quick Actions
              </h2>

              <div className="space-y-4">
                <Button
                  text="Edit Profile"
                  link="/profile/edit"
                  secondary
                  className="w-full justify-center py-3"
                />

                <Button
                  text="Change Password"
                  link="/forgot-password"
                  secondary
                  className="w-full justify-center py-3"
                />
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-[#18181b] border border-white/5 rounded-2xl p-6 shadow-xl shadow-black/20">
              <h2 className="text-white font-bold text-xl mb-6">
                Account Information
              </h2>

              <div className="space-y-4 text-zinc-400 text-sm font-medium">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span>Email</span>
                  <span className="text-zinc-200">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span>Member since</span>
                  <span className="text-zinc-200">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span>Account status</span>
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-bold tracking-wider uppercase">Active</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span>Email verified</span>
                  <span
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                      user.emailVerified ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {user.emailVerified ? "Yes" : "No"}
                  </span>
                </div>
                {user.phone && (
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span>Phone verified</span>
                    <span
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                        user.phoneVerified
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {user.phoneVerified ? "Yes" : "No"}
                    </span>
                  </div>
                )}
                {user.isVerified && (
                  <div className="flex justify-between items-center py-2">
                    <span>Verification badge</span>
                    <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md text-[10px] font-bold tracking-wider uppercase">
                      {user.verificationBadge}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-6">
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6 shadow-xl shadow-black/20">
              <h2 className="text-rose-400 font-bold text-xl mb-6 flex items-center gap-2">
                <FaExclamationTriangle className="w-5 h-5" />
                Danger Zone
              </h2>

              <div className="space-y-4">
                {/* Deactivate Account */}
                <div className="border border-white/5 bg-[#18181b] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">
                      Deactivate Account
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      Temporarily disable your account.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                  >
                    Deactivate Account
                  </button>
                </div>

                {/* Delete Account */}
                <div className="border border-rose-500/20 bg-[#18181b] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">
                      Delete Account
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      Permanently delete your account and data.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deactivate Modal */}
        {showDeactivateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#18181b] border border-white/10 shadow-2xl rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-white font-bold text-xl mb-2">
                Deactivate Account
              </h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                Are you sure you want to deactivate your account? You can
                reactivate it later by logging in.
              </p>

              <form onSubmit={handleDeactivate} className="space-y-4">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={deactivateData.password}
                      onChange={(e) =>
                        setDeactivateData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className={`w-full bg-[#09090b] border ${
                        errors.password ? "border-rose-500" : "border-white/10"
                      } text-white text-sm py-3 px-4 pr-10 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all rounded-xl`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-rose-400 text-xs mt-1.5 font-medium">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Reason <span className="text-zinc-600">(Optional)</span>
                  </label>
                  <textarea
                    value={deactivateData.reason}
                    onChange={(e) =>
                      setDeactivateData((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    className="w-full bg-[#09090b] border border-white/10 text-white text-sm py-3 px-4 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all rounded-xl resize-none"
                    rows={3}
                    placeholder="Tell us why you're deactivating your account..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeactivateModal(false)}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-600 text-black rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Processing..." : "Deactivate"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#18181b] border border-rose-500/20 shadow-2xl rounded-2xl p-6 max-w-md w-full">
              <h3 className="text-rose-400 font-bold text-xl mb-2 flex items-center gap-2">
                <FaTrash className="w-5 h-5" />
                Delete Account
              </h3>
              <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                <strong className="text-rose-400">Warning:</strong> This action
                is permanent and cannot be undone. All your data, listings, and
                content will be permanently deleted.
              </p>

              <form onSubmit={handleDelete} className="space-y-4">
                <div>
                  <label className="block text-zinc-300 text-sm font-medium mb-2">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={deleteData.password}
                      onChange={(e) =>
                        setDeleteData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className={`w-full bg-[#09090b] border ${
                        errors.password ? "border-rose-500" : "border-white/10"
                      } text-white text-sm py-3 px-4 pr-10 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all rounded-xl`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-rose-400 text-xs mt-1.5 font-medium">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-start gap-3 bg-rose-500/5 border border-rose-500/20 p-3 rounded-xl mt-2">
                  <input
                    type="checkbox"
                    id="confirmDelete"
                    checked={deleteData.confirmDelete}
                    onChange={(e) =>
                      setDeleteData((prev) => ({
                        ...prev,
                        confirmDelete: e.target.checked,
                      }))
                    }
                    className="mt-1 w-4 h-4 text-rose-500 bg-[#09090b] border-white/20 rounded focus:ring-rose-500 focus:ring-offset-[#18181b]"
                  />
                  <label htmlFor="confirmDelete" className="text-zinc-300 text-sm cursor-pointer leading-tight">
                    I understand that this action is permanent and cannot be undone
                  </label>
                </div>
                {errors.confirm && (
                  <p className="text-rose-400 text-xs font-medium">{errors.confirm}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-sm font-bold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Deleting..." : "Delete Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
