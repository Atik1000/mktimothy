"use client";

import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import { useEffect, useRef, useState } from "react";
import { Check, MoreVertical, Eye, CheckCircle, XCircle, User, Trash2 } from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "USER" | "ADMIN" | "MODERATOR" | "INVESTOR";
  avatar?: string;
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  lastLoginAt?: string;
}

interface RequestsTableProps {
  users: User[];
  selectedUsers: string[];
  onSelectAll: () => void;
  onSelectUser: (userId: string) => void;
  onRequestAction: (action: string, userId: string) => void;
  isLoading?: boolean;
}

const RequestsTable: React.FC<RequestsTableProps> = ({
  users,
  selectedUsers,
  onSelectAll,
  onSelectUser,
  onRequestAction,
  isLoading = false,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const clickedInsideAnyDropdown = Object.values(dropdownRefs.current).some(
        (ref) => ref && ref.contains(event.target as Node),
      );
      if (!clickedInsideAnyDropdown) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDropdownToggle = (userId: string) => {
    setOpenDropdown(openDropdown === userId ? null : userId);
  };

  const handleAction = (action: string, userId: string) => {
    setOpenDropdown(null);
    if (action === "view") {
      window.open(`/profile/${userId}`, "_blank");
      return;
    }
    onRequestAction(action, userId);
  };

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-500 text-sm">Loading requests...</p>
      </div>
    );
  }

  return (
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
          <th className="py-4 px-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Reg Date</th>
          <th className="py-4 px-5 w-14"></th>
        </tr>
      </thead>
      
      <tbody className="divide-y divide-white/5">
        {users.length === 0 ? (
          <tr>
            <td colSpan={5} className="py-16 text-center">
              <p className="text-zinc-500 text-sm">No pending requests</p>
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
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-400 bg-zinc-800 shadow-inner">
                      <User size={18} />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{user.firstName} {user.lastName}</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 capitalize">{user.role.toLowerCase()}</p>
                  </div>
                </div>
              </td>

              <td className="py-4 px-5">
                <span className="text-sm text-zinc-400">{user.email}</span>
              </td>

              <td className="py-4 px-5">
                <span className="text-sm text-zinc-500">
                  {new Date(user.createdAt).toLocaleDateString()}
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
                    className={`absolute right-8 ${users.length - index <= 3 ? "bottom-10" : "top-10"} bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-50 min-w-[150px] overflow-hidden`}
                  >
                    <button
                      onClick={() => handleAction("view", user.id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-zinc-300 hover:text-white transition-colors text-sm"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => handleAction("approve", user.id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-emerald-400 transition-colors text-sm"
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction("reject", user.id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-rose-500/10 flex items-center gap-3 text-rose-400 transition-colors text-sm border-t border-white/5"
                    >
                      <XCircle size={16} />
                      Block
                    </button>

                    <button
                      onClick={() => handleAction("delete", user.id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-rose-500/10 flex items-center gap-3 text-rose-500 transition-colors text-sm border-t border-white/5"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default RequestsTable;
