"use client";

import { Search, X, User } from "lucide-react";
import { useEffect, useState } from "react";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";

interface ChatableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string | null;
  role: string;
  jobTitle?: string | null;
  company?: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onPick: (user: ChatableUser) => void;
}

export function NewChatModal({ open, onClose, onPick }: Props) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<ChatableUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    async function load() {
      try {
        const res = await fetch(
          `/api/chat/users${query ? `?q=${encodeURIComponent(query)}` : ""}`,
        );
        const data = await res.json();
        if (!cancelled && data.success) setUsers(data.users);
      } catch {
        /* swallow */
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    const t = setTimeout(load, 250); // debounce
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [open, query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white border border-[#d1d7db] rounded-2xl shadow-2xl overflow-hidden mt-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f2f5]">
          <h3 className="text-lg font-semibold text-[#111b21]">New conversation</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#54656f] hover:text-[#111b21] hover:bg-[#f5f6f6] rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 border-b border-[#f0f2f5]">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8696a0]"
              size={16}
            />
            <input
              autoFocus
              type="text"
              placeholder="Search by name or email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#f0f2f5] border border-[#d1d7db] text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#008069]/50 text-[#111b21] placeholder:text-[#8696a0]"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto custom-scrollbar">
          {loading && (
            <div className="p-6 text-center text-[#54656f] text-sm">
              Loading...
            </div>
          )}
          {!loading && users.length === 0 && (
            <div className="p-6 text-center text-[#54656f] text-sm">
              No users found.
            </div>
          )}
          {users.map((u) => (
            <button
              key={u.id}
              onClick={() => onPick(u)}
              className="w-full flex items-center gap-3 p-4 hover:bg-[#f5f6f6] transition-colors text-left border-b border-[#f0f2f5] last:border-0"
            >
              {u.avatar ? (
                <img
                  src={proxiedImageUrl(u.avatar)}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border border-[#d1d7db]"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#dfe5e7] flex items-center justify-center text-[#54656f]">
                  <User size={18} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111b21] truncate">
                  {u.firstName} {u.lastName}
                </p>
                <p className="text-xs text-[#54656f] truncate">
                  {u.jobTitle || u.company || u.email}
                </p>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-[#008069] font-semibold">
                {u.role === "USER" ? "Entrepreneur" : u.role}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export type { ChatableUser };
