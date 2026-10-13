"use client";

import { useAuth } from "@/lib/providers/auth-provider";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, Bell, LogOut, User } from "lucide-react";
import CommandPalette from "./CommandPalette";

interface Notification {
  id: string;
  title?: string;
  message?: string;
  body?: string;
  isRead?: boolean;
  createdAt: string;
}

export default function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close popovers on outside click.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchNotifications = async () => {
    setLoadingNotifs(true);
    try {
      const token =
        localStorage.getItem("auth-token") || sessionStorage.getItem("auth-token");
      if (!token) return;
      const res = await fetch("/api/notifications?limit=8", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setNotifications(json.data.notifications ?? []);
        setUnread(json.data.unreadCount ?? 0);
      }
    } catch {
      /* leave empty state */
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    if (notifOpen && notifications.length === 0) fetchNotifications();
  }, [notifOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <>
      <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-30 font-sans">
        
        {/* Left Side: Search */}
        <div className="flex items-center gap-4">
          <div 
            className="relative hidden sm:block cursor-pointer group"
            onClick={() => setPaletteOpen(true)}
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-emerald-500 transition-colors" size={16} />
            <div className="w-72 bg-[#18181b] border border-white/5 text-sm rounded-lg pl-10 pr-12 py-2 text-zinc-600 group-hover:border-emerald-500/50 transition-all flex items-center">
              Search pages, users, listings...
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-zinc-800 rounded border border-white/10 text-[10px] font-medium text-zinc-400">
              ⌘K
            </div>
          </div>
          
          {/* Mobile search icon */}
          <button 
            className="sm:hidden p-2 text-zinc-400 hover:text-white bg-white/5 rounded-lg transition-colors"
            onClick={() => setPaletteOpen(true)}
          >
            <Search size={18} />
          </button>
        </div>

        {/* Right Side: Notifications & Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button 
              onClick={() => setNotifOpen((v) => !v)}
              className="relative p-2 text-zinc-400 hover:text-white transition-colors bg-white/5 rounded-full border border-white/5 hover:bg-white/10"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-[#09090b]"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl overflow-hidden font-sans">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <span className="text-white font-semibold text-sm">Notifications</span>
                  {unread > 0 && (
                    <span className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded">
                      {unread} unread
                    </span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {loadingNotifs ? (
                    <div className="px-4 py-8 text-center text-zinc-500 text-sm">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-zinc-500 text-sm">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`px-4 py-3 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${
                          !n.isRead ? "bg-emerald-500/5" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-zinc-200 text-sm font-medium truncate">
                              {n.title ?? "Notification"}
                            </p>
                            {(n.message || n.body) && (
                              <p className="text-zinc-400 text-xs mt-0.5 line-clamp-2">
                                {n.message ?? n.body}
                              </p>
                            )}
                            <p className="text-zinc-600 text-[11px] mt-1.5 font-medium">
                              {timeAgo(n.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

          {/* User Profile */}
          <div className="relative" ref={userRef}>
            <div 
              onClick={() => setUserOpen((v) => !v)}
              className="flex items-center gap-2 cursor-pointer group"
            >
              {user?.avatar ? (
                <img 
                  src={proxiedImageUrl(user.avatar)}
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-white/10 group-hover:border-white/30 transition-colors object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center group-hover:border-emerald-500/40 transition-colors">
                  <User size={14} className="text-emerald-500" />
                </div>
              )}
              
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors max-w-[120px] truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                  {user?.role?.toLowerCase()}
                </p>
              </div>
            </div>

            {/* Profile Dropdown */}
            {userOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl overflow-hidden font-sans">
                <div className="px-4 py-3 border-b border-white/5 bg-[#121214]">
                  <p className="text-white text-sm font-medium truncate">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-zinc-500 text-xs truncate mt-0.5">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setUserOpen(false);
                    router.push("/users");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <User size={16} />
                  Profile
                </button>
                <button
                  onClick={async () => {
                    await logout();
                    router.push("/login");
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-white/5"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </>
  );
}
