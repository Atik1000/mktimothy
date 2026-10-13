"use client";

import { Send, Paperclip, Smile, Mic, Square, X, Trash2 } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import toast from "react-hot-toast";

import type { ChatMessage } from "./hooks/useChat";

interface Props {
  onSend: (payload: {
    content: string;
    type?: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    replyToId?: string;
  }) => Promise<unknown>;
  onEdit?: (messageId: string, content: string) => Promise<unknown>;
  disabled?: boolean;
  replyingTo?: ChatMessage | null;
  setReplyingTo?: (msg: ChatMessage | null) => void;
  editingMsg?: ChatMessage | null;
  setEditingMsg?: (msg: ChatMessage | null) => void;
}

export function MessageInput({ 
  onSend, 
  onEdit,
  disabled,
  replyingTo,
  setReplyingTo,
  editingMsg,
  setEditingMsg
}: Props) {
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Populate input when editing
  useEffect(() => {
    if (editingMsg) {
      setText(editingMsg.content);
      setTimeout(autoGrow, 0);
    }
  }, [editingMsg]);

  const submitText = async () => {
    const content = text.trim();
    if (!content || isSending) return;
    setIsSending(true);

    if (editingMsg && onEdit) {
      try {
        await onEdit(editingMsg.id, content);
        setText("");
        setEditingMsg?.(null);
        if (textareaRef.current) textareaRef.current.style.height = "auto";
      } catch (e: any) {
        toast.error(e.message || "Failed to edit");
      } finally {
        setIsSending(false);
      }
      return;
    }

    try {
      await onSend({ content, replyToId: replyingTo?.id });
      setText("");
      setReplyingTo?.(null);
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    } catch (e: any) {
      toast.error(e.message || "Failed to send");
    } finally {
      setIsSending(false);
    }
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // For Phase 1, attachments are referenced by URL only if provided.
    // Full upload-to-MinIO can be wired in later; here we read it as a data URL
    // for images under 2MB and reject larger files.
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Attachments up to 2MB for now");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const fileUrl = reader.result as string;
      const isImage = file.type.startsWith("image/");
      try {
        await onSend({
          content: file.name,
          type: isImage ? "IMAGE" : "DOCUMENT",
          fileUrl,
          fileName: file.name,
          fileSize: file.size,
        });
      } catch (err: any) {
        toast.error(err.message || "Failed to send file");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const autoGrow = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunks.current.push(e.data);
        }
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onload = async () => {
          const fileUrl = reader.result as string;
          try {
            await onSend({
              content: "Voice Message",
              type: "AUDIO",
              fileUrl,
              fileName: "voice_message.webm",
              fileSize: audioBlob.size,
            });
          } catch (err: any) {
            toast.error(err.message || "Failed to send voice message");
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
        if (timerInterval.current) clearInterval(timerInterval.current);
        setRecordingDuration(0);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      timerInterval.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      toast.error("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder.current && isRecording) {
      // Prevent the onstop handler from firing the onSend callback
      mediaRecorder.current.onstop = null;
      mediaRecorder.current.stop();
      mediaRecorder.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerInterval.current) clearInterval(timerInterval.current);
      setRecordingDuration(0);
    }
  };

  return (
    <div className="p-4 shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 relative bg-white rounded-full">
        {/* Reply / Edit Preview */}
        {(replyingTo || editingMsg) && (
          <div className="absolute bottom-[100%] left-0 right-0 mb-3 mx-2 sm:mx-0 bg-white border border-[#e9edef] rounded-xl p-3 flex items-start gap-3 shadow-xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-[#008069] mb-1 flex items-center justify-between">
                {editingMsg ? "Editing Message" : `Replying to ${replyingTo?.sender?.firstName || 'User'}`}
              </div>
              <div className="text-sm text-[#3b4a54] truncate">
                {editingMsg?.content || replyingTo?.content || (replyingTo?.type !== "TEXT" ? replyingTo?.type : "")}
              </div>
            </div>
            <button
              onClick={() => {
                if (editingMsg) {
                  setEditingMsg?.(null);
                  setText("");
                  setTimeout(autoGrow, 0);
                }
                if (replyingTo) setReplyingTo?.(null);
              }}
              className="p-1.5 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Emoji Picker Popup */}
        {showEmojiPicker && (
          <div ref={emojiRef} className="absolute bottom-[110%] left-0 z-50 shadow-2xl rounded-lg overflow-hidden animate-in fade-in slide-in-from-bottom-2">
            <Picker 
              data={data} 
              onEmojiSelect={(emoji: any) => {
                setText((prev) => prev + emoji.native);
                setTimeout(autoGrow, 0);
              }} 
              theme="light"
              previewPosition="none"
              skinTonePosition="none"
            />
          </div>
        )}

        <div className="flex gap-1 pb-1">
          <button
            type="button"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`p-2 rounded-full transition-colors ${
              showEmojiPicker ? "bg-[#e9edef] text-[#008069]" : "text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef]"
            }`}
            title="Emoji"
          >
            <Smile size={22} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="p-2 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors hidden sm:block"
            title="Attach file"
          >
            <Paperclip size={22} strokeWidth={1.5} />
          </button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={onFile}
          />
        </div>

        <div className="flex-1 bg-white rounded-lg overflow-hidden transition-all">
          {isRecording ? (
            <div className="w-full bg-transparent text-[#008069] font-medium px-4 py-3 sm:py-3.5 min-h-[44px] flex items-center justify-between">
              <div className="flex items-center gap-3 animate-pulse">
                <Mic size={18} className="animate-bounce" />
                Recording... {formatDuration(recordingDuration)}
              </div>
              <button
                onClick={cancelRecording}
                className="text-[#8696a0] hover:text-rose-500 transition-colors p-1 flex items-center justify-center rounded-full hover:bg-[#f0f2f5]"
                title="Cancel recording"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              rows={1}
              placeholder="Type a message..."
              value={text}
              disabled={disabled || isRecording}
              onChange={(e) => {
                setText(e.target.value);
                autoGrow();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitText();
                }
              }}
              className="w-full bg-transparent text-[#111b21] placeholder:text-[#8696a0] p-2 outline-none border-none focus:outline-none focus:border-none"
            />
          )}
        </div>

        {text.trim() || isSending ? (
          <button
            onClick={submitText}
            disabled={disabled || isSending || !text.trim()}
            className="p-2.5 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors active:scale-95 shrink-0 disabled:opacity-50"
            title="Send"
          >
            <Send size={24} strokeWidth={1.5} />
          </button>
        ) : isRecording ? (
          <button
            onClick={stopRecording}
            className="p-2.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors active:scale-95 shrink-0 animate-in zoom-in-90"
            title="Stop & Send"
          >
            <Square size={24} className="fill-current" />
          </button>
        ) : (
          <button
            onClick={startRecording}
            disabled={disabled}
            className="p-2.5 text-[#54656f] hover:text-[#111b21] hover:bg-[#e9edef] rounded-full transition-colors active:scale-95 shrink-0 animate-in zoom-in-90 disabled:opacity-50"
            title="Voice Message"
          >
            <Mic size={24} strokeWidth={1.5} />
          </button>
        )}
      </div>
    </div>
  );
}
