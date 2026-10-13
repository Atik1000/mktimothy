"use client";

import { useEffect, useState } from "react";
import { FiX, FiCheck } from "react-icons/fi";

export type SubAdminPermission =
  | "manage-blogs"
  | "manage-listings"
  | "manage-users"
  | "manage-assignments";

interface PermissionsSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (permissions: SubAdminPermission[]) => void;
  userName: string;
  initialPermissions?: SubAdminPermission[];
}

const PERMISSION_INFO = {
  "manage-blogs": {
    name: "Manage Blogs",
    description: "Create, edit, and moderate blog posts",
    icon: "📝",
  },
  "manage-listings": {
    name: "Manage Listings",
    description: "Approve, reject, and moderate property/business listings",
    icon: "🏢",
  },
  "manage-users": {
    name: "Manage Users",
    description: "View users, change roles, and handle account suspensions",
    icon: "👥",
  },
  "manage-assignments": {
    name: "Manage Assignments",
    description: "Assign moderators to users for chat support",
    icon: "📋",
  },
};

const PermissionsSelectionModal: React.FC<PermissionsSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  initialPermissions = [],
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<SubAdminPermission[]>(
    initialPermissions
  );

  // Update selected permissions when modal opens with new initial permissions
  useEffect(() => {
    if (isOpen) {
      setSelectedPermissions(initialPermissions);
    }
  }, [isOpen, initialPermissions]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "hidden"; // Prevent background scroll
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const togglePermission = (permission: SubAdminPermission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedPermissions);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2C2C2C] rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20 shrink-0">
          <div>
            <h3 className="text-white font-bold text-xl">
              Assign Sub-Admin Permissions
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Select permissions for <span className="text-white font-medium">{userName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2"
            aria-label="Close modal"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="grid gap-4">
            {(Object.keys(PERMISSION_INFO) as SubAdminPermission[]).map(
              (permission) => {
                const isSelected = selectedPermissions.includes(permission);
                return (
                  <button
                    key={permission}
                    onClick={() => togglePermission(permission)}
                    className={`w-full p-4 text-left rounded-lg border transition-all duration-200 group flex items-center justify-between ${
                      isSelected
                        ? "bg-greencolor/10 border-greencolor"
                        : "bg-bgdark hover:bg-white/10 border-white/20 hover:border-white/40"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-2xl">
                        {PERMISSION_INFO[permission].icon}
                      </div>
                      <div className="flex-1">
                        <div className={`font-medium text-lg mb-1 transition-colors ${
                          isSelected ? "text-greencolor" : "text-white group-hover:text-gray-200"
                        }`}>
                          {PERMISSION_INFO[permission].name}
                        </div>
                        <div className="text-gray-400 text-sm leading-relaxed">
                          {PERMISSION_INFO[permission].description}
                        </div>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-greencolor border-greencolor text-white"
                        : "border-gray-500 text-transparent"
                    }`}>
                      <FiCheck size={16} />
                    </div>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-white/20 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-greencolor text-white rounded-lg hover:bg-greencolor/90 transition-colors font-medium"
          >
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
};

export default PermissionsSelectionModal;
