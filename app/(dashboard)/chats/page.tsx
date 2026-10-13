"use client";

import { useEffect, useState } from "react";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useRooms, type ChatRoom } from "@/components/chat/hooks/useChat";
import { useAuth } from "@/lib/providers/auth-provider";
import { RiChatNewFill } from "react-icons/ri";
import { NewChatModal, type ChatableUser } from "@/components/chat/NewChatModal";

/**
 * Admin monitor view of every conversation on the platform.
 * The admin can open any room and read or post in it; participants see an
 * "Admin monitoring" indicator in the chat header.
 */
export default function ChatAdmin() {
  const { user } = useAuth();
  const { rooms, createRoom } = useRooms(user?.id);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [newChatOpen, setNewChatOpen] = useState(false);

  // Auto-select the most recent room on desktop.
  useEffect(() => {
    if (!activeRoomId && rooms.length > 0 && typeof window !== "undefined") {
      if (window.innerWidth >= 768) setActiveRoomId(rooms[0].id);
    }
  }, [rooms, activeRoomId]);

  const activeRoom: ChatRoom | null =
    rooms.find((r) => r.id === activeRoomId) ?? null;

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
      {/* chat-dark: remaps the shared light-styled chat components back to
          the WhatsApp dark palette for the admin monitor (see globals.css).
          flex-1 min-h-0: fills EXACTLY the space left by the dashboard
          Topbar/hamburger — no fixed pixel heights, sticks to the bottom. */}
      <div className="chat-dark flex-1 min-h-0 flex overflow-hidden relative bg-[#09090b] text-zinc-100 font-sans">
        <div className={`w-full md:w-[380px] flex-shrink-0 flex-col ${activeRoomId ? "hidden md:flex" : "flex"}`}>
          <div className="h-16 px-5 flex items-center justify-between border-b border-white/5 shrink-0 border-r">
            <h2 className="text-xl font-bold text-white tracking-tight">All Chats</h2>
            <button
              onClick={() => setNewChatOpen(true)}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
              title="New chat"
            >
              <RiChatNewFill size={20} />
            </button>
          </div>
          <ChatList
            rooms={rooms}
            activeRoomId={activeRoomId}
            viewerId={user?.id ?? ""}
            isAdmin
            onSelect={setActiveRoomId}
          />
        </div>

      <div className={`flex-1 ${activeRoomId ? "flex" : "hidden md:flex"}`}>
        <ChatWindow
          room={activeRoom}
          viewerId={user?.id ?? ""}
          isAdmin
          onBack={() => setActiveRoomId(null)}
        />
      </div>
    </div>
    <NewChatModal
      open={newChatOpen}
      onClose={() => setNewChatOpen(false)}
      onPick={handlePick}
    />
    </>
  );
}
