"use client";

import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatRail, type RailTab } from "@/components/chat/ChatRail";
import { CallHistoryList } from "@/components/chat/CallHistoryList";
import { CallView } from "@/components/chat/CallView";
import { IncomingCallBanner, type IncomingSession } from "@/components/chat/IncomingCallBanner";
import { NewChatModal, type ChatableUser } from "@/components/chat/NewChatModal";
import { useAuth } from "@/lib/providers/auth-provider";
import { useRooms, type ChatRoom } from "@/components/chat/hooks/useChat";
import { useIncomingCall } from "@/components/chat/hooks/useIncomingCall";
import { useRouter } from "next/navigation";
import { RiChatNewFill } from "react-icons/ri";
import Image from "next/image";

export default function MessagesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { rooms, createRoom } = useRooms(user?.id);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);

  // Rail tab: chats (main interface) or calls (history view).
  const [railTab, setRailTab] = useState<RailTab>("chats");

  // Favorites (DB-backed, syncs across devices).
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/chat/favorites");
        const data = await res.json();
        if (!cancelled && data.success) setFavorites(data.roomIds ?? []);
      } catch {
        /* swallow */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const toggleFavorite = useCallback(
    async (roomId: string, favorite: boolean) => {
      // Optimistic update; the API is idempotent so a retry is harmless.
      setFavorites((prev) =>
        favorite
          ? Array.from(new Set([...prev, roomId]))
          : prev.filter((id) => id !== roomId)
      );
      try {
        await fetch("/api/chat/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomId, favorite }),
        });
      } catch {
        /* keep optimistic state; next load re-syncs */
      }
    },
    []
  );

  // Honor ?room=<id> deep-link (from listing "Message Business").
  const deepRoomId = searchParams.get("room");
  useEffect(() => {
    if (deepRoomId && rooms.some((r) => r.id === deepRoomId)) {
      setActiveRoomId(deepRoomId);
      setRailTab("chats");
    }
  }, [deepRoomId, rooms]);

  // Active call session (full-screen CallView mounted).
  const [activeCall, setActiveCall] = useState<{
    session: any;
    myRole: "caller" | "callee" | "monitor";
  } | null>(null);

  // Incoming ring detection.
  const { incoming, setIncoming } = useIncomingCall(user?.id);

  // Redirect unauthenticated users to login.
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect=/messages");
    }
  }, [isLoading, user, router]);

  const acceptCall = useCallback(
    async (session: IncomingSession) => {
      setIncoming(null);
      // Fetch full session details (with schedule participants).
      try {
        const res = await fetch(`/api/calls/sessions/${session.id}`);
        const data = await res.json();
        if (data.success) {
          setActiveCall({ session: data.session, myRole: "callee" });
        }
      } catch {
        /* swallow */
      }
    },
    [setIncoming]
  );

  const declineCall = useCallback(
    async (session: IncomingSession) => {
      setIncoming(null);
      await fetch(`/api/calls/sessions/${session.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline" }),
      }).catch(() => {});
    },
    [setIncoming]
  );

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-[#54656f] text-sm">Loading messages...</div>
      </div>
    );
  }

  const activeRoom: ChatRoom | null =
    rooms.find((r) => r.id === activeRoomId) ?? null;

  const unreadTotal = rooms.reduce(
    (sum, r) => sum + (r.unreadCount ?? 0),
    0
  );

  const handlePick = async (target: ChatableUser) => {
    try {
      const room = await createRoom(target.id);
      if (room) setActiveRoomId(room.id);
      setNewChatOpen(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      {/* WhatsApp Web light theme: #ffffff panels, #f0f2f5 rail/header,
          #efeae2 conversation background. */}
      <div className="flex-1 flex overflow-hidden relative bg-white text-[#111b21] font-sans h-screen">
        {/* Navigation rail — Messages / Calls (top), Settings / Profile (bottom) */}
        <ChatRail
          activeTab={railTab}
          onTabChange={setRailTab}
          unreadCount={unreadTotal}
          profileHref={`/profile/${user.id}`}
          profileAvatarUrl={user.avatar}
        />

        {/* Mobile: show list OR window; desktop: both */}
        <div
          className={`w-full md:w-[400px] md:border-r border-[#d1d7db] flex-shrink-0 ${
            activeRoomId ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="w-full h-full flex-1 flex flex-col">
            {railTab === "chats" ? (
              <>
                <div className="px-5 flex items-center justify-between shrink-0">
                  <div className="flex items-center">
                    <button
                      onClick={() => router.push("/")}
                      className="-ml-2 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors"
                      title="Back to Home"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    {/* Client logo in the header (replaces "Messages" title) */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <Image
                      width={200}
                      height={200}
                      src="/images/mkorange.png"
                      alt="MK Timothy"
                      className="w-full max-w-[150px] object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setNewChatOpen(true)}
                      className="p-2 text-textdark hover:bg-[#e9edef] rounded-full transition-colors"
                      title="New chat"
                    >
                      <RiChatNewFill size={20} />
                    </button>
                  </div>
                </div>
                <ChatList
                  rooms={rooms}
                  activeRoomId={activeRoomId}
                  viewerId={user.id}
                  onSelect={setActiveRoomId}
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                />
              </>
            ) : (
              <CallHistoryList viewerId={user.id} />
            )}
          </div>
        </div>

        <div
          className={`flex-1 flex flex-col min-h-0 bg-[#efeae2] ${
            activeRoomId ? "flex" : "hidden md:flex"
          }`}
        >
          <ChatWindow
            room={activeRoom}
            viewerId={user.id}
            onBack={() => setActiveRoomId(null)}
            onRequestCall={() => {}}
            isFav={activeRoomId ? favorites.includes(activeRoomId) : false}
            onToggleFavorite={(fav) => {
              if (activeRoomId) toggleFavorite(activeRoomId, fav);
            }}
          />
        </div>

        <NewChatModal
          open={newChatOpen}
          onClose={() => setNewChatOpen(false)}
          onPick={handlePick}
        />
      </div>

      {/* Incoming call ring */}
      {!activeCall && (
        <IncomingCallBanner
          incoming={incoming}
          onAccept={acceptCall}
          onDecline={declineCall}
        />
      )}

      {/* Active full-screen call */}
      {activeCall && (
        <CallView
          session={activeCall.session}
          myId={user.id}
          myRole={activeCall.myRole}
          onClose={() => setActiveCall(null)}
        />
      )}
    </>
  );
}
