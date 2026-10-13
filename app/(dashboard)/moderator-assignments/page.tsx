"use client";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import { FullPageLoader, SectionLoader } from "@/components/ui/Loader";
import { useAuth } from "@/lib/providers/auth-provider";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { 
  Search, Users, ClipboardList, ShieldCheck, UserCheck, UserMinus, Percent, ChevronDown, Check, UserPlus, User as UserIcon
} from 'lucide-react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  assignedModerator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

interface Moderator {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  department?: string;
  _count: {
    assignedUsers: number;
  };
}

interface AssignmentStats {
  totalUsers: number;
  assignedUsers: number;
  unassignedUsers: number;
  totalModerators: number;
  assignmentRate: number;
}

interface AssignmentData {
  moderators: Moderator[];
  unassignedUsers: User[];
  stats: AssignmentStats;
}

export default function ModeratorAssignmentsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<AssignmentData | null>(null);

  const formatDepartmentName = (department?: string) => {
    if (!department) return "";
    return department
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };
  
  const [loading, setLoading] = useState(true);
  const [selectedModerator, setSelectedModerator] = useState<string>("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignedUsers, setShowAssignedUsers] = useState<{
    [moderatorId: string]: User[];
  }>({});
  const [expandedModerators, setExpandedModerators] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/dashboard");
      } else if (
        user.role !== "ADMIN" &&
        !(
          user.role === "MODERATOR" &&
          user.subAdminPermissions?.includes("manage-assignments")
        )
      ) {
        toast.error("You do not have permission to access this page");
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      const response = await fetch("/api/admin/moderator-assignments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        toast.error("Failed to fetch assignment data");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error loading assignment data");
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedUsers = async (moderatorId: string) => {
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      const response = await fetch(
        `/api/admin/moderator-assignments/${moderatorId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setShowAssignedUsers((prev) => ({
          ...prev,
          [moderatorId]: result.data.assignedUsers,
        }));
      }
    } catch (error) {
      console.error("Error fetching assigned users:", error);
      toast.error("Error loading assigned users");
    }
  };

  const toggleModeratorExpansion = (moderatorId: string) => {
    if (expandedModerators.includes(moderatorId)) {
      setExpandedModerators((prev) => prev.filter((id) => id !== moderatorId));
    } else {
      setExpandedModerators((prev) => [...prev, moderatorId]);
      if (!showAssignedUsers[moderatorId]) {
        fetchAssignedUsers(moderatorId);
      }
    }
  };

  const toggleUser = (id: string) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const assignUsers = async () => {
    if (!selectedModerator || selectedUsers.length === 0) {
      toast.error("Please select a moderator and at least one user");
      return;
    }

    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      const promises = selectedUsers.map((userId) =>
        fetch("/api/admin/moderator-assignments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            moderatorId: selectedModerator,
            action: "assign",
          }),
        })
      );

      const responses = await Promise.all(promises);
      const results = await Promise.all(responses.map((res) => res.json()));

      const successful = results.filter((r) => r.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(
          `Successfully assigned ${successful} user${successful > 1 ? "s" : ""}`
        );
        setSelectedUsers([]);

        await fetchData();

        if (expandedModerators.includes(selectedModerator)) {
          await fetchAssignedUsers(selectedModerator);
        }
      }

      if (failed > 0) {
        toast.error(`Failed to assign ${failed} user${failed > 1 ? "s" : ""}`);
      }
    } catch (error) {
      console.error("Error assigning users:", error);
      toast.error("Error assigning users");
    }
  };

  const unassignUser = async (userId: string) => {
    try {
      const token =
        localStorage.getItem("auth-token") ||
        sessionStorage.getItem("auth-token");

      const response = await fetch("/api/admin/moderator-assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          action: "unassign",
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("User unassigned successfully");

        await fetchData();

        const refreshPromises = expandedModerators.map((moderatorId) =>
          fetchAssignedUsers(moderatorId)
        );
        await Promise.all(refreshPromises);
      } else {
        toast.error("Failed to unassign user");
      }
    } catch (error) {
      console.error("Error unassigning user:", error);
      toast.error("Error unassigning user");
    }
  };

  useEffect(() => {
    if (user && user.role === "ADMIN") {
      fetchData();
    }
  }, [user]);

  const filteredUnassignedUsers =
    data?.unassignedUsers.filter(
      (user) =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const isAssignDisabled = !selectedModerator || selectedUsers.length === 0;

  if (isLoading || loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#09090b] min-h-screen">
        <SectionLoader height="h-full" message="Loading assignments..." />
      </div>
    );
  }

  if (
    !user ||
    (user.role !== "ADMIN" &&
      !(
        user.role === "MODERATOR" &&
        user.subAdminPermissions?.includes("manage-assignments")
      ))
  ) {
    return null;
  }

  const metrics = data ? [
    { id: 1, title: 'Total Users', value: data.stats.totalUsers.toString(), icon: Users, color: 'emerald' },
    { id: 2, title: 'Assigned', value: data.stats.assignedUsers.toString(), icon: UserCheck, color: 'blue' },
    { id: 3, title: 'Unassigned', value: data.stats.unassignedUsers.toString(), icon: UserMinus, color: 'amber' },
    { id: 4, title: 'Assignment Rate', value: `${Math.round(data.stats.assignmentRate)}%`, icon: Percent, color: 'purple' },
  ] : [];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar bg-[#09090b] text-zinc-100 font-sans min-h-screen">
      <div className="max-w-[1400px] mx-auto space-y-6 sm:space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <ClipboardList size={24} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Moderator Assignments</h1>
          </div>
          <p className="text-zinc-400 text-sm ml-11">Manage user assignments to moderators for chat support.</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const colorMap: Record<string, string> = {
              emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:border-emerald-500/40',
              blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:border-blue-500/40',
              amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 group-hover:border-amber-500/40',
              purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:border-purple-500/40',
            };
            
            return (
              <div key={metric.id} className="bg-[#18181b] border border-white/5 p-5 sm:p-6 rounded-2xl shadow-xl shadow-black/20 flex flex-col relative overflow-hidden group transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl transition-colors ${colorMap[metric.color].split(' group-hover')[0]}`}>
                    <Icon size={20} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400 font-medium mb-1">{metric.title}</p>
                    <h3 className={`text-2xl font-bold ${colorMap[metric.color].split(' ')[0]}`}>{metric.value}</h3>
                  </div>
                </div>
                {/* Decorative bottom line */}
                <div className={`absolute bottom-0 left-0 w-full h-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-${metric.color}-500/50`}></div>
              </div>
            );
          })}
        </div>

        {/* Dual Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: Assign Users */}
          <div className="lg:col-span-7 bg-[#18181b] border border-white/5 rounded-2xl shadow-xl shadow-black/20 flex flex-col h-[600px] overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-white/[0.01]">
              <UserPlus size={18} className="text-emerald-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Assign Users to Moderators</h2>
            </div>

            <div className="p-5 space-y-5 flex-1 flex flex-col min-h-0">
              
              {/* Select Moderator Dropdown */}
              <div className="space-y-2 shrink-0">
                <label className="text-sm font-medium text-zinc-300">Select Moderator</label>
                <div className="relative">
                  <select 
                    value={selectedModerator}
                    onChange={(e) => setSelectedModerator(e.target.value)}
                    className="w-full bg-[#09090b] border border-white/10 text-sm text-zinc-200 rounded-xl pl-4 pr-10 py-3 appearance-none focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all cursor-pointer"
                  >
                    <option value="" disabled className="text-zinc-500">Choose a moderator...</option>
                    {data?.moderators.map(mod => (
                      <option key={mod.id} value={mod.id}>
                        {mod.firstName} {mod.lastName} 
                        {mod.department ? ` (${formatDepartmentName(mod.department)})` : ""}
                        - {mod._count.assignedUsers} assigned
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Search Users */}
              <div className="space-y-2 shrink-0">
                <label className="text-sm font-medium text-zinc-300">Search Unassigned Users</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#09090b] border border-white/10 text-sm rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all text-zinc-200 placeholder:text-zinc-500"
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="flex-1 flex flex-col min-h-0">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 shrink-0">
                  Unassigned Users ({filteredUnassignedUsers.length})
                </p>
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#09090b] border border-white/5 rounded-xl">
                  {filteredUnassignedUsers.length === 0 ? (
                    <div className="p-4 text-center text-zinc-500 text-sm h-full flex items-center justify-center">
                      No unassigned users found
                    </div>
                  ) : (
                    <div className="divide-y divide-white/5">
                      {filteredUnassignedUsers.map((user) => (
                        <div 
                          key={user.id} 
                          onClick={() => toggleUser(user.id)}
                          className="p-3 flex items-center gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                        >
                          {/* Checkbox */}
                          <div className={`
                            w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-200
                            ${selectedUsers.includes(user.id) 
                              ? 'bg-emerald-500 border-emerald-500 text-white' 
                              : 'border-white/20 bg-[#18181b] group-hover:border-emerald-500/50'
                            }
                          `}>
                            {selectedUsers.includes(user.id) && <Check size={12} strokeWidth={3} />}
                          </div>

                          {/* User Info */}
                          <div className="flex items-center gap-3">
                            {user.avatar ? (
                              <img src={proxiedImageUrl(user.avatar)} alt={user.firstName} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                            ) : (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 bg-zinc-800 shadow-inner`}>
                                <UserIcon size={14} />
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-semibold text-zinc-200">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-zinc-500">{user.email}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="shrink-0 pt-2">
                <button 
                  onClick={assignUsers}
                  disabled={isAssignDisabled}
                  className={`
                    w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all duration-300
                    ${isAssignDisabled 
                      ? 'bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5' 
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 active:scale-[0.98]'
                    }
                  `}
                >
                  Assign {selectedUsers.length} {selectedUsers.length === 1 ? 'User' : 'Users'} to Moderator
                </button>
              </div>

            </div>
          </div>

          {/* Right Panel: Current Assignments */}
          <div className="lg:col-span-5 bg-[#18181b] border border-white/5 rounded-2xl shadow-xl shadow-black/20 flex flex-col h-[600px] overflow-hidden">
            <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-white/[0.01] shrink-0">
              <Users size={18} className="text-blue-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Current Assignments</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
              <div className="space-y-3">
                {data?.moderators.map((mod) => (
                  <div key={mod.id} className="bg-[#09090b] border border-white/5 rounded-xl hover:border-white/10 transition-colors group">
                    <div 
                      className="p-4 flex items-center justify-between gap-4 cursor-pointer"
                      onClick={() => toggleModeratorExpansion(mod.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {mod.avatar ? (
                          <img src={proxiedImageUrl(mod.avatar)} alt={mod.firstName} className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0" />
                        ) : (
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 bg-zinc-800 shadow-inner shrink-0`}>
                            <UserIcon size={18} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="text-sm font-semibold text-zinc-200 truncate">{mod.firstName} {mod.lastName}</h4>
                            {mod.department && (
                              <span className="hidden sm:inline-flex px-1.5 py-0.5 bg-zinc-800 text-zinc-400 text-[10px] rounded border border-white/5 whitespace-nowrap">
                                {formatDepartmentName(mod.department)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 truncate">{mod.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg whitespace-nowrap">
                          {mod._count.assignedUsers} users
                        </span>
                        <ChevronDown 
                          size={18} 
                          className={`text-zinc-500 group-hover:text-zinc-300 transition-transform duration-300 ${expandedModerators.includes(mod.id) ? 'rotate-180' : ''}`} 
                        />
                      </div>
                    </div>

                    {/* Expandable Assigned Users */}
                    {expandedModerators.includes(mod.id) && (
                      <div className="px-4 pb-4 pt-1 border-t border-white/5">
                        {showAssignedUsers[mod.id] ? (
                          showAssignedUsers[mod.id].length === 0 ? (
                            <p className="text-zinc-500 text-xs text-center py-2">
                              No users assigned
                            </p>
                          ) : (
                            <div className="space-y-1.5 mt-2">
                              {showAssignedUsers[mod.id].map((assignedUser) => (
                                <div
                                  key={assignedUser.id}
                                  className="flex items-center justify-between p-2.5 bg-[#18181b] rounded-lg border border-white/5"
                                >
                                  <div className="flex items-center gap-2.5">
                                    {assignedUser.avatar ? (
                                      <img
                                        src={proxiedImageUrl(assignedUser.avatar)}
                                        alt={assignedUser.firstName}
                                        className="w-6 h-6 rounded-full object-cover border border-white/10"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                        <UserIcon size={12} />
                                      </div>
                                    )}
                                    <span className="text-xs font-medium text-zinc-300">
                                      {assignedUser.firstName} {assignedUser.lastName}
                                    </span>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      unassignUser(assignedUser.id);
                                    }}
                                    className="text-rose-500 hover:text-rose-400 p-1.5 hover:bg-rose-500/10 rounded-md transition-colors"
                                    title="Unassign user"
                                  >
                                    <UserMinus size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )
                        ) : (
                          <div className="flex justify-center py-4">
                            <SectionLoader height="h-8" message="Loading assigned users..." />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Global CSS for custom scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}} />
    </div>
  );
}
