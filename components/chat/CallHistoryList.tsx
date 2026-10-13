"use client";

import { PhoneMissed, PhoneIncoming, PhoneOutgoing, Search, Grid, Plus, Phone, User, MoreVertical } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";

interface Props {
  viewerId: string;
}

interface CallSessionLite {
  id: string;
  status: string;
  startedAt: string;
  answeredAt?: string | null;
  durationSec?: number | null;
  endReason?: string | null;
  schedule: {
    id: string;
    callType: "AUDIO" | "VIDEO";
    callerId: string;
    calleeId: string;
    caller: { id: string; firstName: string; lastName: string; avatar?: string | null };
    callee: { id: string; firstName: string; lastName: string; avatar?: string | null };
  };
}

/** Group helper: "Today" / "Yesterday" / date for the section headers. */
function dayLabel(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
  if (sameDay(d, now)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatDuration(sec?: number | null): string {
  if (!sec || sec < 1) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * CallHistoryList — the WhatsApp-Web-style "Calls" tab for the middle panel
 * of /messages. Lists past call sessions with direction (outgoing/incoming)
 * and missed styling, grouped by day.
 */
export function CallHistoryList({ viewerId }: Props) {
  const [sessions, setSessions] = useState<CallSessionLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/calls/sessions");
        const data = await res.json();
        if (!cancelled && data.success) setSessions(data.sessions ?? []);
      } catch {
        /* swallow */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Group sessions by calendar day (API returns newest first).
  const groups = useMemo(() => {
    const map = new Map<string, CallSessionLite[]>();
    for (const s of sessions) {
      const label = dayLabel(s.startedAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label)!.push(s);
    }
    return Array.from(map.entries());
  }, [sessions]);

  // Filter sessions by query
  const filteredSessions = useMemo(() => {
    if (!query.trim()) return sessions;
    const q = query.toLowerCase();
    return sessions.filter((s) => {
      const other = s.schedule.callerId === viewerId ? s.schedule.callee : s.schedule.caller;
      const name = `${other.firstName} ${other.lastName}`.toLowerCase();
      return name.includes(q);
    });
  }, [sessions, query, viewerId]);

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Header — WhatsApp calls panel */}
      <div className="px-5 py-3 shrink-0 bg-white">
        <div className="flex items-center justify-between mb-4 mt-2">
          <h2 className="text-[22px] font-bold text-[#111b21]">Calls</h2>
          <div className="flex items-center gap-4 text-[#54656f]">
            {/* <button className="hover:bg-[#f0f2f5] p-2 rounded-full transition-colors"><Plus size={20} /></button>
            <button className="hover:bg-[#f0f2f5] p-2 rounded-full transition-colors"><MoreVertical size={20} /></button> */}
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8696a0]"
            size={16}
          />
          <input
            type="text"
            placeholder="Search name, number or @username"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#f0f2f5] text-sm rounded-full pl-9 pr-4 py-1.5 focus:outline-none text-[#111b21] placeholder:text-[#8696a0]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!loading && query === "" && (
          <div className="px-6 py-4 text-[#111b21] font-medium text-[15px]">
            Recent
          </div>
        )}
        
        {loading ? (
          <div className="p-8 text-center text-[#54656f] text-sm">
            Loading call history...
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-8 text-center text-[#54656f] text-sm">
            No calls found.
          </div>
        ) : (
          filteredSessions.map((s) => {
            const isOutgoing = s.schedule.callerId === viewerId;
            const other =
              s.schedule.callerId === viewerId
                ? s.schedule.callee
                : s.schedule.caller;
            // Missed: never answered (declined / failed / rang out).
            const missed =
              !s.answeredAt &&
              ["DECLINED", "FAILED", "ENDED", "NO_ANSWER"].includes(s.status);
            
            const timeLabel = dayLabel(s.startedAt) === "Today" 
              ? new Date(s.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
              : dayLabel(s.startedAt);
            const duration = formatDuration(s.durationSec);

            return (
              <div
                key={s.id}
                className="group w-full px-3 py-3 flex items-center gap-3 hover:bg-[#f5f6f6] transition-colors cursor-pointer text-left"
              >
                <div className="relative shrink-0">
                  {other.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={proxiedImageUrl(other.avatar)}
                      alt=""
                      className="w-[46px] h-[46px] rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-[46px] h-[46px] rounded-full bg-[#dfe5e7] text-[#54656f] flex items-center justify-center shrink-0">
                      <User size={22} />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 border-b border-[#f0f2f5] pb-3 group-last:border-none">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className={`text-[16px] truncate ${missed ? "text-[#ea0038]" : "text-[#111b21]"}`}>
                      {`${other.firstName} ${other.lastName}`.trim() || "Unknown"}
                    </h3>
                    <span className="text-[12px] text-[#54656f] whitespace-nowrap ml-2">
                      {timeLabel}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    {missed ? (
                      <PhoneMissed size={14} className="text-[#ea0038]" />
                    ) : isOutgoing ? (
                      <PhoneOutgoing size={14} className="text-[#54656f]" />
                    ) : (
                      <PhoneIncoming size={14} className="text-[#54656f]" />
                    )}
                    <span className={`text-[13.5px] truncate ${missed ? "text-[#ea0038]" : "text-[#54656f]"}`}>
                      {missed ? "Missed" : isOutgoing ? "Outgoing" : "Incoming"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
