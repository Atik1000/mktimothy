import { prisma } from "../utils/prisma";

export interface ProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: any;
  jobTitle?: string;
  company?: string;
  skills?: string[];
  languages?: string[];
  address?: string;
  city?: string;
  country?: string;
  zipCode?: string;
  isProfilePublic?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  showLocation?: boolean;
  allowMessages?: boolean;
}

export interface SocialLinks {
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  github?: string;
  website?: string;
}

export interface VerificationRequest {
  verificationType: "BLUE" | "GREEN" | "GOLD";
  documents: string[];
  reason: string;
}

export const profileService = {
  async getProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          avatar: true,
          bio: true,
          location: true,
          website: true,
          socialLinks: true,
          jobTitle: true,
          company: true,
          skills: true,
          languages: true,
          address: true,
          city: true,
          country: true,
          zipCode: true,
          isProfilePublic: true,
          showEmail: true,
          showPhone: true,
          showLocation: true,
          allowMessages: true,
          isVerified: true,
          verificationBadge: true,
          verificationDate: true,
          emailVerified: true,
          phoneVerified: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              listings: true,
              blogs: true,
              reviews: true,
            },
          },
        },
      });

      return { success: true, data: user };
    } catch (error) {
      console.error("Get profile error:", error);
      return { success: false, error: "Failed to fetch profile" };
    }
  },

  async getPublicProfile(userId: string, viewerId?: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId, isActive: true },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          avatar: true,
          bio: true,
          location: true,
          website: true,
          socialLinks: true,
          jobTitle: true,
          company: true,
          skills: true,
          languages: true,
          address: true,
          city: true,
          country: true,
          zipCode: true,
          isVerified: true,
          verificationBadge: true,
          verificationDate: true,
          role: true,
          createdAt: true,
          // Privacy settings to filter data
          isProfilePublic: true,
          showEmail: true,
          showPhone: true,
          showLocation: true,
          allowMessages: true,
          _count: {
            select: {
              listings: true,
              blogs: true,
              reviews: true,
            },
          },
        },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      if (!user.isProfilePublic && userId !== viewerId) {
        return { success: false, error: "Profile is private" };
      }

      // Filter sensitive data based on privacy settings
      const publicProfile = {
        ...user,
        email: user.showEmail || userId === viewerId ? user.email : null,
        phone: user.showPhone || userId === viewerId ? user.phone : null,
        location:
          user.showLocation || userId === viewerId ? user.location : null,
        address: userId === viewerId ? user.address : null,
        zipCode: userId === viewerId ? user.zipCode : null,
      };

      // Remove privacy settings from public view
      delete (publicProfile as any).isProfilePublic;
      delete (publicProfile as any).showEmail;
      delete (publicProfile as any).showPhone;
      delete (publicProfile as any).showLocation;
      delete (publicProfile as any).allowMessages;

      return { success: true, data: publicProfile };
    } catch (error) {
      console.error("Get public profile error:", error);
      return { success: false, error: "Failed to fetch profile" };
    }
  },

  async updateProfile(userId: string, profileData: ProfileData) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...profileData,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          avatar: true,
          bio: true,
          location: true,
          website: true,
          socialLinks: true,
          jobTitle: true,
          company: true,
          skills: true,
          languages: true,
          address: true,
          city: true,
          country: true,
          zipCode: true,
          isProfilePublic: true,
          showEmail: true,
          showPhone: true,
          showLocation: true,
          allowMessages: true,
          isVerified: true,
          verificationBadge: true,
          verificationDate: true,
          emailVerified: true,
          phoneVerified: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Log the profile update
      await prisma.activityLog.create({
        data: {
          userId,
          action: "PROFILE_UPDATED",
          description: "User updated their profile",
          data: { updatedFields: Object.keys(profileData) },
        },
      });

      return { success: true, data: updatedUser };
    } catch (error) {
      console.error("Update profile error:", error);
      return { success: false, error: "Failed to update profile" };
    }
  },

  async updateAvatar(userId: string, avatarUrl: string) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          avatar: avatarUrl,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          avatar: true,
        },
      });

      // Log the avatar update
      await prisma.activityLog.create({
        data: {
          userId,
          action: "AVATAR_UPDATED",
          description: "User updated their profile picture",
          data: { avatarUrl },
        },
      });

      return { success: true, data: updatedUser };
    } catch (error) {
      console.error("Update avatar error:", error);
      return { success: false, error: "Failed to update avatar" };
    }
  },

  async removeAvatar(userId: string) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          avatar: null,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          avatar: true,
        },
      });

      // Log the avatar removal
      await prisma.activityLog.create({
        data: {
          userId,
          action: "AVATAR_REMOVED",
          description: "User removed their profile picture",
        },
      });

      return { success: true, data: updatedUser };
    } catch (error) {
      console.error("Remove avatar error:", error);
      return { success: false, error: "Failed to remove avatar" };
    }
  },

  async deactivateAccount(userId: string, reason?: string) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });

      // Log the deactivation
      await prisma.activityLog.create({
        data: {
          userId,
          action: "ACCOUNT_DEACTIVATED",
          description: "User deactivated their account",
          data: { reason },
        },
      });

      // Invalidate all user sessions
      await prisma.session.deleteMany({
        where: { userId },
      });

      return { success: true, message: "Account deactivated successfully" };
    } catch (error) {
      console.error("Deactivate account error:", error);
      return { success: false, error: "Failed to deactivate account" };
    }
  },

  async deleteAccount(userId: string) {
    try {
      // Start transaction to delete all user data
      await prisma.$transaction(async (tx) => {
        // Delete related data first
        await tx.session.deleteMany({ where: { userId } });
        await tx.otpCode.deleteMany({ where: { userId } });
        await tx.activityLog.deleteMany({ where: { userId } });
        await tx.searchQuery.deleteMany({ where: { userId } });
        await tx.notificationPreference.deleteMany({ where: { userId } });

        // Delete user's content interactions
        await tx.blogLike.deleteMany({ where: { userId } });
        await tx.listingLike.deleteMany({ where: { userId } });
        await tx.savedBlog.deleteMany({ where: { userId } });
        await tx.savedListing.deleteMany({ where: { userId } });
        await tx.review.deleteMany({ where: { userId } });
        await tx.comment.deleteMany({ where: { userId } });

        // Delete user's content (cascade will handle related data)
        await tx.listing.deleteMany({ where: { userId } });
        await tx.blog.deleteMany({ where: { authorId: userId } });

        // Finally delete the user
        await tx.user.delete({ where: { id: userId } });
      });

      return { success: true, message: "Account deleted successfully" };
    } catch (error) {
      console.error("Delete account error:", error);
      return { success: false, error: "Failed to delete account" };
    }
  },

  async requestVerification(
    userId: string,
    verificationData: VerificationRequest
  ) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          isVerified: true,
          verificationBadge: true,
        },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      if (
        user.isVerified &&
        user.verificationBadge === verificationData.verificationType
      ) {
        return {
          success: false,
          error: "Already verified with this badge type",
        };
      }

      // Create verification request in activity log
      await prisma.activityLog.create({
        data: {
          userId,
          action: "VERIFICATION_REQUEST",
          description: `User requested ${verificationData.verificationType} verification`,
          data: {
            ...verificationData,
            status: "PENDING",
            submittedAt: new Date(),
          },
        },
      });

      return {
        success: true,
        message: "Verification request submitted successfully",
        data: {
          ...verificationData,
          status: "PENDING",
          submittedAt: new Date(),
        },
      };
    } catch (error) {
      console.error("Request verification error:", error);
      return { success: false, error: "Failed to submit verification request" };
    }
  },

  async getVerificationStatus(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          isVerified: true,
          verificationBadge: true,
          verificationDate: true,
        },
      });

      if (!user) {
        return { success: false, error: "User not found" };
      }

      // Get verification requests from activity log
      const verificationHistory = await prisma.activityLog.findMany({
        where: {
          userId,
          action: {
            in: [
              "VERIFICATION_REQUEST",
              "VERIFICATION_APPROVED",
              "VERIFICATION_REJECTED",
            ],
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      });

      return {
        success: true,
        data: {
          currentStatus: {
            isVerified: user.isVerified,
            verificationBadge: user.verificationBadge,
            verificationDate: user.verificationDate,
          },
          history: verificationHistory,
        },
      };
    } catch (error) {
      console.error("Get verification status error:", error);
      return { success: false, error: "Failed to fetch verification status" };
    }
  },
};

