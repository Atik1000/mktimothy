"use client";

import {
  CheckCheck,
  Check,
  FileText,
  Download,
  User as UserIcon,
  X,
  Reply,
  Pencil,
  ChevronDown,
  Ban,
  Play,
  Pause,
  Mic,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { ChatMessage } from "./hooks/useChat";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

interface Props {
  message: ChatMessage;
  isMine: boolean;
  /**
   * Show the sender's avatar + name above the bubble (group/admin-monitor style).
   * False for normal 1:1 user view, true for admin monitoring.
   */
  showSender?: boolean;
  isAdmin?: boolean;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: (type: "ME" | "EVERYONE") => void;
}

const SENDER_COLORS = [
  "text-emerald-600",
  "text-sky-600",
  "text-amber-600",
  "text-rose-600",
  "text-violet-600",
  "text-pink-600",
];
function colorForId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return SENDER_COLORS[h % SENDER_COLORS.length];
}

export function MessageBubble(props: Props) {
  return <MessageBubbleInner {...props} />;
}

function CustomAudioPlayer({ src, isMine, avatarUrl, fallbackName }: { src: string; isMine: boolean; avatarUrl?: string | null; fallbackName: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => { setIsPlaying(false); setCurrentTime(0); };
    
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const time = Number(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div className="flex items-center gap-3 min-w-[250px] sm:min-w-[300px] pt-2 pb-2 pl-1 pr-3">
      <audio ref={audioRef} src={src} preload="metadata" />
      
      {/* Play/Pause Button */}
      <button onClick={togglePlay} className="shrink-0 focus:outline-none">
        {isPlaying ? (
          <Pause size={28} className={isMine ? "text-[#54656f]" : "text-[#54656f]"} fill="currentColor" />
        ) : (
          <Play size={28} className={isMine ? "text-[#54656f]" : "text-[#54656f]"} fill="currentColor" />
        )}
      </button>

      {/* Track & Time */}
      <div className="flex-1 flex flex-col justify-center relative mt-1">
        <div className="flex items-center gap-1 w-full h-8 relative group">
          <input 
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={onSeek}
            className="w-full h-1.5 bg-[#d1d7db] rounded-full appearance-none cursor-pointer outline-none z-10"
            style={{
              background: `linear-gradient(to right, ${isMine ? '#54656f' : '#00a884'} ${(currentTime / (duration || 1)) * 100}%, #d1d7db ${(currentTime / (duration || 1)) * 100}%)`
            }}
          />
          {/* A tiny blue dot for the thumb is standard browser styling but we can override it via global css. For now the gradient does the trick */}
        </div>
        <div className="flex justify-between text-[11px] text-[#54656f] -mt-1">
          <span>{formatTime(currentTime || duration)}</span>
        </div>
      </div>

      {/* Avatar */}
      <div className="relative shrink-0 w-11 h-11 rounded-full ml-1">
        {avatarUrl ? (
          <img src={proxiedImageUrl(avatarUrl)} alt="Avatar" className="w-full h-full object-cover rounded-full" />
        ) : (
          <div className="w-full h-full bg-[#d1d7db] flex items-center justify-center rounded-full">
            <UserIcon size={24} className="text-white" />
          </div>
        )}
        <div className="absolute -bottom-1 -left-2 bg-white rounded-full p-0.5 shadow-sm text-[#34b7f1]">
          <Mic size={14} fill="currentColor" />
        </div>
      </div>
    </div>
  );
}

function MessageBubbleInner({
  message,
  isMine,
  showSender,
  isAdmin,
  onReply,
  onEdit,
  onDelete,
}: Props) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const sender = message.sender;
  const senderName = sender
    ? `${sender.firstName} ${sender.lastName}`.trim()
    : "Unknown";
  const senderColor = sender ? colorForId(sender.id) : "text-[#8696a0]";

  const canEdit =
    isMine &&
    message.type === "TEXT" &&
    Date.now() - new Date(message.createdAt).getTime() <= 5 * 60 * 1000;

  const isDeleted = message.isDeletedForEveryone || (!message.content?.trim() && !message.fileUrl);

  return (
    <div
      className={`group relative flex gap-2.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar column — shown in group mode */}
      {showSender && (
        <div className="w-8 shrink-0 pt-0.5 self-start">
          {sender?.avatar ? (
            <img
              src={proxiedImageUrl(sender.avatar)}
              alt={senderName}
              className="w-8 h-8 rounded-full object-cover border border-white/10"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#f0f2f5] flex items-center justify-center text-[#8696a0]">
              <UserIcon size={14} />
            </div>
          )}
        </div>
      )}

      <div
        className={`max-w-[85%] sm:max-w-[75%] min-w-0 ${isMine ? "items-end" : "items-start"} flex flex-col`}
      >
        {showSender && (
          <span
            className={`text-[11px] font-semibold mb-0.5 ${isMine ? "text-emerald-600" : senderColor}`}
          >
            {isMine ? "You (Admin)" : senderName}
            {sender?.role === "ADMIN" && !isMine && (
              <span className="ml-1.5 px-1 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold uppercase">
                Admin
              </span>
            )}
          </span>
        )}

        <div
          className={`flex items-center gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
        >
          <div
            className={`relative p-1.5 shadow-sm ${
              isMine
                ? "bg-[#d9fdd3] text-[#111b21] rounded-2xl rounded-tr-sm"
                : "bg-white text-[#111b21] rounded-2xl rounded-tl-sm"
            }`}
          >
            {isDeleted && !isAdmin ? (
              <div className="flex items-center gap-2 text-[#8696a0] italic py-1 pr-6">
                <Ban size={14} />
                <span className="text-[14px]">This message was deleted</span>
              </div>
            ) : (
              <>
                {/* Reply Context Block */}
                {message.replyTo && (
              <div
                  className={`mb-2 pl-3 border-l-4 rounded-r-md py-1 px-2 text-[13px] ${
                    isMine
                      ? "border-[#99e3c1] bg-[#c9f5c0] text-[#005c4b]"
                      : "border-[#00a884] bg-[#f0f2f5] text-[#54656f]"
                  }`}
              >
                <div className="font-semibold mb-0.5 opacity-90 text-[11px]">
                  {message.replyTo.sender?.firstName || "User"}
                </div>
                <div className="truncate opacity-80 max-w-[200px] sm:max-w-[250px]">
                  {message.replyTo.content ||
                    (message.replyTo.type !== "TEXT"
                      ? message.replyTo.type
                      : "")}
                </div>
              </div>
            )}

            {/* Attachments */}
            {message.type === "IMAGE" && message.fileUrl && (
              <>
                <button
                  onClick={() => setIsImageOpen(true)}
                  className="block w-full mb-1 hover:opacity-90 transition-opacity focus:outline-none"
                >
                  <img
                    src={proxiedImageUrl(message.fileUrl)}
                    alt={message.fileName || "image"}
                    className="rounded-md max-h-72 w-full object-cover"
                  />
                </button>

                {isImageOpen && (
                  <div
                    className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in"
                    onClick={() => setIsImageOpen(false)}
                  >
                    <button
                      onClick={() => setIsImageOpen(false)}
                      className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                    >
                      <X size={24} />
                    </button>
                    <img
                      src={proxiedImageUrl(message.fileUrl)}
                      alt={message.fileName || "image"}
                      className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                )}
              </>
            )}

            {message.type === "AUDIO" && message.fileUrl && (
              <CustomAudioPlayer 
                src={proxiedImageUrl(message.fileUrl)} 
                isMine={isMine} 
                avatarUrl={message.sender?.avatar} 
                fallbackName={message.sender?.firstName || "U"}
              />
            )}

            {(message.type === "VIDEO" || message.type === "DOCUMENT") &&
              message.fileUrl && (
                <a
                  href={proxiedImageUrl(message.fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-2 mb-2 px-3 py-2 rounded-lg ${
                    isMine
                      ? "bg-[#c9f5c0] hover:bg-[#bcecb1]"
                      : "bg-[#f0f2f5] hover:bg-[#e9edef]"
                  } transition-colors`}
                >
                  {message.type === "DOCUMENT" ? (
                    <FileText size={18} />
                  ) : (
                    <Download size={18} />
                  )}
                  <span className="text-sm truncate flex-1">
                    {message.fileName || "Attachment"}
                  </span>
                </a>
              )}

            {/* Text — overflow-wrap:anywhere (not break-words) so long
                unbroken strings like shared call links wrap instead of
                inflating the bubble past its max-width (break-words doesn't
                reduce the min-content width; anywhere does). */}
            {message.type === "TEXT" && (
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]">
                {message.content}
              </p>
            )}
            
            {isDeleted && isAdmin && (
              <div className="text-[10px] text-rose-400 font-semibold bg-rose-400/10 px-2 py-0.5 rounded border border-rose-400/20 mt-1 inline-block">
                User deleted this message for everyone
              </div>
            )}
          </>
          )}

          <div
            className={`flex items-center justify-end gap-1 mt-1 -mb-1 ${
                isMine ? "text-[#667781]" : "text-[#667781]"
              }`}
            >
              {message.isEdited && (
                <span className="mr-1 italic opacity-70 text-[10px]">
                  (edited)
                </span>
              )}
              <span className="text-[10px] uppercase font-medium tracking-wider">
                {new Date(message.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              {isMine &&
                (message.status === "READ" ? (
                  <CheckCheck size={14} className="text-sky-500" />
                ) : (
                  <Check size={14} />
                ))}
            </div>

            {/* Dropdown Menu using Radix UI */}
            <div className={`absolute top-0 right-0 p-1 transition-opacity z-10 ${menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
              <DropdownMenu.Root open={menuOpen} onOpenChange={setMenuOpen}>
                <DropdownMenu.Trigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-0.5 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transition-colors"
                  >
                    <ChevronDown size={18} />
                  </button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    sideOffset={4}
                    className="bg-white border border-[#e9edef] shadow-2xl rounded-lg z-50 flex flex-col min-w-[120px] py-1 overflow-hidden animate-in fade-in zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                  >
                    <DropdownMenu.Item
                      onSelect={() => onReply?.()}
                      className="px-4 py-2 text-sm text-black hover:bg-[#f5f6f6] text-left w-full transition-colors cursor-pointer outline-none"
                    >
                      Reply
                    </DropdownMenu.Item>
                    {canEdit && (
                      <DropdownMenu.Item
                        onSelect={() => onEdit?.()}
                        className="px-4 py-2 text-sm text-black hover:bg-[#f5f6f6] text-left w-full transition-colors cursor-pointer outline-none"
                      >
                        Edit
                      </DropdownMenu.Item>
                    )}
                    <DropdownMenu.Item
                      onSelect={() => onDelete?.("ME")}
                      className="px-4 py-2 text-sm text-rose-400 hover:bg-[#f5f6f6] text-left w-full transition-colors cursor-pointer outline-none"
                    >
                      Delete for me
                    </DropdownMenu.Item>
                    {isMine && (
                      <DropdownMenu.Item
                        onSelect={() => onDelete?.("EVERYONE")}
                        className="px-4 py-2 text-sm text-rose-400 hover:bg-[#f5f6f6] text-left w-full transition-colors cursor-pointer outline-none"
                      >
                        Delete for everyone
                      </DropdownMenu.Item>
                    )}
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
