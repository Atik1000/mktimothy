"use client";

import { MessageCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMessageNotification } from "@/components/chat/hooks/useMessageNotification";
import { useAuth } from "@/lib/providers/auth-provider";

/**
 * FloatingChatButton — fixed bottom-right chat icon visible on all pages
 * for authenticated users. Shows the total unread message count as a badge
 * and plays a notification chime when a new message arrives. Hidden on
 * /messages and /chats (where the full chat UI is already open).
 */
export function FloatingChatButton() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Admin uses the dashboard chat monitor at /chats, not /messages.
  const isAdmin = user?.role === "ADMIN";
  const targetPath = isAdmin ? "/chats" : "/messages";

  const { unreadCount } = useMessageNotification(user?.id);

  // Don't render if no user or already on a chat page.
  if (!user) return null;
  if (pathname === "/messages" || pathname === "/chats") return null;

  return (
    <button
      onClick={() => router.push(targetPath)}
      className={`fixed right-6 z-40 ${pathname === "/whatsapp-chatbot" ? "bottom-28" : "bottom-6"} w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95`}
      title={unreadCount > 0 ? `${unreadCount} unread messages` : "Messages"}
      aria-label="Open messages"
    >
      <MessageCircle size={26} className="text-white" />

      {/* Unread badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 bg-rose-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
