"use client";

import { useAuth } from "@/lib/providers/auth-provider";
import { ROLE_DISPLAY_NAMES, UserRole } from "@/lib/utils/permissions";
import { useEffect, useRef, useState } from "react";
import { FaUserShield, FaUserTimes } from "react-icons/fa";
import { IoEyeOutline } from "react-icons/io5";
import { RiDeleteBinLine, RiUserSettingsLine } from "react-icons/ri";
import { Check, MoreVertical, User, Ban } from "lucide-react";
import DepartmentSelectionModal, {
  Department,
} from "./DepartmentSelectionModal";
import PermissionsSelectionModal, {
  SubAdminPermission,
} from "./PermissionsSelectionModal";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole | "INVESTOR";
  department?: string;
  subAdminPermissions?: SubAdminPermission[];
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface UsersTableProps {
  users: User[];
  selectedUsers: string[];
  onSelectAll: () => void;
  onSelectUser: (userId: string) => void;
  onUserAction: (action: string, userId: string, data?: any) => void;
  isLoading?: boolean;
}

const roleStyles: Record<string, string> = {
  blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "ADMIN": return 'rose';
    case "MODERATOR": return 'amber';
    case "INVESTOR": return 'emerald';
    default: return 'blue';
  }
};

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  selectedUsers,
  onSelectAll,
  onSelectUser,
  onUserAction,
  isLoading = false,
}) => {
  const { user: currentUser } = useAuth();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [roleChangeModal, setRoleChangeModal] = useState<{
    isOpen: boolean;
    userId: string;
    currentRole: UserRole;
  }>({ isOpen: false, userId: "", currentRole: "USER" });
  const [departmentModal, setDepartmentModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({ isOpen: false, userId: "", userName: "" });
  const [permissionsModal, setPermissionsModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
    initialPermissions: SubAdminPermission[];
  }>({ isOpen: false, userId: "", userName: "", initialPermissions: [] });
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedInsideAnyDropdown = Object.values(dropdownRefs.current).some(
        (ref) => ref && ref.contains(event.target as Node)
      );
      if (!clickedInsideAnyDropdown) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownToggle = (userId: string) => {
    setOpenDropdown(openDropdown === userId ? null : userId);
  };

  const handleAction = (action: string, userId: string, data?: any) => {
    setOpenDropdown(null);
    if (action === "view") {
      window.open(`/profile/${userId}`, "_blank");
      return;
    }
    onUserAction(action, userId, data);
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    if (newRole === "MODERATOR") {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setDepartmentModal({
          isOpen: true,
          userId,
          userName: `${user.firstName} ${user.lastName}`,
        });
        setRoleChangeModal({ isOpen: false, userId: "", currentRole: "USER" });
        return;
      }
    }
    handleAction("change_role", userId, { role: newRole });
    setRoleChangeModal({ isOpen: false, userId: "", currentRole: "USER" });
  };

  const handleDepartmentConfirm = (department: Department) => {
    handleAction("change_role", departmentModal.userId, {
      role: "MODERATOR",
      department,
    });
    setDepartmentModal({ isOpen: false, userId: "", userName: "" });
  };

  const handlePermissionsConfirm = (permissions: SubAdminPermission[]) => {
    handleAction("assign_permissions", permissionsModal.userId, { permissions });
    setPermissionsModal({ isOpen: false, userId: "", userName: "", initialPermissions: [] });
  };

  const canPerformAction = (action: string, targetUser: User) => {
    if (!currentUser) return false;
    if (action === "delete" && currentUser.id === targetUser.id) {
      return false;
    }
    return true;
  };

  const getAvailableRoles = (targetUser: User): UserRole[] => {
    const allRoles: UserRole[] = ["USER", "MODERATOR", "ADMIN", "INVESTOR"];
    return allRoles.filter((role) => role !== targetUser.role);
  };

  const formatDepartmentName = (department?: string) => {
    if (!department) return "";
    return department
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-500 text-sm">Loading users...</p>
      </div>
    );
  }

  return (
    <>
      <table className="w-full text-left border-collapse min-w-[900px] font-sans">
        <thead>
          <tr className="border-b border-white/5 bg-white/[0.01]">
            <th className="py-4 px-5 w-14">
              {/* Custom Checkbox for Select All */}
              <div 
                onClick={onSelectAll}
                className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                  selectedUsers.length === users.length && users.length > 0
                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                    : 'border-white/20 bg-[#09090b] hover:border-emerald-500/50'
                }`}
              >
                {selectedUsers.length === users.length && users.length > 0 && <Check size={12} strokeWidth={3} />}
              </div>
            </th>
            <th className="py-4 px-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Name</th>
            <th className="py-4 px-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</th>
            <th className="py-4 px-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Role</th>
            <th className="py-4 px-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
            <th className="py-4 px-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Last Login</th>
            <th className="py-4 px-5 w-14"></th>
          </tr>
        </thead>
        
        <tbody className="divide-y divide-white/5">
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-16 text-center">
                <p className="text-zinc-500 text-sm">No users found</p>
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr 
                key={user.id} 
                className="hover:bg-white/[0.02] transition-colors group"
              >
                <td className="py-4 px-5">
                  <div 
                    onClick={() => onSelectUser(user.id)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                      selectedUsers.includes(user.id)
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-white/20 bg-[#09090b] group-hover:border-emerald-500/50'
                    }`}
                  >
                    {selectedUsers.includes(user.id) && <Check size={12} strokeWidth={3} />}
                  </div>
                </td>
                
                <td className="py-4 px-5">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img src={proxiedImageUrl(user.avatar)} alt={user.firstName} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 bg-zinc-800 shadow-inner`}>
                        <User size={18} />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-zinc-200">{user.firstName} {user.lastName}</p>
                      {user.role === "MODERATOR" && user.department && (
                        <p className="text-[11px] text-zinc-500 mt-0.5">{formatDepartmentName(user.department)}</p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="py-4 px-5">
                  <span className="text-sm text-zinc-400">{user.email}</span>
                </td>

                <td className="py-4 px-5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${roleStyles[getRoleColor(user.role)]}`}>
                    {ROLE_DISPLAY_NAMES[user.role as UserRole] || user.role}
                  </span>
                </td>

                <td className="py-4 px-5">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      {user.isActive && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-20"></span>}
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${user.isActive ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                    </span>
                    <span className={`text-sm font-medium ${user.isActive ? "text-emerald-400" : "text-rose-400"}`}>{user.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </td>

                <td className="py-4 px-5">
                  <span className="text-sm text-zinc-500">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Never"}
                  </span>
                </td>

                <td className="py-4 px-5 text-right relative">
                  <button 
                    onClick={() => handleDropdownToggle(user.id)}
                    className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                  
                  {openDropdown === user.id && (
                    <div 
                      ref={(el) => { dropdownRefs.current[user.id] = el; }}
                      className={`absolute right-8 ${users.length - index <= 3 ? "bottom-10" : "top-10"} bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-50 min-w-[180px] overflow-hidden`}
                    >
                      <button
                        onClick={() => handleAction("view", user.id)}
                        className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-zinc-300 hover:text-white transition-colors text-sm"
                      >
                        <IoEyeOutline className="w-4 h-4" />
                        View
                      </button>

                      <button
                        onClick={() =>
                          setRoleChangeModal({
                            isOpen: true,
                            userId: user.id,
                            currentRole: user.role as UserRole,
                          })
                        }
                        className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-zinc-300 hover:text-white transition-colors text-sm"
                      >
                        <RiUserSettingsLine className="w-4 h-4" />
                        Change Role
                      </button>

                      {user.role === "MODERATOR" && (
                        <button
                          onClick={() =>
                            setPermissionsModal({
                              isOpen: true,
                              userId: user.id,
                              userName: `${user.firstName} ${user.lastName}`,
                              initialPermissions: user.subAdminPermissions || [],
                            })
                          }
                          className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-zinc-300 hover:text-white transition-colors text-sm"
                        >
                          <FaUserShield className="w-4 h-4" />
                          Assign Permissions
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handleAction(
                            user.isActive ? "suspend" : "activate",
                            user.id
                          )
                        }
                        className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-zinc-300 hover:text-white transition-colors text-sm"
                      >
                        {user.isActive ? (
                          <>
                            <FaUserTimes className="w-4 h-4" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <FaUserShield className="w-4 h-4" />
                            Activate
                          </>
                        )}
                      </button>

                      {canPerformAction("delete", user) && (
                        <button
                          onClick={() => handleAction("block", user.id)}
                          className="w-full text-left px-4 py-2.5 hover:bg-rose-500/10 flex items-center gap-3 text-rose-600 transition-colors text-sm border-t border-white/5"
                        >
                          <Ban className="w-4 h-4" />
                          Block
                        </button>
                      )}

                      {canPerformAction("delete", user) && (
                        <button
                          onClick={() => handleAction("delete", user.id)}
                          className="w-full text-left px-4 py-2.5 hover:bg-rose-500/10 flex items-center gap-3 text-rose-400 transition-colors text-sm border-t border-white/5"
                        >
                          <RiDeleteBinLine className="w-4 h-4" />
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Role Change Modal */}
      {roleChangeModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-white font-bold text-xl mb-2">
              Change User Role
            </h3>
            <p className="text-zinc-400 text-sm mb-6">
              Select a new role for this user. This action will immediately
              change their permissions.
            </p>

            <div className="space-y-2 mb-6">
              {getAvailableRoles(
                users.find((u) => u.id === roleChangeModal.userId)!
              ).map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(roleChangeModal.userId, role)}
                  className="w-full p-4 text-left bg-[#09090b] hover:bg-white/5 rounded-xl border border-white/5 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-zinc-200 font-medium text-sm">
                        {ROLE_DISPLAY_NAMES[role]}
                      </div>
                      <div className="text-zinc-500 text-xs mt-0.5">
                        {role === "ADMIN" && "Full system access and user management"}
                        {role === "MODERATOR" && "Content moderation and user oversight"}
                        {role === "USER" && "Standard user permissions"}
                        {role === "INVESTOR" && "Investor user permissions"}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${roleStyles[getRoleColor(role)]}`}>
                      {role}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() =>
                setRoleChangeModal({
                  isOpen: false,
                  userId: "",
                  currentRole: "USER",
                })
              }
              className="w-full bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl transition-colors text-sm font-medium border border-white/10"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Department Selection Modal */}
      <DepartmentSelectionModal
        isOpen={departmentModal.isOpen}
        onClose={() =>
          setDepartmentModal({ isOpen: false, userId: "", userName: "" })
        }
        onConfirm={handleDepartmentConfirm}
        userName={departmentModal.userName}
      />

      {/* Permissions Selection Modal */}
      <PermissionsSelectionModal
        isOpen={permissionsModal.isOpen}
        onClose={() =>
          setPermissionsModal({ isOpen: false, userId: "", userName: "", initialPermissions: [] })
        }
        onConfirm={handlePermissionsConfirm}
        userName={permissionsModal.userName}
        initialPermissions={permissionsModal.initialPermissions}
      />
    </>
  );
};

export default UsersTable;
