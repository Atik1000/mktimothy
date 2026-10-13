"use client";

import { Phone, Video, X, Check } from "lucide-react";
import { useEffect } from "react";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import { startRingtone, stopRingtone } from "@/lib/utils/sounds";

interface IncomingSession {
  id: string;
  status: string;
  schedule: {
    id: string;
    callType: "AUDIO" | "VIDEO";
    caller: { id: string; firstName: string; lastName: string; avatar?: string | null };
  };
}

interface Props {
  incoming: IncomingSession | null;
  onAccept: (session: IncomingSession) => void;
  onDecline: (session: IncomingSession) => void;
}

/**
 * Floating ring banner shown when an incoming call is ringing for the user.
 */
export function IncomingCallBanner({ incoming, onAccept, onDecline }: Props) {
  useEffect(() => {
    if (incoming) {
      startRingtone();
      return () => stopRingtone();
    }
  }, [incoming]);

  if (!incoming) return null;
  const { caller, callType } = incoming.schedule;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white border border-[#d1d7db] rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            {caller.avatar ? (
              <img
                src={proxiedImageUrl(caller.avatar)}
                alt=""
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/40"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-[#008069] font-bold border-2 border-emerald-500/40">
                {caller.firstName[0]}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              {callType === "VIDEO" ? (
                <Video size={8} className="text-black" />
              ) : (
                <Phone size={8} className="text-black" />
              )}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#111b21] truncate">
              {caller.firstName} {caller.lastName}
            </p>
            <p className="text-xs text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Incoming {callType === "VIDEO" ? "video" : "audio"} call...
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { stopRingtone(); onDecline(incoming); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-600/90 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            <X size={16} /> Decline
          </button>
          <button
            onClick={() => { stopRingtone(); onAccept(incoming); }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-sm font-semibold transition-colors"
          >
            <Check size={16} /> Accept
          </button>
        </div>
      </div>
    </div>
  );
}

export type { IncomingSession };
