import { PrismaClient } from "@prisma/client";
import { prisma } from "../utils/prisma";

// Database types based on Prisma schema
export type User = {
  id: string;
  email: string;
  phone?: string | null;
  firstName: string;
  lastName: string;
  password: string;
  avatar?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  socialLinks?: any;
  jobTitle?: string | null;
  company?: string | null;
  skills?: string[];
  languages?: string[];
  address?: string | null;
  city?: string | null;
  country?: string | null;
  zipCode?: string | null;
  isProfilePublic?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showLocation?: boolean;
  allowMessages?: boolean;
  isVerified?: boolean;
  verificationBadge?: string | null;
  verificationDate?: Date | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  isActive: boolean;
  role: "USER" | "ADMIN" | "MODERATOR" | "INVESTOR";
  department?: string | null; // Department for moderators
  assignedModeratorId?: string | null; // New field for moderator assignment
  subAdminPermissions?: string[];
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  approvedAt?: Date | null;
  approvedBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
  businessType?: string | null;
  workingDays?: string | null;
  isWorking?: boolean;
};

export type Session = {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
};

export type OtpCode = {
  id: string;
  userId: string;
  code: string;
  type:
    | "EMAIL_VERIFICATION"
    | "PHONE_VERIFICATION"
    | "PASSWORD_RESET"
    | "LOGIN_VERIFICATION";
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
};

// Database helper functions using Prisma
export const dbHelpers = {
  // User operations
  async createUser(userData: {
    email: string;
    phone?: string;
    firstName: string;
    lastName: string;
    password: string;
    avatar?: string;
    emailVerified?: boolean;
    phoneVerified?: boolean;
    role?: "USER" | "ADMIN" | "MODERATOR" | "INVESTOR";
    isActive?: boolean;
    approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
    subAdminPermissions?: string[];
    onboardingComplete?: boolean;
    city?: string;
    country?: string;
  }) {
    return await prisma.user.create({
      data: {
        email: userData.email,
        phone: userData.phone,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        avatar: userData.avatar,
        emailVerified: userData.emailVerified ?? false,
        phoneVerified: userData.phoneVerified ?? false,
        role: userData.role ?? "USER",
        isActive: userData.isActive ?? true,
        approvalStatus: userData.approvalStatus ?? "PENDING",
        subAdminPermissions: userData.subAdminPermissions ?? [],
        ...(userData.onboardingComplete !== undefined
          ? { onboardingComplete: userData.onboardingComplete }
          : {}),
      },
    });
  },

  async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
    });
  },

  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  async getUserByPhone(phone: string) {
    return await prisma.user.findUnique({
      where: { phone },
    });
  },

  async updateUser(
    id: string,
    updates: {
      email?: string;
      phone?: string;
      firstName?: string;
      lastName?: string;
      password?: string;
      avatar?: string;
      bio?: string;
      location?: string;
      website?: string;
      socialLinks?: any;
      emailVerified?: boolean;
      phoneVerified?: boolean;
      isActive?: boolean;
      role?: "USER" | "ADMIN" | "MODERATOR" | "INVESTOR";
      approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
      subAdminPermissions?: string[];
      approvedAt?: Date | null;
      approvedBy?: string | null;
      lastLoginAt?: Date;
      onboardingComplete?: boolean;
      city?: string;
      country?: string;
    }
  ) {
    return await prisma.user.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
  },

  async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id },
    });
  },

  // Session operations
  async createSession(sessionData: {
    userId: string;
    token: string;
    expiresAt: Date;
  }) {
    return await prisma.session.create({
      data: sessionData,
    });
  },

  async getSessionByToken(token: string) {
    return await prisma.session.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });
  },

  async getSessionsByUserId(userId: string) {
    return await prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  },

  async invalidateSession(token: string) {
    return await prisma.session.delete({
      where: { token },
    });
  },

  async invalidateAllUserSessions(userId: string) {
    return await prisma.session.deleteMany({
      where: { userId },
    });
  },

  async cleanupExpiredSessions() {
    return await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  },

  // OTP/Verification code operations
  async createOtpCode(otpData: {
    userId: string;
    code: string;
    type:
      | "EMAIL_VERIFICATION"
      | "PHONE_VERIFICATION"
      | "PASSWORD_RESET"
      | "LOGIN_VERIFICATION";
    expiresAt: Date;
  }) {
    return await prisma.otpCode.create({
      data: otpData,
    });
  },

  async getOtpCode(userId: string, code: string, type: string) {
    return await prisma.otpCode.findFirst({
      where: {
        userId,
        code,
        type: type as any,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  },

  async markOtpCodeAsUsed(id: string) {
    return await prisma.otpCode.update({
      where: { id },
      data: { used: true },
    });
  },

  async invalidateUserOtpCodes(userId: string, type?: string) {
    const where: any = { userId, used: false };
    if (type) {
      where.type = type;
    }

    return await prisma.otpCode.updateMany({
      where,
      data: { used: true },
    });
  },

  async cleanupExpiredOtpCodes() {
    return await prisma.otpCode.deleteMany({
      where: {
        OR: [{ used: true }, { expiresAt: { lt: new Date() } }],
      },
    });
  },

  // Utility operations
  async getUserStats(userId: string) {
    const [user, sessionsCount, otpCodesCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              listings: true,
              blogs: true,
              comments: true,
              reviews: true,
            },
          },
        },
      }),
      prisma.session.count({
        where: { userId },
      }),
      prisma.otpCode.count({
        where: { userId, used: false },
      }),
    ]);

    return {
      user,
      sessionsCount,
      activeOtpCodesCount: otpCodesCount,
    };
  },

  async searchUsers(query: string, limit: number = 10) {
    return await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
        isActive: true,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
      take: limit,
    });
  },

  // Admin operations
  async getUsersWithPagination(
    page: number = 1,
    limit: number = 20,
    filters?: {
      role?: string;
      isActive?: boolean;
      emailVerified?: boolean;
      approvalStatus?: string;
      search?: string;
      phoneVerified?: boolean;
    }
  ) {
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.emailVerified !== undefined) {
      where.emailVerified = filters.emailVerified;
    }

    if (filters?.approvalStatus) {
      where.approvalStatus = filters.approvalStatus;
    }

    if (filters?.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    if (filters?.phoneVerified !== undefined) {
      where.phoneVerified = filters.phoneVerified;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          department: true,
          isActive: true,
          emailVerified: true,
          phoneVerified: true,
          approvalStatus: true,
          approvedAt: true,
          approvedBy: true,
          createdAt: true,
          lastLoginAt: true,
          phone: true,
          subAdminPermissions: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  async getUsersCount(filters?: {
    role?: string;
    isActive?: boolean;
    emailVerified?: boolean;
  }) {
    const where: any = {};

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.emailVerified !== undefined) {
      where.emailVerified = filters.emailVerified;
    }

    return await prisma.user.count({ where });
  },

  async bulkUpdateUsers(
    userIds: string[],
    updates: {
      isActive?: boolean;
      role?: "USER" | "ADMIN" | "MODERATOR" | "INVESTOR";
      emailVerified?: boolean;
      phoneVerified?: boolean;
    }
  ) {
    return await prisma.user.updateMany({
      where: {
        id: {
          in: userIds,
        },
      },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
  },

  async bulkDeleteUsers(userIds: string[]) {
    // First, delete related data
    await Promise.all([
      prisma.session.deleteMany({
        where: { userId: { in: userIds } },
      }),
      prisma.otpCode.deleteMany({
        where: { userId: { in: userIds } },
      }),
    ]);

    // Then delete users
    return await prisma.user.deleteMany({
      where: {
        id: {
          in: userIds,
        },
      },
    });
  },

  async getUserRoleStats() {
    const [userCount, adminCount, moderatorCount] = await Promise.all([
      prisma.user.count({ where: { role: "USER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "MODERATOR" } }),
    ]);

    return {
      USER: userCount,
      ADMIN: adminCount,
      MODERATOR: moderatorCount,
      total: userCount + adminCount + moderatorCount,
    };
  },

  async getUserActivityStats() {
    const [activeUsers, inactiveUsers, verifiedUsers, unverifiedUsers] =
      await Promise.all([
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.count({ where: { isActive: false } }),
        prisma.user.count({ where: { emailVerified: true } }),
        prisma.user.count({ where: { emailVerified: false } }),
      ]);

    return {
      active: activeUsers,
      inactive: inactiveUsers,
      verified: verifiedUsers,
      unverified: unverifiedUsers,
    };
  },

  // Moderator assignment functions
  async assignUserToModerator(userId: string, moderatorId: string) {
    // Verify that the moderator has MODERATOR role
    const moderator = await prisma.user.findUnique({
      where: { id: moderatorId },
      select: { role: true },
    });

    if (!moderator || moderator.role !== "MODERATOR") {
      throw new Error("Invalid moderator: User must have MODERATOR role");
    }

    return await prisma.user.update({
      where: { id: userId },
      data: { assignedModeratorId: moderatorId },
      include: {
        assignedModerator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  },

  async unassignUserFromModerator(userId: string) {
    return await prisma.user.update({
      where: { id: userId },
      data: { assignedModeratorId: null },
    });
  },

  async getModeratorAssignedUsers(moderatorId: string) {
    return await prisma.user.findMany({
      where: {
        assignedModeratorId: moderatorId,
        role: "USER", // Only get users, not other moderators or admins
        approvalStatus: "APPROVED", // Only get approved users
        isActive: true, // Only get active users
        phone: { not: null }, // Only get users with phone numbers
        NOT: { phone: "" }, // Exclude users with empty phone
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getUnassignedUsers() {
    return await prisma.user.findMany({
      where: {
        assignedModeratorId: null,
        role: "USER", // Only get users, not moderators or admins
        approvalStatus: "APPROVED", // Only get approved users
        isActive: true, // Only get active users
        phone: { not: null }, // Only get users with phone numbers
        NOT: { phone: "" }, // Exclude users with empty phone
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        department: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async getAllModerators() {
    const moderators = await prisma.user.findMany({
      where: { role: "MODERATOR" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        department: true,
      },
      orderBy: { firstName: "asc" },
    });

    // Manually count assigned users with proper filtering (approved, active, and has phone)
    const moderatorsWithCounts = await Promise.all(
      moderators.map(async (moderator) => {
        const assignedUsersCount = await prisma.user.count({
          where: {
            assignedModeratorId: moderator.id,
            role: "USER",
            approvalStatus: "APPROVED",
            isActive: true,
            phone: { not: null },
            NOT: { phone: "" },
          },
        });

        return {
          ...moderator,
          _count: {
            assignedUsers: assignedUsersCount,
          },
        };
      })
    );

    return moderatorsWithCounts;
  },

  async getModeratorAssignmentStats() {
    const baseUserFilter = {
      role: "USER" as const,
      approvalStatus: "APPROVED" as const,
      isActive: true,
      phone: { not: null },
      NOT: { phone: "" },
    };

    const [totalUsers, assignedUsers, unassignedUsers, totalModerators] =
      await Promise.all([
        prisma.user.count({ where: baseUserFilter }),
        prisma.user.count({
          where: { ...baseUserFilter, assignedModeratorId: { not: null } },
        }),
        prisma.user.count({
          where: { ...baseUserFilter, assignedModeratorId: null },
        }),
        prisma.user.count({ where: { role: "MODERATOR" } }),
      ]);

    return {
      totalUsers,
      assignedUsers,
      unassignedUsers,
      totalModerators,
      assignmentRate: totalUsers > 0 ? (assignedUsers / totalUsers) * 100 : 0,
    };
  },

  // Database health check
  async healthCheck() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "healthy", timestamp: new Date() };
    } catch (error: any) {
      return {
        status: "unhealthy",
        error: error.message,
        timestamp: new Date(),
      };
    }
  },

  // Blog operations
  async getBlogById(id: string) {
    return await prisma.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });
  },

  async updateBlog(
    id: string,
    updates: {
      title?: string;
      slug?: string;
      excerpt?: string;
      content?: string;
      coverImage?: string;
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string[];
      status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "SCHEDULED";
      approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
      approvedAt?: Date | null;
      approvedBy?: string | null;
      isActive?: boolean;
      isFeatured?: boolean;
      publishedAt?: Date;
      categoryId?: string;
    }
  ) {
    return await prisma.blog.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  },

  async getBlogsWithPagination(
    page: number = 1,
    limit: number = 20,
    filters?: {
      approvalStatus?: string;
      status?: string;
      isActive?: boolean;
      authorId?: string;
      categoryId?: string;
      search?: string;
    }
  ) {
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {};

    if (filters?.approvalStatus) {
      where.approvalStatus = filters.approvalStatus;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.authorId) {
      where.authorId = filters.authorId;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { content: { contains: filters.search, mode: "insensitive" } },
        { excerpt: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      prisma.blog.count({ where }),
    ]);

    return {
      blogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // Listing operations
  async getListingById(id: string) {
    return await prisma.listing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
        _count: {
          select: {
            likes: true,
            reviews: true,
            savedBy: true,
          },
        },
      },
    });
  },

  async updateListing(
    id: string,
    updates: {
      title?: string;
      slug?: string;
      description?: string;
      content?: string;
      businessName?: string;
      businessType?: string;
      website?: string;
      email?: string;
      phone?: string;
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
      latitude?: number;
      longitude?: number;
      images?: string[];
      videos?: string[];
      documents?: string[];
      price?: number;
      priceType?: string;
      currency?: string;
      businessHours?: any;
      status?: "DRAFT" | "PUBLISHED" | "INACTIVE" | "ARCHIVED";
      approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
      approvedAt?: Date | null;
      approvedBy?: string | null;
      isActive?: boolean;
      isFeatured?: boolean;
      isVerified?: boolean;
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string[];
      publishedAt?: Date;
      categoryId?: string;
    }
  ) {
    // Filter out undefined values to avoid Prisma type issues
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([_, value]) => value !== undefined)
    );

    return await prisma.listing.update({
      where: { id },
      data: {
        ...filteredUpdates,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        category: true,
        _count: {
          select: {
            likes: true,
            reviews: true,
            savedBy: true,
          },
        },
      },
    });
  },

  async getListingsWithPagination(
    page: number = 1,
    limit: number = 20,
    filters?: {
      approvalStatus?: string;
      status?: string;
      isActive?: boolean;
      userId?: string;
      categoryId?: string;
      search?: string;
      isFeatured?: boolean;
      city?: string;
      state?: string;
      country?: string;
      businessType?: string;
      minPrice?: number;
      maxPrice?: number;
    }
  ) {
    const skip = (page - 1) * limit;

    // Build where clause based on filters
    const where: any = {};

    if (filters?.approvalStatus) {
      where.approvalStatus = filters.approvalStatus;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.isFeatured !== undefined) {
      where.isFeatured = filters.isFeatured;
    }

    if (filters?.city) {
      where.city = { contains: filters.city, mode: "insensitive" };
    }

    if (filters?.state) {
      where.state = { contains: filters.state, mode: "insensitive" };
    }

    if (filters?.country) {
      where.country = { contains: filters.country, mode: "insensitive" };
    }

    if (filters?.businessType) {
      where.businessType = {
        contains: filters.businessType,
        mode: "insensitive",
      };
    }

    if (filters?.minPrice || filters?.maxPrice) {
      where.price = {};
      if (filters.minPrice) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { businessName: { contains: filters.search, mode: "insensitive" } },
        { businessType: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          category: true,
          _count: {
            select: {
              likes: true,
              reviews: true,
              savedBy: true,
            },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    return {
      listings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  // Notification operations
  async createNotification(notificationData: {
    title: string;
    message: string;
    type: "SYSTEM" | "USER_ACTION" | "MARKETING" | "SECURITY" | "REMINDER";
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    userId?: string | null;
    isGlobal?: boolean;
    data?: any;
    actionUrl?: string | null;
  }) {
    return await prisma.notification.create({
      data: {
        title: notificationData.title,
        message: notificationData.message,
        type: notificationData.type,
        priority: notificationData.priority || "MEDIUM",
        userId: notificationData.userId,
        isGlobal: notificationData.isGlobal || false,
        data: notificationData.data,
        actionUrl: notificationData.actionUrl,
      },
    });
  },

  async getNotifications(
    where: any,
    options?: {
      skip?: number;
      take?: number;
      orderBy?: any;
    }
  ) {
    return await prisma.notification.findMany({
      where,
      skip: options?.skip,
      take: options?.take,
      orderBy: options?.orderBy || { createdAt: "desc" },
    });
  },

  async getNotificationsCount(where: any) {
    return await prisma.notification.count({ where });
  },

  async markNotificationsAsRead(notificationIds: string[], userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        OR: [{ userId: userId }, { isGlobal: true }],
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    return result.count;
  },

  async markAllNotificationsAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        OR: [{ userId: userId }, { isGlobal: true }],
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    return result.count;
  },
};

// Export Prisma client for direct use when needed
export { prisma };

// Export types
export type { PrismaClient };
export default prisma;
