"use client";

import { Loader2, Phone, PhoneOff, Video as VideoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CallView } from "@/components/chat/CallView";
import { useAuth } from "@/lib/providers/auth-provider";

interface JoinSession {
  id: string;
  status: string;
  schedule: {
    callType: "AUDIO" | "VIDEO";
    caller: { id: string; firstName: string; lastName: string; avatar?: string | null; role: string };
    callee: { id: string; firstName: string; lastName: string; avatar?: string | null; role: string };
  };
}

/**
 * /calls/join/[id] — share-link landing page.
 *
 * Anyone with the link (copied from the Share button inside an active call)
 * can join the call as a GUEST participant — e.g. a translator, or another
 * investor. Requires being logged in; the session must be ACTIVE.
 */
export default function JoinCallPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [session, setSession] = useState<JoinSession | null>(null);
  const [state, setState] = useState<
    "loading" | "ready" | "joining" | "waiting" | "ended" | "notfound" | "error"
  >("loading");
  const [joined, setJoined] = useState<JoinSession | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Auth gate — send the visitor to login and bring them back here.
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=/calls/join/${params.id}`);
    }
  }, [authLoading, user, router, params.id]);

  // The link token may be a sessionId (shared during an ACTIVE call) OR a
  // scheduleId (shared BEFORE the call started). For schedule links we show
  // a waiting card and poll every 5s until the call turns ACTIVE — joining
  // is only possible then.
  useEffect(() => {
    if (!user || !params.id) return;
    let cancelled = false;
    let poller: ReturnType<typeof setInterval> | null = null;

    const applySession = (s: JoinSession | null) => {
      if (cancelled) return;
      if (!s) {
        setState("waiting");
        return;
      }
      if (s.status !== "ACTIVE") {
        setState(s.status === "ENDED" || s.status === "DECLINED" ? "ended" : "waiting");
        return;
      }
      setSession(s);
      setState("ready");
      if (poller) clearInterval(poller);
    };

    (async () => {
      try {
        const res = await fetch(`/api/calls/sessions/${params.id}`);
        if (res.status === 404) {
          // Not a session — treat the token as a scheduleId.
          const r2 = await fetch(`/api/calls/sessions/by-schedule/${params.id}`);
          const d2 = await r2.json();
          if (!d2.success) {
            setState("notfound");
            return;
          }
          applySession(d2.session);
          poller = setInterval(async () => {
            try {
              const p = await fetch(`/api/calls/sessions/by-schedule/${params.id}`);
              const pd = await p.json();
              if (pd.success) applySession(pd.session);
            } catch { /* keep polling */ }
          }, 5000);
          return;
        }
        const data = await res.json();
        if (!data.success) {
          setState("error");
          return;
        }
        applySession(data.session);
      } catch {
        if (!cancelled) setState("error");
      }
    })();

    return () => {
      cancelled = true;
      if (poller) clearInterval(poller);
    };
  }, [user, params.id]);

  const handleJoin = async () => {
    if (!session) return;
    setState("joining");
    try {
      const res = await fetch(`/api/calls/sessions/${session.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "join" }),
      });
      const data = await res.json();
      if (!data.success) {
        toastlessError(data.error || "Could not join this call.");
        setState(data?.status && data.status !== "ACTIVE" ? "ended" : "ready");
        return;
      }
      setJoined(data.session);
    } catch {
      toastlessError("Could not join this call. Please try again.");
      setState("ready");
    }
  };

  function toastlessError(msg: string) {
    console.error("[join-call]", msg);
    setErr(msg);
  }

  const peerName = session
    ? session.schedule.caller.id === user?.id
      ? `${session.schedule.callee.firstName} ${session.schedule.callee.lastName}`.trim()
      : `${session.schedule.caller.firstName} ${session.schedule.caller.lastName}`.trim()
    : "";

  // ── Joined: full-screen call as a guest ─────────────────────────────
  if (joined && user) {
    return (
      <CallView
        session={joined}
        myId={user.id}
        myRole="guest"
        onClose={() => router.push("/messages")}
      />
    );
  }

  // ── Landing card ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b141a] p-4">
      <div className="w-full max-w-md bg-[#202c33] rounded-3xl p-8 text-center text-[#e9edef] shadow-2xl">
        {state === "loading" || authLoading ? (
          <>
            <Loader2 size={36} className="animate-spin mx-auto text-[#8696a0]" />
            <p className="mt-4 text-[#8696a0]">Loading call…</p>
          </>
        ) : state === "notfound" ? (
          <>
            <PhoneOff size={36} className="mx-auto text-[#f15c6d]" />
            <h1 className="mt-4 text-xl font-semibold">Call not found</h1>
            <p className="mt-2 text-sm text-[#8696a0]">
              This join link is invalid or the call was removed.
            </p>
          </>
        ) : state === "waiting" ? (
          <>
            <Loader2 size={36} className="animate-spin mx-auto text-[#00a884]" />
            <h1 className="mt-4 text-xl font-semibold">Waiting for the call to start</h1>
            <p className="mt-2 text-sm text-[#8696a0]">
              This link was shared before the call began. Keep this page open —
              it will let you in automatically once the call is active.
            </p>
          </>
        ) : state === "ended" ? (
          <>
            <PhoneOff size={36} className="mx-auto text-[#f15c6d]" />
            <h1 className="mt-4 text-xl font-semibold">This call has ended</h1>
            <p className="mt-2 text-sm text-[#8696a0]">
              Join links only work while the call is active.
            </p>
          </>
        ) : state === "error" ? (
          <>
            <PhoneOff size={36} className="mx-auto text-[#f15c6d]" />
            <h1 className="mt-4 text-xl font-semibold">Something went wrong</h1>
            <p className="mt-2 text-sm text-[#8696a0]">
              {err || "Could not load this call. Please try again."}
            </p>
          </>
        ) : (
          session && (
            <>
              <div className="w-16 h-16 rounded-full bg-[#00a884] flex items-center justify-center mx-auto">
                {session.schedule.callType === "VIDEO" ? (
                  <VideoIcon size={28} className="text-white" />
                ) : (
                  <Phone size={28} className="text-white" />
                )}
              </div>
              <h1 className="mt-5 text-xl font-semibold">
                {session.schedule.callType === "VIDEO" ? "Video" : "Voice"} call
                in progress
              </h1>
              <p className="mt-2 text-sm text-[#8696a0]">
                {peerName
                  ? `${peerName} is in this call`
                  : "People are in this call"}
                . You&apos;ll join as an extra participant — perfect for
                translating or observing.
              </p>
              {err && (
                <p className="mt-3 text-sm text-[#f15c6d]">{err}</p>
              )}
              <button
                onClick={handleJoin}
                disabled={state === "joining"}
                className="mt-6 w-full py-3.5 rounded-full bg-[#00a884] hover:bg-[#017561] disabled:opacity-60 text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {state === "joining" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Joining…
                  </>
                ) : (
                  <>
                    <Phone size={18} /> Join call
                  </>
                )}
              </button>
              <button
                onClick={() => router.push("/")}
                className="mt-3 w-full py-3 rounded-full text-sm text-[#8696a0] hover:text-[#e9edef] transition-colors"
              >
                Not now
              </button>
            </>
          )
        )}
      </div>
    </div>
  );
}
