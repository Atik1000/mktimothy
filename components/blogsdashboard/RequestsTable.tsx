"use client";

import { useEffect, useRef, useState } from "react";
import { Check, MoreVertical, Eye, CheckCircle, XCircle, Edit2 } from "lucide-react";

const RequestsTable = ({
  mockUsers,
  selectedUsers,
  handleSelectAll,
  handleSelectUser,
  onAction,
}: {
  mockUsers: any;
  selectedUsers: any;
  handleSelectAll: any;
  handleSelectUser: any;
  onAction?: (action: "approve" | "reject" | "edit", blogId: string) => void;
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
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

  const handleAction = (action: string, userId: string) => {
    setOpenDropdown(null);
    if (onAction) {
      if (action === "accept" || action === "approve") {
        onAction("approve", userId);
      } else if (action === "reject") {
        onAction("reject", userId);
      } else if (action === "edit") {
        onAction("edit", userId);
      } else if (action === "view") {
        window.open(`/blog-details/${userId}`, "_blank");
      }
    }
  };

  if (!mockUsers || mockUsers.length === 0) {
    return null;
  }

  return (
    <table className="w-full text-left border-collapse min-w-[900px] font-sans">
      <thead>
        <tr className="border-b border-white/5 bg-white/[0.01]">
          <th className="py-4 px-5 w-14">
            <div 
              onClick={handleSelectAll}
              className={`w-5 h-5 rounded-md border flex items-center justify-center cursor-pointer transition-colors ${
                selectedUsers.length === mockUsers.length && mockUsers.length > 0
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'border-white/20 bg-[#09090b] hover:border-emerald-500/50'
              }`}
            >
              {selectedUsers.length === mockUsers.length && mockUsers.length > 0 && <Check size={12} strokeWidth={3} />}
            </div>
          </th>
          <th className="py-4 px-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Title</th>
          <th className="py-4 px-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Description</th>
          <th className="py-4 px-5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Type</th>
          <th className="py-4 px-5 w-14"></th>
        </tr>
      </thead>
      
      <tbody className="divide-y divide-white/5">
        {mockUsers.map((user: any, index: number) => (
          <tr 
            key={user.id} 
            className="hover:bg-white/[0.02] transition-colors group"
          >
            <td className="py-4 px-5">
              <div 
                onClick={() => handleSelectUser(user.id)}
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
              <p className="text-sm font-medium text-zinc-200 line-clamp-1">{user.title}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">By {user.author || "Unknown"}</p>
            </td>

            <td className="py-4 px-5">
              <span className="text-sm text-zinc-400 line-clamp-1">{user.description || "—"}</span>
            </td>

            <td className="py-4 px-5">
              <span className="text-sm text-zinc-500">{user.category || user.type || "—"}</span>
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
                  className={`absolute right-8 ${mockUsers.length - index <= 3 ? "bottom-10" : "top-10"} bg-[#18181b] border border-white/10 rounded-xl shadow-2xl z-50 min-w-[150px] overflow-hidden`}
                >
                  <button
                    onClick={() => handleAction("view", user.id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-zinc-300 hover:text-white transition-colors text-sm"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleAction("edit", user.id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-zinc-300 hover:text-white transition-colors text-sm"
                  >
                    <Edit2 size={16} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleAction("accept", user.id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-white/5 flex items-center gap-3 text-emerald-400 transition-colors text-sm"
                  >
                    <CheckCircle size={16} />
                    Accept
                  </button>
                  <button
                    onClick={() => handleAction("reject", user.id)}
                    className="w-full text-left px-4 py-2.5 hover:bg-rose-500/10 flex items-center gap-3 text-rose-400 transition-colors text-sm border-t border-white/5"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RequestsTable;
