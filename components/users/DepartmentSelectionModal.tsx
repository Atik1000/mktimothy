"use client";

import { useEffect } from "react";
import { FiX } from "react-icons/fi";

export type Department =
  | "CUSTOMER_SUPPORT"
  | "CONTENT_MODERATION"
  | "BUSINESS_DEVELOPMENT"
  | "TECHNICAL_SUPPORT";

interface DepartmentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (department: Department) => void;
  userName: string;
}

const DEPARTMENT_INFO = {
  CUSTOMER_SUPPORT: {
    name: "Customer Support",
    description: "Handle user inquiries, complaints, and provide assistance",
    icon: "👥",
  },
  CONTENT_MODERATION: {
    name: "Content Moderation",
    description: "Review and moderate user-generated content for compliance",
    icon: "🛡️",
  },
  BUSINESS_DEVELOPMENT: {
    name: "Business Development",
    description: "Manage business partnerships and growth initiatives",
    icon: "📈",
  },
  TECHNICAL_SUPPORT: {
    name: "Technical Support",
    description: "Provide technical assistance and resolve system issues",
    icon: "🔧",
  },
};

const DepartmentSelectionModal: React.FC<DepartmentSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
}) => {
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

  const handleDepartmentSelect = (department: Department) => {
    onConfirm(department);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#2C2C2C] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div>
            <h3 className="text-white aabbss font-bold text-xl">
              Select Department
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              Choose a department for{" "}
              <span className="text-white font-medium">{userName}</span> as a
              moderator
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
        <div className="p-6">
          <div className="grid gap-4">
            {(Object.keys(DEPARTMENT_INFO) as Department[]).map(
              (department) => (
                <button
                  key={department}
                  onClick={() => handleDepartmentSelect(department)}
                  className="w-full p-4 text-left bg-bgdark hover:bg-white/10 rounded-lg border border-white/20 transition-all duration-200 hover:border-greencolor/50 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">
                      {DEPARTMENT_INFO[department].icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-lg mb-1 group-hover:text-greencolor transition-colors">
                        {DEPARTMENT_INFO[department].name}
                      </div>
                      <div className="text-gray-400 text-sm leading-relaxed">
                        {DEPARTMENT_INFO[department].description}
                      </div>
                    </div>
                    <div className="text-gray-500 group-hover:text-greencolor transition-colors">
                      →
                    </div>
                  </div>
                </button>
              )
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-white/20">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepartmentSelectionModal;
