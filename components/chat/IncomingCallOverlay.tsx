"use client";

import { Phone, Video, X, Check } from "lucide-react";
import { useEffect } from "react";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import { startRingtone, stopRingtone } from "@/lib/utils/sounds";

export interface IncomingCallSession {
  id: string;
  status: string;
  schedule: {
    id: string;
    callType: "AUDIO" | "VIDEO";
    caller: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string | null;
    };
  };
}

interface Props {
  incoming: IncomingCallSession;
  onAccept: (session: IncomingCallSession) => void;
  onDecline: (session: IncomingCallSession) => void;
}

/**
 * Full-screen WhatsApp-style incoming call overlay. Shows on every page
 * (except /messages which uses its own banner). Plays an audible ringtone
 * on loop until the user accepts or declines.
 */
export function IncomingCallOverlay({ incoming, onAccept, onDecline }: Props) {
  const { caller, callType } = incoming.schedule;

  // Play ringtone while the overlay is mounted. Stop on unmount or action.
  useEffect(() => {
    startRingtone();
    return () => stopRingtone();
  }, []);

  const handleAccept = () => {
    stopRingtone();
    onAccept(incoming);
  };

  const handleDecline = () => {
    stopRingtone();
    onDecline(incoming);
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-[600px] min-h-[500px] bg-gradient-to-b from-[#0a0a0c] to-[#1a1a1e] border border-emerald-500/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col items-center justify-between py-12 px-6 animate-in zoom-in-95">
        {/* Caller info */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <p className="text-zinc-500 text-sm mb-1">
            Incoming {callType === "VIDEO" ? "video" : "audio"} call...
          </p>

          {/* Avatar with pulsing rings */}
          <div className="relative my-8">
            {/* Pulsing ring animations */}
            <span className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: "1.5s" }} />
            <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />

            <div className="relative w-32 h-32 rounded-full overflow-hidden ring-4 ring-emerald-500/40">
              {caller.avatar ? (
                <img
                  src={proxiedImageUrl(caller.avatar)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-emerald-500/20 flex items-center justify-center text-emerald-300 text-4xl font-bold">
                  {caller.firstName[0]}
                </div>
              )}
            </div>
          </div>

          <h2 className="text-white text-2xl font-semibold text-center">
            {caller.firstName} {caller.lastName}
          </h2>

          <div className="flex items-center gap-1.5 mt-2 text-emerald-400">
            {callType === "VIDEO" ? (
              <Video size={16} />
            ) : (
              <Phone size={16} />
            )}
            <span className="text-sm">
              {callType === "VIDEO" ? "Video call" : "Voice call"}
            </span>
          </div>
        </div>

        {/* Accept / Decline buttons */}
        <div className="w-full max-w-sm flex items-center justify-between px-8 mt-8">
          {/* Decline */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleDecline}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center transition-colors shadow-lg"
              aria-label="Decline"
            >
              <X size={28} className="text-white" />
            </button>
            <span className="text-zinc-400 text-xs">Decline</span>
          </div>

          {/* Accept */}
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleAccept}
              className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors shadow-lg animate-pulse"
              aria-label="Accept"
            >
              {callType === "VIDEO" ? (
                <Video size={28} className="text-black" />
              ) : (
                <Phone size={28} className="text-black" />
              )}
            </button>
            <span className="text-zinc-400 text-xs">Accept</span>
          </div>
        </div>
      </div>
    </div>
  );
}
