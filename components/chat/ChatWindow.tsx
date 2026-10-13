"use client";

import {
  ArrowLeft,
  Phone,
  Video,
  User,
  MessageSquare,
  ShieldCheck,
  PhoneCall,
  Calendar,
  Search,
  X,
  MoreVertical,
  Ban,
  UserCircle,
  Trash2,
  Flag,
  Star,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import { isScheduleWindowOpen } from "@/lib/utils/calls";
import { CallRequestModal } from "./CallRequestModal";
import { ClearChatModal } from "./ClearChatModal";
import { ReportUserModal } from "./ReportUserModal";
import { CallView } from "./CallView";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import { useChat, type ChatRoom, type ChatMessage } from "./hooks/useChat";
import { useRoomSchedules } from "./hooks/useRoomSchedules";
import { useBlockedUsers } from "./hooks/useBlockedUsers";

interface Props {
  room: ChatRoom | null;
  viewerId: string;
  isAdmin?: boolean;
  onBack?: () => void;
  /** Fired when the user clicks the call button. */
  onRequestCall?: (room: ChatRoom, type: "AUDIO" | "VIDEO") => void;
  isFav?: boolean;
  onToggleFavorite?: (fav: boolean) => void;
}

interface ScheduleForRoom {
  id: string;
  callType: "AUDIO" | "VIDEO";
  status: string;
  startDateTime: string;
  endDateTime: string;
  callerId: string;
  calleeId: string;
}

export function ChatWindow({
  room,
  viewerId,
  isAdmin = false,
  onBack,
  onRequestCall,
  isFav,
  onToggleFavorite,
}: Props) {
  const { messages, isLoadingMessages, error, sendMessage, editMessage, deleteMessage, clearChat } = useChat({
    userId: viewerId,
    roomId: room?.id ?? null,
  });
  const router = useRouter();

  const [callModalOpen, setCallModalOpen] = useState(false);
  const [activeCallSession, setActiveCallSession] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [adminBlockConfirmOpen, setAdminBlockConfirmOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const { blockedIds, blockedByIds, toggleBlock } = useBlockedUsers();

  // Fetch call schedules for this viewer (to show "Start Call" when approved).
  const { schedules } = useRoomSchedules(viewerId);

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const other = useMemo(() => {
    if (!room || room.type !== "DIRECT") return null;
    return room.participants.find((p) => p.id !== viewerId) || null;
  }, [room, viewerId]);

  const isBlockedByMe = other ? blockedIds.includes(other.id) : false;
  const isBlockedByThem = other ? blockedByIds.includes(other.id) : false;

  // Approved schedules for THIS room (both caller and callee see them).
  // We exclude any whose window has fully passed (endDateTime < now) so the
  // panel doesn't accumulate a long list of finished calls. The server also
  // lazily flips past APPROVED→COMPLETED, but this guards the in-between time.
  const roomSchedules = useMemo<ScheduleForRoom[]>(() => {
    if (!room || !other) return [];
    const now = new Date();
    return schedules.filter(
      (s) =>
        s.status === "APPROVED" &&
        new Date(s.endDateTime) >= now &&
        (s.callerId === viewerId || s.calleeId === viewerId) &&
        (s.callerId === other.id || s.calleeId === other.id)
    );
  }, [schedules, room, other, viewerId]);

  // Among those, which are open right now?
  const openSchedules = useMemo(() => {
    const now = new Date();
    return roomSchedules.filter((s) => isScheduleWindowOpen(s as any, now));
  }, [roomSchedules]);

  const startCall = useCallback(
    async (scheduleId: string) => {
      try {
        const res = await fetch("/api/calls/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scheduleId }),
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.error);
        // Normalize: the POST route returns session + schedule separately; the
        // GET route nests schedule inside session. Merge so CallView always
        // sees session.schedule.
        const fullSession = {
          ...data.session,
          schedule: data.session?.schedule || data.schedule,
        };
        if (!fullSession.schedule) {
          throw new Error("Call session is missing schedule details.");
        }
        setActiveCallSession(fullSession);
      } catch (e: any) {
        toast.error(e.message || "Could not start call");
      }
    },
    []
  );

  // Close the 3-dot menu when clicking outside it.
  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  // Block the other participant (admin only full ban).
  const blockOtherAdmin = useCallback(() => {
    if (!other) return;
    setMenuOpen(false);
    setAdminBlockConfirmOpen(true);
  }, [other]);

  // Block the other participant (user to user).
  const handleToggleBlock = async () => {
    if (!other) return;
    setMenuOpen(false);
    
    if (!isBlockedByMe) {
      setBlockConfirmOpen(true);
      return;
    }
    
    // Direct unblock without confirm
    setBlocking(true);
    const success = await toggleBlock(other.id, false);
    if (success) {
      toast.success(`Unblocked ${other.name}`);
    } else {
      toast.error("Failed to update block status");
    }
    setBlocking(false);
  };

  // In-conversation message search.
  const visibleMessages = useMemo(() => {
    if (!searchOpen || !searchQuery.trim()) return messages;
    const q = searchQuery.toLowerCase();
    return messages.filter(
      (m) =>
        m.content?.toLowerCase().includes(q) ||
        `${m.sender?.firstName} ${m.sender?.lastName}`
          .toLowerCase()
          .includes(q)
    );
  }, [messages, searchOpen, searchQuery]);

  if (!room) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-[#f0f2f5] rounded-full flex items-center justify-center mb-6 border border-[#e9edef]">
          <MessageSquare size={32} className="text-[#667781]" />
        </div>
        <h2 className="text-xl font-bold text-[#111b21] mb-2">Your Messages</h2>
        <p className="text-[#667781] max-w-sm">
          Select a conversation from the left, or start a new one.
        </p>
      </div>
    );
  }

  // For admin monitoring a DIRECT room, show "A → B" so it's obvious who is
  // talking to whom. For regular users, just show the other person's name.
  const title = isAdmin
    ? room.type === "DIRECT"
      ? room.participants.map((p) => p.name).join(" → ")
      : room.name || room.participants.map((p) => p.name).join(", ")
    : other?.name || room.participants.map((p) => p.name).join(", ");
  const avatar = other?.avatar ?? null;

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Header */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between border-b border-[#e9edef] bg-white shadow-md sticky top-0 z-10">
        <div className="flex items-center gap-4 min-w-0">
          {onBack && (
            <button
              className="md:hidden p-2 -ml-2 text-[#54656f] hover:text-[#111b21] rounded-full transition-colors"
              onClick={onBack}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          {/* Avatar + name open the other user's profile (same destination as
              the chat-row dropdown's "View profile"). Not clickable for an
              admin monitoring the room — there is no single "other" user. */}
          <div
            className={`flex items-center gap-3 min-w-0 rounded-lg transition-colors ${
              !isAdmin && other
                ? "cursor-pointer hover:bg-[#f5f6f6] -mx-1.5 px-1.5 py-1"
                : ""
            }`}
            onClick={() => {
              if (!isAdmin && other) router.push(`/profile/${other.id}`);
            }}
            title={!isAdmin && other ? "View profile" : undefined}
          >
            <div className="relative shrink-0">
              {avatar ? (
                <img
                  src={proxiedImageUrl(avatar)}
                  alt={title}
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
              ) : (
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#8696a0] bg-[#e9edef]">
                  <User size={18} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-[#111b21] truncate">
                {title}
              </h2>
              <p className="text-xs text-[#667781] truncate">
                {isAdmin ? (
                  <span className="inline-flex items-center gap-1 text-amber-400">
                    <ShieldCheck size={12} /> Admin monitoring
                  </span>
                ) : (
                  other?.role?.toLowerCase() || "direct"
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Request a new call */}
          {!isAdmin && (
            <>
              <button
                onClick={() => {
                  onRequestCall?.(room, "AUDIO");
                  setCallModalOpen(true);
                }}
                className="p-2.5 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors"
                title="Request audio call"
              >
                <Phone size={18} />
              </button>
              <button
                onClick={() => {
                  onRequestCall?.(room, "VIDEO");
                  setCallModalOpen(true);
                }}
                className="p-2.5 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors"
                title="Request video call"
              >
                <Video size={18} />
              </button>
            </>
          )}

          <div className="w-px h-5 bg-[#e9edef] mx-1" />

          {/* Search in conversation */}
          <button
            onClick={() => {
              setSearchOpen((v) => !v);
              setSearchQuery("");
            }}
            className={`p-2.5 rounded-full transition-colors ${
              searchOpen
                ? "text-[#008069] bg-[#e9edef]"
                : "text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef]"
            }`}
            title="Search messages"
          >
            <Search size={18} />
          </button>

          {/* 3-dot menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`p-2.5 rounded-full transition-colors ${
                menuOpen
                  ? "text-[#008069] bg-[#e9edef]"
                : "text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef]"
              }`}
              title="More options"
            >
              <MoreVertical size={18} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-[#e9edef] rounded-xl shadow-2xl overflow-hidden z-20 py-1">
                {other && (
                  <button
                    onClick={() => {
                      router.push(`/profile/${other.id}`);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#3b4a54] hover:bg-[#f5f6f6] transition-colors text-left"
                  >
                    <UserCircle size={16} className="text-[#54656f]" />
                    View profile
                  </button>
                )}
                {onToggleFavorite && (
                  <button
                    onClick={() => {
                      onToggleFavorite(!isFav);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#3b4a54] hover:bg-[#f5f6f6] transition-colors text-left"
                  >
                    <Star size={16} className={isFav ? "text-[#ffc943]" : "text-[#54656f]"} />
                    {isFav ? "Remove from favorites" : "Add to favorites"}
                  </button>
                )}
                {isAdmin && other ? (
                  <button
                    onClick={blockOtherAdmin}
                    disabled={blocking}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#3b4a54] hover:bg-[#f5f6f6] transition-colors text-left disabled:opacity-50"
                  >
                    <Ban size={16} className="text-[#54656f]" />
                    {blocking ? "Blocking..." : "Block user (System Ban)"}
                  </button>
                ) : other ? (
                  <button
                    onClick={handleToggleBlock}
                    disabled={blocking}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#3b4a54] hover:bg-[#f5f6f6] transition-colors text-left disabled:opacity-50"
                  >
                    <Ban size={16} className="text-[#54656f]" />
                    {blocking ? "Updating..." : isBlockedByMe ? "Unblock user" : "Block user"}
                  </button>
                ) : null}
                {other && !isAdmin && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setReportModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#3b4a54] hover:bg-[#f5f6f6] transition-colors text-left"
                  >
                    <Flag size={16} className="text-[#54656f]" />
                    Report user
                  </button>
                )}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    setClearModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-[#3b4a54] hover:bg-[#f5f6f6] transition-colors text-left"
                >
                  <Trash2 size={16} className="text-[#54656f]" />
                  Clear chat (view)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* In-conversation search bar */}
      {searchOpen && (
        <div className="px-4 sm:px-6 py-2.5 border-b border-[#e9edef] bg-[#f0f2f5] flex items-center gap-2">
          <Search size={15} className="text-[#667781] shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search this conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#111b21] placeholder:text-[#8696a0] focus:outline-none"
          />
          {searchQuery && (
            <span className="text-xs text-[#667781]">
              {visibleMessages.length} match
              {visibleMessages.length === 1 ? "" : "es"}
            </span>
          )}
          <button
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
            className="p-1 text-[#54656f] hover:text-[#111b21] rounded-full"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Approved-calls panel — shows every approved call for this room with
          its status and a Start button when the window is open. */}
      {!isAdmin && roomSchedules.length > 0 && (
        <div className="px-4 sm:px-6 py-2.5 border-b border-[#e9edef] bg-[#f0f2f5] space-y-2">
          {roomSchedules.map((s) => {
            const isOpen = openSchedules.some((o) => o.id === s.id);
            const start = new Date(s.startDateTime);
            const end = new Date(s.endDateTime);
            const now = new Date();
            const isPast = end < now;
            const isUpcoming = start > now;
            return (
              <div
                key={s.id}
                className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs ${
                  isOpen
                    ? "bg-emerald-500/10 border border-emerald-500/30"
                    : isPast
                    ? "bg-[#e9edef] border border-[#d1d7db] opacity-60"
                    : "bg-amber-500/10 border border-amber-500/20"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {s.callType === "VIDEO" ? (
                    <Video size={14} className={isOpen ? "text-emerald-400" : "text-[#54656f]"} />
                  ) : (
                    <Phone size={14} className={isOpen ? "text-emerald-400" : "text-[#54656f]"} />
                  )}
                  <div className="min-w-0">
                    <p className={`font-medium truncate ${isOpen ? "text-[#008069]" : "text-[#3b4a54]"}`}>
                      {s.callType === "VIDEO" ? "Video" : "Audio"} call ·{" "}
                      {start.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}{" "}
                      {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      {" – "}
                      {end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="text-[10px] text-[#667781]">
                      {isOpen
                        ? "✓ Window open now — you can start the call"
                        : isUpcoming
                        ? `Starts ${start.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}`
                        : "Call window has ended"}
                    </p>
                  </div>
                </div>
                {isOpen && (
                  <button
                    onClick={() => startCall(s.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00a884] hover:bg-[#017561] text-white rounded-full text-[11px] font-bold transition-colors shrink-0 animate-pulse"
                  >
                    <PhoneCall size={12} />
                    Start
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 thin-green-scrollbar"
      >
        {isLoadingMessages ? (
          <div className="text-center text-[#667781] py-8 text-sm">
            Loading messages...
          </div>
        ) : error ? (
          <div className="text-center text-rose-400 py-8 text-sm">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-[#667781] py-8 text-sm">
            Say hello 👋
          </div>
        ) : searchOpen && visibleMessages.length === 0 ? (
          <div className="text-center text-[#667781] py-8 text-sm">
            No messages match “{searchQuery}”.
          </div>
        ) : (
          <div className="flex flex-col gap-4 mx-auto">
            {visibleMessages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                isMine={m.senderId === viewerId}
                showSender={isAdmin ? true : false}
                isAdmin={isAdmin}
                onReply={() => setReplyingTo(m)}
                onEdit={() => setEditingMsg(m)}
                onDelete={(type) => deleteMessage(m.id, type)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      {isBlockedByMe ? (
        <div className="p-4 text-center text-sm text-[#667781] bg-[#f5f6f6] border-t border-[#e9edef]">
          You blocked this contact.{" "}
          <button onClick={handleToggleBlock} className="text-emerald-400 hover:underline">
            Unblock
          </button>{" "}
          to send a message.
        </div>
      ) : isBlockedByThem ? (
        <div className="p-4 text-center text-sm text-[#667781] bg-[#f5f6f6] border-t border-[#e9edef]">
          You cannot reply to this conversation.
        </div>
      ) : (
        <MessageInput 
          onSend={sendMessage} 
          onEdit={editMessage}
          replyingTo={replyingTo}
          setReplyingTo={setReplyingTo}
          editingMsg={editingMsg}
          setEditingMsg={setEditingMsg}
        />
      )}

      {!isAdmin && (
        <CallRequestModal
          open={callModalOpen}
          onClose={() => setCallModalOpen(false)}
          room={room}
          viewerId={viewerId}
        />
      )}

      <ClearChatModal
        open={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={async () => {
          try {
            await clearChat();
            toast.success("Conversation cleared from view");
          } catch (err) {
            toast.error("Failed to clear chat");
          }
        }}
      />

      {/* Report User Modal */}
      {reportModalOpen && other && (
        <ReportUserModal
          userId={other.id}
          userName={other.name}
          onClose={() => setReportModalOpen(false)}
        />
      )}

      {/* User Block Confirm Modal */}
      {blockConfirmOpen && other && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#e9edef] rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-[#111b21] mb-2">Block {other.name}?</h2>
            <p className="text-[#54656f] text-sm mb-6">
              They will no longer be able to message you.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setBlockConfirmOpen(false)}
                className="flex-1 px-4 py-2.5 bg-[#f0f2f5] hover:bg-[#e9edef] text-[#111b21] rounded-xl text-sm font-medium transition-colors"
                disabled={blocking}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setBlocking(true);
                  const success = await toggleBlock(other.id, true);
                  if (success) {
                    toast.success(`Blocked ${other.name}`);
                    setBlockConfirmOpen(false);
                  } else {
                    toast.error("Failed to block user");
                  }
                  setBlocking(false);
                }}
                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                disabled={blocking}
              >
                {blocking ? "Blocking..." : "Block"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Ban Confirm Modal */}
      {adminBlockConfirmOpen && other && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-[#e9edef] rounded-2xl w-full max-w-sm shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-[#111b21] mb-2">System Ban {other.name}?</h2>
            <p className="text-[#54656f] text-sm mb-6">
              They will be logged out and unable to use the system.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setAdminBlockConfirmOpen(false)}
                className="flex-1 px-4 py-2.5 bg-[#f0f2f5] hover:bg-[#e9edef] text-[#111b21] rounded-xl text-sm font-medium transition-colors"
                disabled={blocking}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setBlocking(true);
                  try {
                    const res = await fetch(`/api/users/${other.id}/block`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ block: true }),
                    });
                    const data = await res.json();
                    if (!data.success) throw new Error(data.error);
                    toast.success(`${other.name} has been blocked.`);
                    setAdminBlockConfirmOpen(false);
                  } catch (e: any) {
                    toast.error(e.message || "Failed to block user");
                  } finally {
                    setBlocking(false);
                  }
                }}
                className="flex-1 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                disabled={blocking}
              >
                {blocking ? "Blocking..." : "Ban User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active full-screen call (caller side) */}
      {activeCallSession && (
        <CallView
          session={activeCallSession}
          myId={viewerId}
          myRole="caller"
          onClose={() => setActiveCallSession(null)}
        />
      )}
    </div>
  );
}
