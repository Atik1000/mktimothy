"use client";

import { X, Phone, Video, Calendar, Clock, AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { ChatRoom } from "./hooks/useChat";

interface Props {
  open: boolean;
  onClose: () => void;
  room: ChatRoom | null;
  viewerId: string;
  /** Notifies the parent that a schedule was created so it can navigate/close. */
  onRequested?: (scheduleId: string) => void;
}

/**
 * Modal to request a call (audio or video) with the other participant of a
 * DIRECT room. The user picks a proposed time window — any day/time is
 * allowed; the admin's approval is the only gate.
 * admin's call policy. The request enters PENDING state until an admin
 * approves it.
 */
export function CallRequestModal({
  open,
  onClose,
  room,
  viewerId,
  onRequested,
}: Props) {
  const [callType, setCallType] = useState<"AUDIO" | "VIDEO">("AUDIO");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMin, setDurationMin] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  // Default proposed time = next hour, rounded up.
  useEffect(() => {
    if (!open) return;
    const now = new Date();
    now.setMinutes(60 - now.getMinutes(), 0, 0); // next top-of-hour
    setDate(now.toISOString().slice(0, 10));
    setStartTime(now.toTimeString().slice(0, 5));
  }, [open]);

  const other = room?.participants.find((p) => p.id !== viewerId);

  // Minimal validation: a date+time must be chosen and in the future.
  // Users can book at ANY time — the admin's approval/rejection is the gate.
  // (Declared before any early return so hook order stays stable.)
  const validation = useMemo(() => {
    if (!date || !startTime) return { ready: false, reason: "Pick a date and time." };
    const start = new Date(`${date}T${startTime}`);
    if (isNaN(start.getTime())) return { ready: false, reason: "Invalid date/time." };
    if (start.getTime() < Date.now()) {
      return { ready: false, reason: "Please pick a time in the future." };
    }
    return { ready: true, reason: "" };
  }, [date, startTime]);

  if (!open || !room) return null;

  const submit = async () => {
    if (!validation.ready) {
      toast.error(validation.reason || "Please fix the time.");
      return;
    }
    if (!date || !startTime) {
      toast.error("Please pick a date and time");
      return;
    }
    // Combine local date+time into a Date, then to ISO.
    const start = new Date(`${date}T${startTime}`);
    if (isNaN(start.getTime())) {
      toast.error("Invalid date/time");
      return;
    }
    const end = new Date(start.getTime() + durationMin * 60_000);

    setSubmitting(true);
    try {
      const res = await fetch("/api/calls/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calleeId: other?.id,
          callType,
          startDateTime: start.toISOString(),
          endDateTime: end.toISOString(),
          roomId: room.id,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success("Call requested — waiting for admin approval.");
      onRequested?.(data.schedule.id);
      onClose();
    } catch (e: any) {
      toast.error(e.message || "Failed to request call");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
          <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            <Calendar size={18} className="text-emerald-500" />
            Request a call
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
              Call with
            </p>
            <p className="text-sm font-medium text-zinc-900">{other?.name}</p>
          </div>

          {/* Call type */}
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">
              Call type
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCallType("AUDIO")}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                  callType === "AUDIO"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                }`}
              >
                <Phone size={22} />
                <span className="text-sm font-medium">Audio</span>
              </button>
              <button
                onClick={() => setCallType("VIDEO")}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all ${
                  callType === "VIDEO"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                    : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                }`}
              >
                <Video size={22} />
                <span className="text-sm font-medium">Video</span>
              </button>
            </div>
          </div>

          {/* Info notice: any time is allowed, admin approval is the gate */}
          <div className="flex items-start gap-2 text-xs text-sky-700 bg-sky-50 border border-sky-200 rounded-lg p-3">
            <Calendar size={14} className="mt-0.5 shrink-0" />
            <span>
              You can request a call at any day and time. An admin will review
              and approve or reject your request before it can start.
            </span>
          </div>

          {/* Live validation feedback */}
          {date && startTime && !validation.ready && (
            <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
              <AlertCircle size={14} className="mt-0.5 shrink-0" />
              <span>{validation.reason}</span>
            </div>
          )}

          {/* Date / time / duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-500 mb-1.5 block">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-zinc-500 mb-1.5 block">
                Start time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-zinc-500 mb-1.5 flex items-center gap-1.5">
              <Clock size={12} /> Duration
            </label>
            <div className="flex gap-2">
              {[15, 30, 45, 60].map((m) => (
                <button
                  key={m}
                  onClick={() => setDurationMin(m)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all border ${
                    durationMin === m
                      ? "bg-emerald-500 text-white border-emerald-500"
                      : "bg-white text-zinc-600 hover:text-zinc-900 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting || !validation.ready}
            className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Requesting..."
              : !validation.ready
              ? "Pick a valid time"
              : "Request call"}
          </button>
        </div>
      </div>
    </div>
  );
}
