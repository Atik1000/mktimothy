"use client";

import { FullPageLoader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/providers/auth-provider";
import {
    UserRole,
    canAccessDashboard,
    hasPermission,
} from "@/lib/utils/permissions";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: {
    resource: string;
    action: string;
  };
  requireDashboardAccess?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
  showFallback?: boolean;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  requireDashboardAccess = false,
  fallback,
  redirectTo = "/login",
  showFallback = true,
}) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
      return;
    }

    if (!isLoading && user) {
      // Check role requirements
      if (allowedRoles && !allowedRoles.includes(user.role as any)) {
        if (showFallback) return;
        router.push("/");
        return;
      }

      // Check permission requirements
      if (
        requiredPermission &&
        !hasPermission(
          user as any,
          requiredPermission.resource,
          requiredPermission.action,
        )
      ) {
        if (showFallback) return;
        router.push("/");
        return;
      }

      // Check dashboard access
      if (requireDashboardAccess && !canAccessDashboard(user as any)) {
        if (showFallback) return;
        router.push("/");
        return;
      }
    }
  }, [
    user,
    isLoading,
    allowedRoles,
    requiredPermission,
    requireDashboardAccess,
    router,
    redirectTo,
    showFallback,
  ]);

  // Show loading state
  if (isLoading) {
    return <FullPageLoader message="Checking permissions..." />;
  }

  // Show fallback if user doesn't have access
  if (!user) {
    return showFallback && fallback ? <>{fallback}</> : null;
  }

  // Check role requirements
  if (allowedRoles && !allowedRoles.includes(user?.role as any)) {
    return showFallback && fallback ? (
      <>{fallback}</>
    ) : (
      <div className="bg-bglight min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">
            You don't have permission to access this area.
          </p>
        </div>
      </div>
    );
  }

  // Check permission requirements
  if (
    requiredPermission &&
    !hasPermission(
      user as any,
      requiredPermission.resource,
      requiredPermission.action,
    )
  ) {
    return showFallback && fallback ? (
      <>{fallback}</>
    ) : (
      <div className="bg-bglight min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">
            You don't have permission to perform this action.
          </p>
        </div>
      </div>
    );
  }

  // Check dashboard access
  if (requireDashboardAccess && !canAccessDashboard(user as any)) {
    return showFallback && fallback ? (
      <>{fallback}</>
    ) : (
      <div className="bg-bglight min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">
            You don't have permission to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleGuard;

// Convenience components for common use cases
export const AdminGuard: React.FC<Omit<RoleGuardProps, "allowedRoles">> = (
  props,
) => <RoleGuard {...props} allowedRoles={["ADMIN"]} />;

export const ModeratorGuard: React.FC<Omit<RoleGuardProps, "allowedRoles">> = (
  props,
) => <RoleGuard {...props} allowedRoles={["MODERATOR", "ADMIN"]} />;

export const DashboardGuard: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return <RoleGuard requireDashboardAccess={true}>{children}</RoleGuard>;
};

