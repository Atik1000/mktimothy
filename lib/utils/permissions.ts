export type UserRole = "USER" | "ADMIN" | "MODERATOR" | "INVESTOR";

export interface Permission {
  resource: string;
  action: string;
}

export interface User {
  id: string;
  role: UserRole;
  email: string;
  firstName: string;
  lastName: string;
}

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  USER: [
    { resource: "profile", action: "read" },
    { resource: "profile", action: "update" },
    { resource: "listings", action: "read" },
    { resource: "listings", action: "create" },
    { resource: "listings", action: "update_own" },
    { resource: "listings", action: "delete_own" },
    { resource: "blogs", action: "read" },
    { resource: "blogs", action: "create" },
    { resource: "blogs", action: "update_own" },
    { resource: "blogs", action: "delete_own" },
    { resource: "chats", action: "read" },
    { resource: "chats", action: "create" },
    { resource: "reviews", action: "create" },
    { resource: "reviews", action: "update_own" },
    { resource: "reviews", action: "delete_own" },
    { resource: "categories", action: "read" },
  ],
  INVESTOR: [
    { resource: "profile", action: "read" },
    { resource: "profile", action: "update" },
    { resource: "listings", action: "read" },
    { resource: "blogs", action: "read" },
    { resource: "chats", action: "read" },
    { resource: "chats", action: "create" },
    { resource: "reviews", action: "create" },
    { resource: "reviews", action: "update_own" },
    { resource: "reviews", action: "delete_own" },
    { resource: "categories", action: "read" },
  ],
  MODERATOR: [
    // All USER permissions
    ...([] as Permission[]), // Will be filled programmatically
    // Additional MODERATOR permissions
    { resource: "listings", action: "moderate" },
    { resource: "listings", action: "approve" },
    { resource: "listings", action: "reject" },
    { resource: "listings", action: "suspend" },
    { resource: "blogs", action: "moderate" },
    { resource: "blogs", action: "approve" },
    { resource: "blogs", action: "reject" },
    { resource: "blogs", action: "suspend" },
    { resource: "users", action: "read" },
    { resource: "users", action: "suspend" },
    { resource: "reviews", action: "moderate" },
    { resource: "reviews", action: "delete" },
    { resource: "reports", action: "read" },
    { resource: "reports", action: "resolve" },
    { resource: "dashboard", action: "access_moderator" },
  ],
  ADMIN: [
    // All MODERATOR permissions
    ...([] as Permission[]), // Will be filled programmatically
    // Additional ADMIN permissions
    { resource: "users", action: "create" },
    { resource: "users", action: "update" },
    { resource: "users", action: "delete" },
    { resource: "users", action: "change_role" },
    { resource: "listings", action: "delete" },
    { resource: "blogs", action: "delete" },
    { resource: "categories", action: "create" },
    { resource: "categories", action: "update" },
    { resource: "categories", action: "delete" },
    { resource: "settings", action: "read" },
    { resource: "settings", action: "update" },
    { resource: "analytics", action: "read" },
    { resource: "dashboard", action: "access_admin" },
    { resource: "system", action: "manage" },
  ],
};

// Fill in inherited permissions
ROLE_PERMISSIONS.MODERATOR = [
  ...ROLE_PERMISSIONS.USER,
  ...ROLE_PERMISSIONS.MODERATOR.filter(
    (p) =>
      !ROLE_PERMISSIONS.USER.some(
        (up) => up.resource === p.resource && up.action === p.action
      )
  ),
];
ROLE_PERMISSIONS.ADMIN = [
  ...ROLE_PERMISSIONS.MODERATOR,
  ...ROLE_PERMISSIONS.ADMIN.filter(
    (p) =>
      !ROLE_PERMISSIONS.MODERATOR.some(
        (mp) => mp.resource === p.resource && mp.action === p.action
      )
  ),
];

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  user: User | null,
  resource: string,
  action: string
): boolean {
  if (!user) return false;

  const permissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.some(
    (p) => p.resource === resource && p.action === action
  );
}

/**
 * Check if a user has any of the specified roles
 */
export function hasRole(
  user: User | null,
  roles: UserRole | UserRole[]
): boolean {
  if (!user) return false;

  const roleArray = Array.isArray(roles) ? roles : [roles];
  return roleArray.includes(user.role);
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, "ADMIN");
}

/**
 * Check if a user is a moderator or admin
 */
export function isModerator(user: User | null): boolean {
  return hasRole(user, ["MODERATOR", "ADMIN"]);
}

/**
 * Check if a user can access the dashboard
 */
export function canAccessDashboard(user: User | null): boolean {
  return (
    hasPermission(user, "dashboard", "access_moderator") ||
    hasPermission(user, "dashboard", "access_admin")
  );
}

/**
 * Check if a user can manage other users
 */
export function canManageUsers(user: User | null): boolean {
  return (
    hasPermission(user, "users", "update") ||
    hasPermission(user, "users", "delete")
  );
}

/**
 * Check if a user can moderate content
 */
export function canModerateContent(user: User | null): boolean {
  return (
    hasPermission(user, "listings", "moderate") ||
    hasPermission(user, "blogs", "moderate")
  );
}

/**
 * Get all permissions for a user's role
 */
export function getUserPermissions(user: User | null): Permission[] {
  if (!user) return [];
  return ROLE_PERMISSIONS[user.role] || [];
}

/**
 * Get role hierarchy level (higher number = more permissions)
 */
export function getRoleLevel(role: UserRole): number {
  const levels = {
    USER: 1,
    INVESTOR: 1,
    MODERATOR: 2,
    ADMIN: 3,
  };
  return levels[role] || 0;
}

/**
 * Check if a user can perform an action on another user
 */
export function canActOnUser(actor: User | null, target: User | null): boolean {
  if (!actor || !target) return false;

  // Users can only act on themselves
  if (actor.role === "USER") {
    return actor.id === target.id;
  }

  // Moderators can act on users but not other moderators or admins
  if (actor.role === "MODERATOR") {
    return target.role === "USER";
  }

  // Admins can act on everyone including other admins and moderators
  if (actor.role === "ADMIN") {
    return true;
  }

  return false;
}

/**
 * Get available roles that a user can assign to others
 */
export function getAssignableRoles(user: User | null): UserRole[] {
  if (!user) return [];

  if (user.role === "ADMIN") {
    return ["USER", "INVESTOR", "MODERATOR", "ADMIN"];
  }

  if (user.role === "MODERATOR") {
    return ["USER"];
  }

  return [];
}

/**
 * Role display names
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  USER: "Seller",
  INVESTOR: "Investor",
  MODERATOR: "Moderator",
  ADMIN: "Administrator",
};

/**
 * Role descriptions
 */
export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  USER: "Seller or entrepreneur who can list businesses, properties, and projects.",
  INVESTOR: "Investor looking to buy or invest in listed businesses.",
  MODERATOR:
    "Can moderate content, manage user reports, and access moderation tools.",
  ADMIN:
    "Full system access including user management, system settings, and all administrative functions.",
};

/**
 * Role colors for UI
 */
export const ROLE_COLORS: Record<UserRole, string> = {
  USER: "text-blue-400",
  INVESTOR: "text-green-400",
  MODERATOR: "text-yellow-400",
  ADMIN: "text-red-400",
};

/**
 * Role background colors for badges
 */
export const ROLE_BG_COLORS: Record<UserRole, string> = {
  USER: "bg-blue-500/20 border-blue-500/30",
  INVESTOR: "bg-green-500/20 border-green-500/30",
  MODERATOR: "bg-yellow-500/20 border-yellow-500/30",
  ADMIN: "bg-red-500/20 border-red-500/30",
};
