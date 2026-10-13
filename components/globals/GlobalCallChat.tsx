"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/providers/auth-provider";
import { useIncomingCall } from "@/components/chat/hooks/useIncomingCall";
import { IncomingCallOverlay } from "@/components/chat/IncomingCallOverlay";
import { FloatingChatButton } from "@/components/globals/FloatingChatButton";
import { CallView } from "@/components/chat/CallView";
import { unlockAudio } from "@/lib/utils/sounds";
import type { IncomingCallSession } from "@/components/chat/IncomingCallOverlay";

/**
 * GlobalCallChat — mounted once inside <AuthProvider> so it runs on every
 * page that has the Providers wrapper. Provides two app-wide features:
 *
 * 1. Floating chat button (bottom-right) with unread badge + notification
 *    chime on new messages. Hidden on /messages and /chats.
 *
 * 2. Incoming call detection + full-screen ring overlay with audible
 *    ringtone. On /messages the page handles its own call UI, so we skip
 *    the overlay here to avoid duplication. On all other pages we show
 *    the full-screen IncomingCallOverlay and mount CallView on accept.
 */
export function GlobalCallChat() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Active call session (mounted full-screen via CallView).
  const [activeCall, setActiveCall] = useState<{
    session: any;
    myRole: "caller" | "callee" | "monitor";
  } | null>(null);

  // Incoming call detection. Always active for authenticated users — even on
  // /messages (where it's harmless because we skip rendering the overlay there
  // and the page uses its own useIncomingCall instance).
  const { incoming, setIncoming } = useIncomingCall(user?.id, {
    // Only the callee role gets rings; admin monitors join manually.
    enabled: !!user && user.role !== "ADMIN",
  });

  const onMessagesPage = pathname === "/messages";

  // ---- Incoming call handlers (used everywhere except /messages) ---------
  const acceptCall = useCallback(
    async (session: IncomingCallSession) => {
      setIncoming(null);
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
    async (session: IncomingCallSession) => {
      setIncoming(null);
      await fetch(`/api/calls/sessions/${session.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline" }),
      }).catch(() => {});
    },
    [setIncoming]
  );

  // Don't render anything for unauthenticated visitors.
  if (!user) return null;

  return (
    <>
      <AudioUnlockListener />

      {/* Floating chat button — always visible (except on chat pages) */}
      <FloatingChatButton />

      {/* Incoming call overlay — only on non-/messages pages. The /messages
          page has its own IncomingCallBanner + CallView. */}
      {!onMessagesPage && incoming && !activeCall && (
        <IncomingCallOverlay
          incoming={incoming}
          onAccept={acceptCall}
          onDecline={declineCall}
        />
      )}

      {/* Active call — full-screen CallView */}
      {!onMessagesPage && activeCall && (
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

/**
 * One-time gesture listener that unlocks the Web Audio API. Browsers block
 * AudioContext until the user interacts with the page. We attach a one-shot
 * click/touch/keydown listener on mount so the first interaction anywhere
 * unlocks audio for the ringtone and notification chime.
 */
function AudioUnlockListener() {
  useEffect(() => {
    const handler = () => {
      unlockAudio();
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("keydown", handler);
    };
    document.addEventListener("click", handler);
    document.addEventListener("touchstart", handler);
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("keydown", handler);
    };
  }, []);
  return null;
}
