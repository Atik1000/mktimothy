"use client";

import { SectionLoader } from "@/components/ui/Loader";
import RoleBadge from "@/components/ui/RoleBadge";
import { useAuth } from "@/lib/providers/auth-provider";
import { isModerator, User } from "@/lib/utils/permissions";
import { UserRole } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  FaCheck,
  FaComments,
  FaExclamationTriangle,
  FaFileAlt,
  FaFlag,
  FaTimes,
  FaUser,
} from "react-icons/fa";

interface ReportedContent {
  id: string;
  type: "listing" | "blog" | "comment" | "user";
  title: string;
  content: string;
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  reportedUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  reason: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    id: string;
    name: string;
  };
}

interface ModerationStats {
  pendingReports: number;
  resolvedToday: number;
  totalUsers: number;
  suspendedUsers: number;
  totalContent: number;
  flaggedContent: number;
}

const ModeratorTools: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("reports");
  const [reports, setReports] = useState<ReportedContent[]>([]);
  const [stats, setStats] = useState<ModerationStats>({
    pendingReports: 5,
    resolvedToday: 12,
    totalUsers: 1250,
    suspendedUsers: 8,
    totalContent: 3420,
    flaggedContent: 15,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    type: "",
    priority: "",
  });

  // Check if user has moderator permissions
  if (!currentUser || !isModerator(currentUser as User)) {
    return (
      <div className="bg-bglight min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-white text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">You don't have moderator permissions.</p>
        </div>
      </div>
    );
  }

  // Mock data for demonstration
  useEffect(() => {
    const mockReports: ReportedContent[] = [
      {
        id: "1",
        type: "listing",
        title: "Inappropriate Business Listing",
        content:
          "This listing contains inappropriate content and violates community guidelines...",
        reportedBy: {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
        },
        reportedUser: {
          id: "2",
          name: "Jane Smith",
          email: "jane@example.com",
          role: "USER",
        },
        reason: "Inappropriate content",
        status: "pending",
        priority: "high",
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        type: "comment",
        title: "Spam Comment",
        content:
          "This comment appears to be spam and contains promotional links...",
        reportedBy: {
          id: "3",
          name: "Bob Wilson",
          email: "bob@example.com",
        },
        reportedUser: {
          id: "4",
          name: "Spam User",
          email: "spam@example.com",
          role: "USER",
        },
        reason: "Spam",
        status: "pending",
        priority: "medium",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];

    setReports(mockReports);
  }, []);

  // Handle report actions
  const handleReportAction = (
    reportId: string,
    action: "approve" | "reject" | "dismiss",
  ) => {
    setReports((prev) =>
      prev.map((report) =>
        report.id === reportId
          ? {
              ...report,
              status:
                action === "approve"
                  ? "resolved"
                  : action === "reject"
                    ? "reviewed"
                    : "dismissed",
            }
          : report,
      ),
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-500 bg-red-500/20";
      case "high":
        return "text-orange-500 bg-orange-500/20";
      case "medium":
        return "text-yellow-500 bg-yellow-500/20";
      case "low":
        return "text-green-500 bg-green-500/20";
      default:
        return "text-gray-500 bg-gray-500/20";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-400 bg-yellow-500/20";
      case "reviewed":
        return "text-blue-400 bg-blue-500/20";
      case "resolved":
        return "text-green-400 bg-green-500/20";
      case "dismissed":
        return "text-gray-400 bg-gray-500/20";
      default:
        return "text-gray-400 bg-gray-500/20";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "listing":
        return <FaFileAlt className="w-4 h-4" />;
      case "blog":
        return <FaFileAlt className="w-4 h-4" />;
      case "comment":
        return <FaComments className="w-4 h-4" />;
      case "user":
        return <FaUser className="w-4 h-4" />;
      default:
        return <FaFlag className="w-4 h-4" />;
    }
  };

  const filteredReports = reports.filter((report) => {
    if (filters.status && report.status !== filters.status) return false;
    if (filters.type && report.type !== filters.type) return false;
    if (filters.priority && report.priority !== filters.priority) return false;
    return true;
  });

  return (
    <div className="bg-bglight min-h-screen pt-[150px] pb-[100px]">
      <div className="width py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-white aabbss font-bold text-2xl">
              Moderator Tools
            </h1>
            <RoleBadge role={currentUser.role as UserRole} size="sm" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-[#2C2C2C] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FaFlag className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-white font-bold text-xl">
                  {stats.pendingReports}
                </div>
                <div className="text-gray-400 text-sm">Pending Reports</div>
              </div>
            </div>
          </div>

          <div className="bg-[#2C2C2C] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FaCheck className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-white font-bold text-xl">
                  {stats.resolvedToday}
                </div>
                <div className="text-gray-400 text-sm">Resolved Today</div>
              </div>
            </div>
          </div>

          <div className="bg-[#2C2C2C] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FaUser className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-white font-bold text-xl">
                  {stats.totalUsers}
                </div>
                <div className="text-gray-400 text-sm">Total Users</div>
              </div>
            </div>
          </div>

          <div className="bg-[#2C2C2C] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FaExclamationTriangle className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-white font-bold text-xl">
                  {stats.suspendedUsers}
                </div>
                <div className="text-gray-400 text-sm">Suspended Users</div>
              </div>
            </div>
          </div>

          <div className="bg-[#2C2C2C] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FaFileAlt className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-white font-bold text-xl">
                  {stats.totalContent}
                </div>
                <div className="text-gray-400 text-sm">Total Content</div>
              </div>
            </div>
          </div>

          <div className="bg-[#2C2C2C] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <FaFlag className="w-5 h-5 text-orange-400" />
              <div>
                <div className="text-white font-bold text-xl">
                  {stats.flaggedContent}
                </div>
                <div className="text-gray-400 text-sm">Flagged Content</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#2C2C2C] rounded-lg p-1 mb-6">
          {[
            { id: "reports", label: "Reports", count: stats.pendingReports },
            { id: "content", label: "Content Review" },
            { id: "users", label: "User Management" },
            { id: "logs", label: "Activity Logs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-md aabbss font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === tab.id
                  ? "bg-greencolor text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-[#2C2C2C] rounded-lg p-6">
          {activeTab === "reports" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white aabbss font-bold text-xl">
                  Content Reports
                </h2>

                {/* Filters */}
                <div className="flex gap-4">
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="bg-bgdark border border-white/30 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="resolved">Resolved</option>
                    <option value="dismissed">Dismissed</option>
                  </select>

                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="bg-bgdark border border-white/30 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">All Types</option>
                    <option value="listing">Listings</option>
                    <option value="blog">Blogs</option>
                    <option value="comment">Comments</option>
                    <option value="user">Users</option>
                  </select>

                  <select
                    value={filters.priority}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        priority: e.target.value,
                      }))
                    }
                    className="bg-bgdark border border-white/30 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="">All Priorities</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-8">
                  <SectionLoader height="h-24" message="Loading reports..." />
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400">No reports found</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-bgdark rounded-lg p-4 border border-white/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getTypeIcon(report.type)}
                            <h3 className="text-white font-medium">
                              {report.title}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                report.priority,
                              )}`}
                            >
                              {report.priority.toUpperCase()}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                report.status,
                              )}`}
                            >
                              {report.status.toUpperCase()}
                            </span>
                          </div>

                          <p className="text-gray-400 text-sm mb-3">
                            {report.content}
                          </p>

                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>Reported by: {report.reportedBy.name}</span>
                            <span>•</span>
                            <span>Target: {report.reportedUser.name}</span>
                            <span>•</span>
                            <span>Reason: {report.reason}</span>
                            <span>•</span>
                            <span>
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {report.status === "pending" && (
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() =>
                                handleReportAction(report.id, "approve")
                              }
                              className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                            >
                              <FaCheck className="w-3 h-3" />
                              Approve
                            </button>
                            <button
                              onClick={() =>
                                handleReportAction(report.id, "reject")
                              }
                              className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                            >
                              <FaTimes className="w-3 h-3" />
                              Reject
                            </button>
                            <button
                              onClick={() =>
                                handleReportAction(report.id, "dismiss")
                              }
                              className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "content" && (
            <div className="text-center py-8">
              <div className="text-gray-400">
                Content review functionality coming soon...
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="text-center py-8">
              <div className="text-gray-400">
                User management functionality coming soon...
              </div>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="text-center py-8">
              <div className="text-gray-400">
                Activity logs functionality coming soon...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModeratorTools;

