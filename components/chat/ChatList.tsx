"use client";

import { Search, Star, User, ChevronDown, UserCircle, Check, CheckCheck } from "lucide-react";
import { useMemo, useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import type { ChatRoom } from "./hooks/useChat";

interface Props {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  viewerId: string;
  isAdmin?: boolean;
  onSelect: (roomId: string) => void;
  /** Ids of the viewer's starred rooms. When provided (with the toggle
   *  handler), the All/Unread/Favorites filter pills + row stars render. */
  favorites?: string[];
  onToggleFavorite?: (roomId: string, favorite: boolean) => void;
}

type Filter = "all" | "unread" | "favorites";

/** Display title for a room.
 *  - Admin DIRECT: "A → B" so it's clear who is talking to whom.
 *  - User DIRECT: just the other person's name.
 *  - Group: comma-joined names.
 */
function roomTitle(room: ChatRoom, viewerId: string, isAdmin?: boolean): string {
  if (room.type !== "DIRECT") {
    return room.participants.map((p) => p.name).join(", ");
  }
  if (isAdmin) {
    return room.participants.map((p) => p.name).join(" → ");
  }
  const other = room.participants.find((p) => p.id !== viewerId);
  return other?.name || "Unknown";
}

/** Single avatar for regular users; for admin DIRECT rooms we render a
 *  stacked pair (see RoomAvatarStack component below). */
function roomAvatar(room: ChatRoom, viewerId: string): string | null {
  if (room.type !== "DIRECT") return null;
  const other = room.participants.find((p) => p.id !== viewerId);
  return other?.avatar ?? null;
}

/** Stacked dual-avatar for admin monitoring a DIRECT room. */
function RoomAvatarStack({ room, viewerId, isAdmin }: { room: ChatRoom; viewerId: string; isAdmin?: boolean }) {
  if (!isAdmin || room.type !== "DIRECT") {
    const av = roomAvatar(room, viewerId);
    return av ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={proxiedImageUrl(av)}
        alt=""
        className="w-12 h-12 rounded-full object-cover"
      />
    ) : (
      <div className="w-12 h-12 rounded-full flex items-center justify-center text-[#8696a0] bg-[#202c33]">
        <User size={20} />
      </div>
    );
  }
  const [a, b] = room.participants;
  return (
    <div className="relative w-12 h-12 shrink-0">
      {a?.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={proxiedImageUrl(a.avatar)}
          alt=""
          className="w-8 h-8 rounded-full object-cover border-2 border-[#111b21] absolute top-0 left-0 z-10"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[#00a884] border-2 border-[#111b21] absolute top-0 left-0 z-10 flex items-center justify-center text-[10px] text-[#111b21] font-bold">
          {a?.name?.[0] || "?"}
        </div>
      )}
      {b?.avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={proxiedImageUrl(b.avatar)}
          alt=""
          className="w-8 h-8 rounded-full object-cover border-2 border-[#111b21] absolute bottom-0 right-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-[#36a4dd] border-2 border-[#111b21] absolute bottom-0 right-0 flex items-center justify-center text-[10px] text-[#111b21] font-bold">
          {b?.name?.[0] || "?"}
        </div>
      )}
    </div>
  );
}

/** WhatsApp-style timestamp for the row (HH:MM for today, else date). */
function rowTime(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  return sameDay
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "numeric", day: "numeric", year: "2-digit" });
}

export function ChatList({
  rooms,
  activeRoomId,
  viewerId,
  isAdmin,
  onSelect,
  favorites,
  onToggleFavorite,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleDocClick = () => setOpenDropdownId(null);
    // Use click, but we'll stop propagation in the button
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  const showFilters = typeof onToggleFavorite === "function";
  const favSet = useMemo(() => new Set(favorites ?? []), [favorites]);

  const counts = useMemo(() => {
    const unread = rooms.filter(
      (r) => typeof r.unreadCount === "number" && r.unreadCount > 0
    ).length;
    return { unread, favorites: favSet.size };
  }, [rooms, favSet]);

  const filtered = useMemo(() => {
    let list = rooms;
    if (filter === "unread") {
      list = list.filter(
        (r) => typeof r.unreadCount === "number" && r.unreadCount > 0
      );
    } else if (filter === "favorites") {
      list = list.filter((r) => favSet.has(r.id));
    }
    if (!query.trim()) return list;
    const q = query.toLowerCase();
    return list.filter((r) =>
      roomTitle(r, viewerId, isAdmin).toLowerCase().includes(q)
    );
  }, [rooms, query, viewerId, isAdmin, filter, favSet]);

  const pillClass = (isActive: boolean) =>
    `px-3 py-1.5 rounded-full text-[13px] font-medium cursor-pointer transition-colors whitespace-nowrap border ${
      isActive
        ? "bg-[#d8fdd2] border-transparent text-[#008069]"
        : "bg-white border-[#d1d7db] text-[#54656f] hover:bg-[#f5f6f6]"
    }`;

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="px-3 pt-3 pb-2 shrink-0 space-y-3">
        {/* Search — WhatsApp style pill */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8696a0]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search or start a new chat"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#f0f2f5] text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none text-[#111b21] placeholder:text-[#8696a0]"
          />
        </div>

        {/* Filter pills — All / Unread / Favorites (no Groups: that
            functionality doesn't exist on this platform) */}
        {showFilters && (
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            <button
              className={pillClass(filter === "all")}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={pillClass(filter === "unread")}
              onClick={() => setFilter("unread")}
            >
              Unread{counts.unread > 0 ? ` ${counts.unread}` : ""}
            </button>
            <button
              className={pillClass(filter === "favorites")}
              onClick={() => setFilter("favorites")}
            >
              Favorites{counts.favorites > 0 ? ` ${counts.favorites}` : ""}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filtered.length === 0 && (
          <div className="p-8 text-center text-[#54656f] text-sm">
            {filter === "favorites"
              ? "No favorite chats yet — tap the ☆ on a chat to pin it here."
              : filter === "unread"
                ? "No unread messages."
                : "No conversations found."}
          </div>
        )}
        {filtered.map((room) => {
          const isActive = activeRoomId === room.id;
          const isFav = favSet.has(room.id);
          return (
            <div
              key={room.id}
              onClick={() => onSelect(room.id)}
              className={`group max-w-[95%] w-full px-3 py-3.5 flex items-center gap-3 cursor-pointer transition-colors text-left m-2 rounded-xl ${
                isActive
                  ? "bg-[#f0f2f5]"
                  : "hover:bg-[#f5f6f6]"
              }`}
            >
              <div className="relative shrink-0">
                <RoomAvatarStack room={room} viewerId={viewerId} isAdmin={isAdmin} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-[16px] text-[#111b21] truncate">
                    {roomTitle(room, viewerId, isAdmin)}
                  </h3>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Favorite star / Dropdown — appears on hover */}
                    {showFilters && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.nativeEvent.stopImmediatePropagation();
                            setOpenDropdownId(openDropdownId === room.id ? null : room.id);
                          }}
                          className={`p-1 rounded-full transition-opacity ${
                            openDropdownId === room.id
                              ? "opacity-100 bg-[#e9edef] text-[#111b21]"
                              : "text-[#8696a0] opacity-0 group-hover:opacity-100 hover:text-[#111b21]"
                          }`}
                          title="Menu"
                        >
                          <ChevronDown size={20} />
                        </button>

                        {openDropdownId === room.id && (
                          <div 
                            className="absolute right-0 top-full mt-1 w-48 bg-white border border-[#e9edef] rounded-xl shadow-2xl overflow-hidden z-20 py-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => {
                                const other = room.participants.find(p => p.id !== viewerId);
                                if (other) {
                                  router.push(`/profile/${other.id}`);
                                }
                                setOpenDropdownId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#3b4a54] hover:bg-[#f5f6f6] transition-colors text-left"
                            >
                              <UserCircle size={16} className="text-[#54656f]" />
                              View profile
                            </button>
                            <button
                              onClick={() => {
                                onToggleFavorite?.(room.id, !isFav);
                                setOpenDropdownId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#3b4a54] hover:bg-[#f5f6f6] transition-colors text-left"
                            >
                              <Star size={16} className={isFav ? "text-[#ffc943]" : "text-[#54656f]"} />
                              {isFav ? "Remove from favorites" : "Add to favorites"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <span
                      className={`text-[12px] whitespace-nowrap ${
                        !!room.unreadCount && room.unreadCount > 0
                          ? "text-[#008069]"
                          : "text-[#54656f]"
                      }`}
                    >
                      {rowTime(room.lastMessageAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[13.5px] text-[#54656f] truncate flex-1 flex items-center gap-1">
                    {room.lastMessageSenderId === viewerId && (
                      <span className="shrink-0 flex items-center">
                        {room.lastMessageStatus === "READ" ? (
                          <CheckCheck size={16} className="text-[#53bdeb]" />
                        ) : room.lastMessageStatus === "DELIVERED" ? (
                          <CheckCheck size={16} className="text-[#8696a0]" />
                        ) : (
                          <Check size={16} className="text-[#8696a0]" />
                        )}
                      </span>
                    )}
                    <span className="truncate">{room.lastMessageContent || "No messages yet"}</span>
                  </div>
                  {!!room.unreadCount && room.unreadCount > 0 && (
                    <span className="shrink-0 bg-[#008069] text-white text-[11px] font-bold px-1.5 min-w-[20px] h-[18px] rounded-full flex items-center justify-center">
                      {room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
