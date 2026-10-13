"use client";

import {
  Phone,
  Video,
  Check,
  X,
  Clock,
  Calendar,
  ShieldCheck,
  Settings2,
  Loader2,
  Headphones,
  History,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";
import { describePolicy } from "@/lib/utils/calls";
import { CallView } from "@/components/chat/CallView";
import { useAuth } from "@/lib/providers/auth-provider";

interface UserLite {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  role: string;
  email?: string;
}

interface Schedule {
  id: string;
  callType: "AUDIO" | "VIDEO";
  title: string | null;
  notes: string | null;
  startDateTime: string;
  endDateTime: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  rejectionReason: string | null;
  caller: UserLite;
  callee: UserLite;
  approver?: { id: string; firstName: string; lastName: string } | null;
  sessions?: {
    id: string;
    status: string;
    startedAt: string;
    endedAt: string | null;
    durationSec: number | null;
    endReason: string | null;
  }[];
}

interface Policy {
  isEnabled: boolean;
  allowedDays: string[];
  allowedStartTime: string;
  allowedEndTime: string;
  timezone: string;
  maxDurationMin: number;
}

type Tab = "pending" | "upcoming" | "history" | "policy";

export default function CallsAdmin() {
  const [tab, setTab] = useState<Tab>("pending");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [monitorSession, setMonitorSession] = useState<any>(null);
  const { user } = useAuth();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/calls/schedules");
      const data = await res.json();
      if (data.success) setSchedules(data.schedules);
    } catch {
      /* swallow */
    } finally {
      setLoading(false);
    }
  }, []);

  const joinAsMonitor = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/calls/sessions/${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setMonitorSession(data.session);
      } else {
        toast.error(data.error || "Failed to join call");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to join call");
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15_000);
    return () => clearInterval(id);
  }, [load]);

  const act = async (id: string, action: string, extra?: any) => {
    setActing(id);
    try {
      const res = await fetch(`/api/calls/schedules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success(
        action === "approve"
          ? "Call approved"
          : action === "reject"
          ? "Call rejected"
          : "Call cancelled"
      );
      await load();
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    } finally {
      setActing(null);
    }
  };

  const pending = schedules.filter((s) => s.status === "PENDING");
  const upcoming = schedules.filter((s) =>
    ["APPROVED"].includes(s.status)
  );
  // History: everything that's resolved — completed, rejected, cancelled,
  // no-show. Kept as a permanent audit trail for the admin. Records are never
  // deleted; they only move here once their window has passed or they were
  // acted on.
  const history = schedules
    .filter((s) =>
      ["COMPLETED", "REJECTED", "CANCELLED", "NO_SHOW"].includes(s.status)
    )
    .sort(
      (a, b) =>
        new Date(b.endDateTime).getTime() - new Date(a.endDateTime).getTime()
    );

  return (
    <div className="width py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Phone size={24} className="text-emerald-500" />
            Calls
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Approve call requests, monitor active calls, and configure the
            allowed call window.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/5">
        {[
          { id: "pending", label: "Approvals", icon: Clock, badge: pending.length },
          { id: "upcoming", label: "Approved", icon: Calendar, badge: upcoming.length },
          { id: "history", label: "History", icon: History, badge: history.length },
          // { id: "policy", label: "Policy", icon: Settings2 },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <t.icon size={16} />
            {t.label}
            {"badge" in t && t.badge ? (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 rounded-full">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-500">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading...
        </div>
      ) : tab === "pending" ? (
        <PendingList
          items={pending}
          acting={acting}
          onApprove={(id) => act(id, "approve")}
          onReject={(id, reason) => act(id, "reject", { rejectionReason: reason })}
        />
      ) : tab === "upcoming" ? (
        <UpcomingList items={upcoming} onJoin={joinAsMonitor} />
      ) : tab === "history" ? (
        <HistoryList items={history} />
      ) : (
        <PolicyEditor />
      )}

      {/* Monitor view (full-screen call overlay) */}
      {monitorSession && user && (
        <CallView
          session={monitorSession}
          myId={user.id}
          myRole="monitor"
          onClose={() => {
            setMonitorSession(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function UserChip({ user, label }: { user: UserLite; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {user.avatar ? (
        <img
          src={proxiedImageUrl(user.avatar)}
          alt=""
          className="w-8 h-8 rounded-full object-cover border border-white/10"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
          {user.firstName?.[0]}
          {user.lastName?.[0]}
        </div>
      )}
      <div>
        <p className="text-xs text-zinc-500">{label}</p>
        <p className="text-sm font-medium text-zinc-200">
          {user.firstName} {user.lastName}
        </p>
      </div>
    </div>
  );
}

function PendingList({
  items,
  acting,
  onApprove,
  onReject,
}: {
  items: Schedule[];
  acting: string | null;
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <Clock size={32} className="mx-auto mb-3 opacity-40" />
        No call requests waiting for approval.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((s) => (
        <div
          key={s.id}
          className="bg-[#121214] border border-white/5 rounded-xl p-4 sm:p-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
              <div className="flex items-center gap-2">
                {s.callType === "VIDEO" ? (
                  <Video size={18} className="text-emerald-400" />
                ) : (
                  <Phone size={18} className="text-emerald-400" />
                )}
                <span className="text-sm font-medium text-zinc-200">
                  {s.callType === "VIDEO" ? "Video call" : "Audio call"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <UserChip user={s.caller} label="Caller" />
                <UserChip user={s.callee} label="Recipient" />
              </div>
            </div>
            <div className="text-left sm:text-right text-xs text-zinc-400">
              <p className="font-medium text-zinc-300">
                {new Date(s.startDateTime).toLocaleDateString([], {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
              <p>
                {new Date(s.startDateTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                –{" "}
                {new Date(s.endDateTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {s.notes && (
            <p className="text-sm text-zinc-400 mt-3 pl-0.5">{s.notes}</p>
          )}

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onApprove(s.id)}
              disabled={acting === s.id}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-[#09090b] rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {acting === s.id ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Check size={14} />
              )}
              Approve
            </button>
            <button
              onClick={() => {
                const reason = window.prompt("Reason for rejection (optional):");
                onReject(s.id, reason || undefined);
              }}
              disabled={acting === s.id}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              <X size={14} />
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function UpcomingList({
  items,
  onJoin,
}: {
  items: Schedule[];
  onJoin?: (sessionId: string) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <Calendar size={32} className="mx-auto mb-3 opacity-40" />
        No approved calls scheduled.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {items.map((s) => {
        const activeSession = s.sessions?.find((x) =>
          ["RINGING", "ACTIVE"].includes(x.status)
        );
        return (
          <div
            key={s.id}
            className="bg-[#121214] border border-white/5 rounded-xl p-4 sm:p-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <div className="flex items-center gap-2">
                  {s.callType === "VIDEO" ? (
                    <Video size={18} className="text-emerald-400" />
                  ) : (
                    <Phone size={18} className="text-emerald-400" />
                  )}
                  <span className="text-sm font-medium text-zinc-200">
                    {s.callType === "VIDEO" ? "Video" : "Audio"}
                  </span>
                  {activeSession && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase rounded-full">
                      <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
                <div className="flex gap-6">
                  <UserChip user={s.caller} label="Caller" />
                  <UserChip user={s.callee} label="Recipient" />
                </div>
              </div>
              <div className="text-left sm:text-right text-xs text-zinc-400">
                <p className="font-medium text-zinc-300">
                  {new Date(s.startDateTime).toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p>
                  {new Date(s.startDateTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  –{" "}
                  {new Date(s.endDateTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
            {activeSession && (
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 rounded-lg p-2.5">
                  <ShieldCheck size={14} />
                  Call is live — join to monitor &amp; record.
                </span>
                {onJoin && (
                  <button
                    onClick={() => onJoin(activeSession.id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors shrink-0"
                  >
                    <Headphones size={14} /> Join as Monitor
                  </button>
                )}
              </div>
            )}
            {s.status === "COMPLETED" && (
              <div className="mt-3 flex items-center justify-end border-t border-white/5 pt-3">
                <Link
                  href="/calls/recordings"
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-semibold transition-colors shrink-0"
                >
                  <Headphones size={14} /> View Recordings
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function HistoryList({ items }: { items: Schedule[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <History size={32} className="mx-auto mb-3 opacity-40" />
        No call history yet.
      </div>
    );
  }

  // Status badge color + label per resolved state.
  const badgeFor = (status: Schedule["status"]) => {
    switch (status) {
      case "COMPLETED":
        return "bg-emerald-500/15 text-emerald-400";
      case "REJECTED":
        return "bg-rose-500/15 text-rose-400";
      case "CANCELLED":
        return "bg-zinc-500/15 text-zinc-400";
      case "NO_SHOW":
        return "bg-amber-500/15 text-amber-400";
      default:
        return "bg-zinc-500/15 text-zinc-400";
    }
  };

  return (
    <div className="space-y-2">
      {items.map((s) => {
        const session = s.sessions?.[0];
        return (
          <div
            key={s.id}
            className="bg-[#121214] border border-white/5 rounded-xl p-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 sm:items-center">
                <div className="flex items-center gap-2">
                  {s.callType === "VIDEO" ? (
                    <Video size={16} className="text-zinc-400" />
                  ) : (
                    <Phone size={16} className="text-zinc-400" />
                  )}
                  <span className="text-xs uppercase tracking-wide font-semibold text-zinc-400">
                    {s.callType === "VIDEO" ? "Video" : "Audio"}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${badgeFor(
                      s.status
                    )}`}
                  >
                    {s.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-zinc-300">
                    {s.caller.firstName} {s.caller.lastName}
                  </span>
                  <span className="text-zinc-600">→</span>
                  <span className="text-zinc-300">
                    {s.callee.firstName} {s.callee.lastName}
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-right text-xs text-zinc-500">
                <p className="font-medium text-zinc-400">
                  {new Date(s.startDateTime).toLocaleDateString([], {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                {session?.durationSec ? (
                  <p>
                    {Math.floor(session.durationSec / 60)}m{" "}
                    {session.durationSec % 60}s
                  </p>
                ) : (
                  <p>
                    {new Date(s.startDateTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PolicyEditor() {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/calls/policy")
      .then((r) => r.json())
      .then((d) => d.success && setPolicy(d.policy))
      .catch(() => {});
  }, []);

  const toggleDay = (day: string) => {
    if (!policy) return;
    const has = policy.allowedDays.includes(day);
    setPolicy({
      ...policy,
      allowedDays: has
        ? policy.allowedDays.filter((d) => d !== day)
        : [...policy.allowedDays, day],
    });
  };

  const save = async () => {
    if (!policy) return;
    setSaving(true);
    try {
      const res = await fetch("/api/calls/policy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Policy updated");
      setPolicy(data.policy);
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (!policy)
    return (
      <div className="flex items-center justify-center py-16 text-zinc-500">
        <Loader2 className="animate-spin mr-2" size={18} /> Loading policy...
      </div>
    );

  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-[#121214] border border-white/5 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">
              Call window status
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {describePolicy(policy)}
            </p>
          </div>
          <button
            onClick={() => setPolicy({ ...policy, isEnabled: !policy.isEnabled })}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              policy.isEnabled ? "bg-emerald-500" : "bg-zinc-700"
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                policy.isEnabled ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
            Allowed days
          </p>
          <div className="flex flex-wrap gap-2">
            {days.map((d) => (
              <button
                key={d}
                onClick={() => toggleDay(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  policy.allowedDays.includes(d)
                    ? "bg-emerald-500 text-[#09090b]"
                    : "bg-[#18181b] text-zinc-400 border border-white/10"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-5">
          <div>
            <label className="text-xs uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Start time
            </label>
            <input
              type="time"
              value={policy.allowedStartTime}
              onChange={(e) =>
                setPolicy({ ...policy, allowedStartTime: e.target.value })
              }
              className="w-full bg-[#18181b] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-zinc-500 mb-1.5 block">
              End time
            </label>
            <input
              type="time"
              value={policy.allowedEndTime}
              onChange={(e) =>
                setPolicy({ ...policy, allowedEndTime: e.target.value })
              }
              className="w-full bg-[#18181b] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Timezone
            </label>
            <input
              type="text"
              value={policy.timezone}
              onChange={(e) =>
                setPolicy({ ...policy, timezone: e.target.value })
              }
              className="w-full bg-[#18181b] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Max duration (min)
            </label>
            <input
              type="number"
              min={0}
              value={policy.maxDurationMin}
              onChange={(e) =>
                setPolicy({
                  ...policy,
                  maxDurationMin: parseInt(e.target.value, 10) || 0,
                })
              }
              className="w-full bg-[#18181b] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="w-full py-3 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-[#09090b] transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save policy"}
      </button>
    </div>
  );
}
