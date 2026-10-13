"use client";

import { useAuth } from "@/lib/providers/auth-provider";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, MessageSquare, PenTool, LayoutGrid,
  MessageCircle, BarChart2, FolderTree, Bookmark, History, LogOut, ArrowLeft, ShieldCheck, Phone, Ticket, Headphones, Bot
} from 'lucide-react';
import { proxiedImageUrl } from "@/lib/utils/proxied-image";

const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  // All navigation items (mapped to Lucide icons)
  const navigationItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      id: "users",
      name: "Users",
      icon: Users,
      path: "/users",
      permission: "manage-users",
    },
    {
      id: "moderator-assignments",
      name: "Assignments",
      icon: ClipboardList,
      path: "/moderator-assignments",
      permission: "manage-assignments",
    },
    {
      id: "chat",
      name: "Chat",
      icon: MessageSquare,
      path: "/chats",
    },
    {
      id: "whatsapp-chatbot",
      name: "WhatsApp Chatbot",
      icon: Bot,
      path: "/whatsapp-chatbot",
    },
    {
      id: "calls",
      name: "Calls",
      icon: Phone,
      path: "/calls",
    },
    {
      id: "recordings",
      name: "Recordings",
      icon: Headphones,
      path: "/calls/recordings",
    },
    {
      id: "support-tickets",
      name: "Support Tickets",
      icon: Ticket,
      path: "/support-tickets",
    },
    {
      id: "blogs",
      name: "Blogs",
      icon: PenTool,
      path: "/blog",
      permission: "manage-blogs",
    },
    {
      id: "listings",
      name: "Listings",
      icon: LayoutGrid,
      path: "/listings",
      permission: "manage-listings",
    },
    {
      id: "comments",
      name: "Comments",
      icon: MessageCircle,
      path: "/comments",
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: BarChart2,
      path: "/analytics",
      permission: "manage-analytics",
    },
    {
      id: "categories",
      name: "Categories",
      icon: FolderTree,
      path: "/categories",
      permission: "manage-categories",
    },
    {
      id: "saved",
      name: "Saved",
      icon: Bookmark,
      path: "/saved",
    },
    {
      id: "history",
      name: "History",
      icon: History,
      path: "/history",
    },
    
  ];

  // Determine active navigation based on pathname
  const getActiveNavigation = () => {
    const currentNavItem = navigationItems.find((item) =>
      pathname.startsWith(item.path)
    );
    return currentNavItem?.id || "dashboard";
  };

  const activeNavigation = getActiveNavigation();

  return (
    <aside className="flex-1 w-full bg-[#121214] border-r border-white/5 flex flex-col font-sans">
      {/* Sidebar Header */}
      <div className="h-16 flex items-center px-6 border-b border-white/5 shrink-0">
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
      </div>

      {/* User Profile Snippet */}
      {user && (
        <div className="p-6 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img 
                src={proxiedImageUrl(user.avatar)}
                alt="User avatar" 
                className="w-10 h-10 rounded-full object-cover border border-white/10"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                <Users size={16} className="text-emerald-500" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-emerald-400 font-medium capitalize truncate">
                {user.role.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {navigationItems
          .filter((item) => {
            if (!user) return false;
            if (user.role === "ADMIN") return true;
            if (item.permission) {
              return user.subAdminPermissions?.includes(item.permission);
            }
            return true;
          })
          .map((item) => {
            const IconComponent = item.icon;
            const isActive = activeNavigation === item.id;

            return (
              <Link
                key={item.id}
                href={item.path}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium
                  ${isActive 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                  }
                `}
              >
                <IconComponent size={18} className={isActive ? 'text-emerald-400' : 'text-zinc-500'} />
                {item.name}
              </Link>
            );
          })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-white/5 shrink-0 space-y-2">
        {user?.role === "ADMIN" && (
          <div className="flex items-center justify-center gap-1.5 px-2 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-xs font-semibold uppercase tracking-wider border border-rose-500/20">
            <ShieldCheck size={14} />
            Administrator
          </div>
        )}
        {user?.role === "MODERATOR" && (
          <div className="flex items-center justify-center gap-1.5 px-2 py-1.5 bg-yellow-500/10 text-yellow-400 rounded-lg text-xs font-semibold uppercase tracking-wider border border-yellow-500/20">
            <ShieldCheck size={14} />
            Moderator
          </div>
        )}
        
        <button 
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:bg-white/5 hover:text-rose-400 transition-colors text-sm font-medium group"
        >
          <LogOut size={18} className="group-hover:text-rose-400 transition-colors" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
