"use client";

import { Phone, Settings, User } from "lucide-react";
import { BsChatRightText, BsChatRightTextFill } from "react-icons/bs";
import { useRouter } from "next/navigation";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";

export type RailTab = "chats" | "calls";

interface Props {
  activeTab: RailTab;
  onTabChange: (tab: RailTab) => void;
  /** Unread total for the small green dot on the Messages icon. */
  unreadCount?: number;
  profileHref: string;
  profileAvatarUrl?: string | null;
}

/**
 * ChatRail — the thin WhatsApp-Web-style navigation rail on the far left of
 * /messages. Top: Messages (main chat interface) + Calls (call history).
 * Bottom: Settings (→ /profile/settings) and Profile (→ /profile/[id]).
 *
 * WhatsApp icon rail colors: bg #202c33, hover #2a3942, active #2a3942 with
 * the accent green #00a884 on the icon.
 */
export function ChatRail({
  activeTab,
  onTabChange,
  unreadCount = 0,
  profileHref,
  profileAvatarUrl,
}: Props) {
  const router = useRouter();

  const itemClass = (isActive: boolean) =>
    `relative w-10 h-10 flex items-center justify-center cursor-pointer transition-colors rounded-full ${
      isActive
        ? "bg-[#e9edef] text-[#111b21]"
        : "text-[#54656f] hover:bg-[#e9edef] hover:text-[#111b21]"
    }`;

  const NavButton = ({
    label,
    icon,
    isActive,
    onClick,
    badge,
  }: {
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    badge?: number;
  }) => (
    <div className="relative group">
      <button onClick={onClick} className={itemClass(isActive)} aria-label={label}>
        {icon}
        {!!badge && badge > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#00a884] text-white text-[10px] font-bold flex items-center justify-center">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </button>
      {/* Tooltip */}
      <span className="pointer-events-none absolute left-full ml-3 top-1/2 -translate-y-1/2 whitespace-nowrap bg-[#3b4a54] text-white text-xs px-2.5 py-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-lg">
        {label}
      </span>
    </div>
  );

  return (
    <div className="hidden md:flex w-[62px] flex-shrink-0 flex-col items-center justify-between py-4 bg-[#f0f2f5] border-r border-[#e9edef]">
      {/* Top: Messages + Calls */}
      <div className="flex flex-col items-center gap-1.5">
        <NavButton
          label="Messages"
          icon={activeTab === "chats" ? <BsChatRightTextFill size={20} /> : <BsChatRightText size={20} />}
          isActive={activeTab === "chats"}
          onClick={() => onTabChange("chats")}
          badge={activeTab === "chats" ? 0 : unreadCount}
        />
        <NavButton
          label="Calls"
          icon={<Phone size={22} />}
          isActive={activeTab === "calls"}
          onClick={() => onTabChange("calls")}
        />
      </div>

      {/* Bottom: Settings + Profile */}
      <div className="flex flex-col items-center gap-1.5">
        <NavButton
          label="Settings"
          icon={<Settings size={22} />}
          isActive={false}
          onClick={() => router.push("/profile/settings")}
        />
        <NavButton
          label="Profile"
          icon={
            profileAvatarUrl ? (
              <img src={proxiedImageUrl(profileAvatarUrl)} alt="Profile" className="w-[30px] h-[30px] rounded-full object-cover" />
            ) : (
              <User size={24} />
            )
          }
          isActive={false}
          onClick={() => router.push(profileHref)}
        />
      </div>
    </div>
  );
}
