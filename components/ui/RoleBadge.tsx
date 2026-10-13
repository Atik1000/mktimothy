import {
  ROLE_BG_COLORS,
  ROLE_COLORS,
  ROLE_DISPLAY_NAMES,
  UserRole,
} from "@/lib/utils/permissions";

interface RoleBadgeProps {
  role: UserRole;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "solid";
  className?: string;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  size = "md",
  variant = "default",
  className = "",
}) => {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const getVariantClasses = () => {
    const baseColor = ROLE_COLORS[role];
    const bgColor = ROLE_BG_COLORS[role];

    switch (variant) {
      case "outline":
        return `border ${bgColor.split(" ")[1]} ${baseColor} bg-transparent`;
      case "solid":
        return `${bgColor.replace("/20", "")} text-white border-0`;
      default:
        return `${bgColor} ${baseColor} border`;
    }
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center
        rounded-full font-medium
        ${sizeClasses[size]}
        ${getVariantClasses()}
        ${className}
      `}
    >
      {ROLE_DISPLAY_NAMES[role]}
    </span>
  );
};

export default RoleBadge;
