"use client";

import { ArrowLeft, Headphones, Download, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { proxiedImageUrl } from "@/lib/utils/proxied-image";

interface Recording {
  id: string;
  mimeType: string;
  callType: "AUDIO" | "VIDEO";
  durationSec: number | null;
  fileSize: number | null;
  storageUrl: string | null;
  storageKey: string | null;
  localFilename: string | null;
  createdAt: string;
  recordedBy: { id: string; firstName: string; lastName: string };
  session: {
    id: string;
    schedule: {
      caller: { id: string; firstName: string; lastName: string; avatar?: string | null };
      callee: { id: string; firstName: string; lastName: string; avatar?: string | null };
    };
  };
}

/** Fetch a short-lived presigned MinIO URL for this recording. */
const getRecordingUrl = async (id: string, download = false) => {
  const res = await fetch(`/api/calls/recordings/${id}/url${download ? "?download=1" : ""}`);
  const data = await res.json();
  return data?.url as string | undefined;
};

const fmtDuration = (s: number | null) => {
  if (!s) return "—";
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;
};
const fmtSize = (b: number | null) => {
  if (!b) return "—";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};

export default function RecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calls/recordings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setRecordings(d.recordings);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-8 width"> 
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/calls"
          className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Headphones size={22} className="text-emerald-500" />
            Call Recordings
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Recordings of monitored calls.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-zinc-500">
          <Loader2 className="animate-spin mr-2" size={18} /> Loading...
        </div>
      ) : recordings.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <Headphones size={32} className="mx-auto mb-3 opacity-40" />
          No recordings yet. Recordings appear here after you monitor a call and
          save them.
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((r) => (
            <div
              key={r.id}
              className="bg-[#121214] border border-white/5 rounded-xl p-4"
            >
              <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[r.session.schedule.caller, r.session.schedule.callee].map(
                      (p, i) =>
                        p.avatar ? (
                          <img
                            key={i}
                            src={proxiedImageUrl(p.avatar)}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border-2 border-[#121214]"
                          />
                        ) : (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-zinc-700 border-2 border-[#121214] flex items-center justify-center text-[10px] text-zinc-300 font-bold"
                          >
                            {p.firstName[0]}
                          </div>
                        )
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-200">
                      {r.session.schedule.caller.firstName}{" "}
                      {r.session.schedule.caller.lastName}
                      <span className="text-zinc-500 mx-1.5">↔</span>
                      {r.session.schedule.callee.firstName}{" "}
                      {r.session.schedule.callee.lastName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {new Date(r.createdAt).toLocaleString()} · Recorded by{" "}
                      {r.recordedBy.firstName} {r.recordedBy.lastName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {fmtDuration(r.durationSec)}
                  </span>
                  <span>{fmtSize(r.fileSize)}</span>
                </div>
              </div>

              {r.storageKey ? (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={async (e) => {
                      const btn = e.currentTarget;
                      const url = await getRecordingUrl(r.id);
                      if (!url) return;
                      // Replace the buttons with an inline player.
                      const wrap = btn.parentElement!;
                      wrap.innerHTML = "";
                      if (r.callType === "VIDEO") {
                        const v = document.createElement("video");
                        v.src = url;
                        v.controls = true;
                        v.className = "w-full max-h-72 rounded-lg bg-black";
                        wrap.appendChild(v);
                      } else {
                        const a = document.createElement("audio");
                        a.src = url;
                        a.controls = true;
                        a.className = "w-full h-10";
                        wrap.appendChild(a);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    {r.callType === "VIDEO" ? (
                      <Headphones size={13} className="rotate-180" />
                    ) : (
                      <Headphones size={13} />
                    )}
                    View {r.callType === "VIDEO" ? "Recording" : "Audio"}
                  </button>
                  <button
                    onClick={async () => {
                      const url = await getRecordingUrl(r.id, true);
                      if (url) window.location.href = url;
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Download size={13} /> Download
                  </button>
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wide">
                    {r.callType === "VIDEO" ? "Video" : "Audio"} · auto-saved
                  </span>
                </div>
              ) : r.storageUrl ? (
                <audio
                  controls
                  src={r.storageUrl}
                  className="w-full h-10"
                  preload="metadata"
                />
              ) : (
                <div className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                  <span className="text-xs text-zinc-500">
                    Stored locally as{" "}
                    <code className="text-zinc-400">
                      {r.localFilename || "recording.webm"}
                    </code>{" "}
                    (not uploaded to server)
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
