"use client";

import { X, Trash2 } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ClearChatModal({ open, onClose, onConfirm }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[#121214] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trash2 size={18} className="text-rose-500" />
            Clear Chat
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">
          <p className="text-sm text-zinc-300 mb-6">
            Are you sure you want to clear this conversation from your view? Messages will remain visible to the other party and admins.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:bg-rose-500/30 transition-colors"
            >
              Clear Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
