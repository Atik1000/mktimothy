"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Bot, ArrowLeft, Paperclip, Send, Search, Lock, FileText } from "lucide-react";
import { Spinner } from "@/components/ui/Loader";

interface Contact {
  id: number;
  wp_name: string;
  wp_number: string;
  auto_bot_reply: boolean;
  unread_message_count?: number;
  last_user_message_datetime: string | null;
}

interface Template {
  id: number;
  template_name: string;
  template_language: string;
  template_parameters: { position: number; value: string }[];
}

interface HistoryMessage {
  text: string;
  fromContact: boolean;
  time: string | null;
  mediaUrl?: string;
}

async function chatbot<T = any>(action: string, payload: Record<string, any> = {}): Promise<T> {
  const res = await fetch("/api/admin/whatsapp-chatbot", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || `Request failed (${res.status})`);
  return data as T;
}

// get_message_history returns { message_history: [{ role, content, created_at }] }.
function normalizeHistory(data: any): HistoryMessage[] {
  const list: any[] = Array.isArray(data)
    ? data
    : data?.message_history || data?.messages || data?.history || data?.data || [];
  return list.map((m) => {
    const sender = String(m.role ?? m.sender ?? m.direction ?? m.from ?? "").toLowerCase();
    const fromContact =
      m.is_from_user ?? m.from_user ??
      (["user", "contact", "customer", "incoming", "inbound"].includes(sender));
    return {
      text: String(m.content ?? m.message ?? m.text ?? m.body ?? ""),
      fromContact: !!fromContact,
      time: m.created_at ?? m.timestamp ?? m.datetime ?? m.message_datetime ?? null,
      mediaUrl: m.media_url ?? m.url ?? undefined,
    };
  });
}

const formatTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "";

const AVATAR_COLORS = ["bg-indigo-500/70", "bg-amber-700/70", "bg-violet-500/70", "bg-teal-600/70", "bg-pink-500/70"];
const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("") || "?";

function Avatar({ contact, size = "w-12 h-12" }: { contact: Contact; size?: string }) {
  return (
    <div className={`${size} rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white ${AVATAR_COLORS[contact.id % AVATAR_COLORS.length]}`}>
      {initials(contact.wp_name)}
    </div>
  );
}

export default function WhatsAppChatbotPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "bot">("all");
  const [templateOpen, setTemplateOpen] = useState(false);
  const [active, setActive] = useState<Contact | null>(null);

  const [messages, setMessages] = useState<HistoryMessage[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [withinWindow, setWithinWindow] = useState(false);
  const [autoBot, setAutoBot] = useState(false);
  const [togglingBot, setTogglingBot] = useState(false);

  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [templateId, setTemplateId] = useState("");
  const [templateParams, setTemplateParams] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadContacts = useCallback(async () => {
    try {
      setContacts(await chatbot<Contact[]>("contacts"));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingContacts(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
    chatbot<Template[]>("templates").then(setTemplates).catch((e) => toast.error(e.message));
  }, [loadContacts]);

  const loadChat = useCallback(async (c: Contact) => {
    setLoadingChat(true);
    try {
      const [history, status, latest] = await Promise.all([
        chatbot("history", { wp_number: c.wp_number }),
        chatbot("autoBotStatus", { wp_number: c.wp_number }),
        chatbot<Contact[]>("contacts"),
      ]);
      setMessages(normalizeHistory(history));
      setAutoBot(!!status?.auto_bot_reply_status);
      setContacts(latest);
      // The backend's check_last_message_timeframe is unreliable, so the 24h
      // window is derived from the contact's last user message (UTC, no suffix).
      const last = latest.find((x) => x.wp_number === c.wp_number)?.last_user_message_datetime;
      setWithinWindow(!!last && Date.now() - new Date(last + "Z").getTime() < 24 * 60 * 60 * 1000);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoadingChat(false);
    }
  }, []);

  // The backend has no push channel, so poll quietly for new messages.
  useEffect(() => {
    const timer = setInterval(async () => {
      if (document.hidden) return;
      try {
        const [latest, history] = await Promise.all([
          chatbot<Contact[]>("contacts"),
          active ? chatbot("history", { wp_number: active.wp_number }) : null,
        ]);
        setContacts(latest);
        if (active && history) {
          const next = normalizeHistory(history);
          setMessages((prev) => (next.length === prev.length ? prev : next));
          const last = latest.find((x) => x.wp_number === active.wp_number)?.last_user_message_datetime;
          setWithinWindow(!!last && Date.now() - new Date(last + "Z").getTime() < 24 * 60 * 60 * 1000);
        }
      } catch {}
    }, 5000);
    return () => clearInterval(timer);
  }, [active]);

  useEffect(() => {
    setText("");
    setFile(null);
    setTemplateId("");
    setTemplateParams([]);
    if (active) loadChat(active);
  }, [active, loadChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleBot = async () => {
    if (!active) return;
    const next = !autoBot;
    setTogglingBot(true);
    try {
      await chatbot("toggleAutoBot", { wp_number: active.wp_number, bot_action: next ? "on" : "off" });
      setAutoBot(next);
      setContacts((cs) => cs.map((c) => (c.id === active.id ? { ...c, auto_bot_reply: next } : c)));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setTogglingBot(false);
    }
  };

  const sendAdminMessage = async () => {
    if (!active || (!text.trim() && !file)) return;
    setSending(true);
    try {
      const form = new FormData();
      form.append("wp_number", active.wp_number);
      form.append("message", text.trim());
      if (file) {
        form.append("message_type", "media");
        form.append("media_type", file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "document");
        form.append("media", file);
      } else {
        form.append("message_type", "text");
      }
      const res = await fetch("/api/admin/whatsapp-chatbot", { method: "POST", credentials: "include", body: form });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || data?.message || "Failed to send message");
      setText("");
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      await loadChat(active);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const selectedTemplate = templates.find((t) => String(t.id) === templateId);

  const sendTemplate = async () => {
    if (!active || !selectedTemplate) return;
    setSending(true);
    try {
      await chatbot("sendTemplate", {
        wp_number: active.wp_number,
        template_name: selectedTemplate.template_name,
        template_language: selectedTemplate.template_language,
        template_parameters: templateParams,
      });
      toast.success("Template sent");
      setTemplateId("");
      setTemplateParams([]);
      await loadChat(active);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSending(false);
    }
  };

  const filtered = contacts.filter(
    (c) =>
      (filter === "all" ||
        (filter === "bot" && c.auto_bot_reply) ||
        (filter === "unread" && (c.unread_message_count ?? 0) > 0)) &&
      `${c.wp_name} ${c.wp_number}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 min-h-0 flex overflow-hidden bg-[#09090b] text-zinc-100 font-sans">
      {/* Contacts */}
      <div className={`w-full md:w-[380px] flex-shrink-0 flex-col border-r border-white/5 ${active ? "hidden md:flex" : "flex"}`}>
        <div className="h-16 px-5 flex items-center border-b border-white/5 shrink-0">
          <h2 className="text-2xl font-bold text-white tracking-tight">Messaging</h2>
        </div>
        <div className="p-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
            <Search size={16} className="text-zinc-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts or numbers"
              className="bg-transparent outline-none text-sm w-full placeholder:text-zinc-500"
            />
          </div>
          <div className="flex gap-2 mt-2">
            {([["all", "All"], ["unread", "Unread"], ["bot", "Bot active"]] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  filter === key ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "border-white/10 text-zinc-300 hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loadingContacts ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-zinc-500 py-10">No contacts found</p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c)}
                className={`w-full text-left px-4 py-3.5 border-b border-white/5 hover:bg-white/5 transition-colors flex items-center gap-3 ${active?.id === c.id ? "bg-white/5" : ""}`}
              >
                <Avatar contact={c} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-base font-semibold text-white truncate">{c.wp_name}</p>
                    {c.last_user_message_datetime && (
                      <span className="text-xs text-zinc-500 shrink-0">
                        {new Date(c.last_user_message_datetime).toLocaleDateString([], { weekday: "long" })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm text-zinc-500 truncate">+{c.wp_number}</p>
                    {c.auto_bot_reply && <Bot size={13} className="text-emerald-400 shrink-0" />}
                    {!!c.unread_message_count && c.unread_message_count > 0 && (
                      <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-500 text-[11px] font-bold text-black flex items-center justify-center shrink-0">
                        {c.unread_message_count > 99 ? "99+" : c.unread_message_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
        <div className="px-5 py-3 border-t border-white/5 text-xs text-zinc-500 shrink-0">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2" />WhatsApp Cloud API
        </div>
      </div>

      {/* Conversation */}
      <div className={`flex-1 min-w-0 flex-col ${active ? "flex" : "hidden md:flex"}`}>
        {!active ? (
          <div className="flex-1 flex items-center justify-center text-zinc-500 text-sm">Select a contact to view the conversation</div>
        ) : (
          <>
            <div className="h-16 px-4 flex items-center justify-between gap-3 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setActive(null)} className="md:hidden p-2 text-zinc-400 hover:text-white">
                  <ArrowLeft size={18} />
                </button>
                <Avatar contact={active} />
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-white truncate">{active.wp_name}</p>
                  <p className="text-sm text-zinc-500">+{active.wp_number} · WhatsApp</p>
                </div>
              </div>
              <button
                onClick={toggleBot}
                disabled={togglingBot}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-colors disabled:opacity-50 ${
                  autoBot
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-white/5 text-zinc-400 border-white/10"
                }`}
              >
                <Bot size={14} /> {autoBot ? "Bot active" : "Bot off"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
              {loadingChat && messages.length === 0 ? (
                <div className="flex justify-center py-10"><Spinner /></div>
              ) : messages.length === 0 ? (
                <p className="text-center text-sm text-zinc-500 py-10">No messages yet</p>
              ) : (
                <>
                <div className="flex justify-center">
                  <span className="px-4 py-1.5 rounded-full border border-white/10 text-sm text-zinc-300">Conversation history</span>
                </div>
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.fromContact ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-base ${m.fromContact ? "bg-white/10 text-zinc-100 border border-white/10" : "bg-emerald-900/60 text-emerald-50"}`}>
                      {m.mediaUrl && (
                        <a href={m.mediaUrl} target="_blank" rel="noreferrer" className="underline block mb-1">Media</a>
                      )}
                      <p className="whitespace-pre-wrap break-words">{m.text}</p>
                      {m.time && <p className="text-[10px] opacity-60 mt-1 text-right">{formatTime(m.time)}</p>}
                    </div>
                  </div>
                ))}
                </>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-white/5 p-3 shrink-0">
              {withinWindow ? (
                <div className="space-y-2">
                  {file && (
                    <p className="text-xs text-zinc-400 px-1">
                      Attached: {file.name}{" "}
                      <button className="text-rose-400 ml-1" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}>remove</button>
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <input ref={fileRef} type="file" accept="image/*,video/*,application/pdf" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                    <button onClick={() => fileRef.current?.click()} className="p-3 text-zinc-400 hover:text-white hover:bg-white/5 border border-white/10 rounded-xl" title="Attach media">
                      <Paperclip size={18} />
                    </button>
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendAdminMessage())}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-base outline-none placeholder:text-zinc-500"
                    />
                    <button
                      onClick={sendAdminMessage}
                      disabled={sending || (!text.trim() && !file)}
                      className="flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 rounded-xl text-sm font-semibold text-white"
                    >
                      {sending ? <Spinner size="w-4 h-4" /> : <><Send size={16} /> Send</>}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-not-allowed select-none">
                    <Lock size={18} className="text-zinc-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-white">24-hour conversation session has ended.</p>
                      <p className="text-sm text-zinc-400">
                        Please send a template message instead, and wait for the user&apos;s reply to start chatting again.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <button
                      onClick={() => setTemplateOpen(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-sm font-semibold text-white"
                    >
                      <FileText size={16} /> Select WhatsApp Template
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {templateOpen && active && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setTemplateOpen(false)}>
          <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white">Send template to {active.wp_name}</h3>
            <select
              value={templateId}
              onChange={(e) => {
                setTemplateId(e.target.value);
                const t = templates.find((x) => String(x.id) === e.target.value);
                setTemplateParams(t ? t.template_parameters.map(() => "") : []);
              }}
              className="w-full bg-white/5 rounded-xl px-3 py-2.5 text-sm outline-none"
            >
              <option value="" className="bg-[#18181b]">Select template</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#18181b]">{t.template_name} ({t.template_language})</option>
              ))}
            </select>
            {selectedTemplate?.template_parameters.map((p, i) => (
              <input
                key={p.position}
                value={templateParams[i] ?? ""}
                onChange={(e) => setTemplateParams((ps) => ps.map((v, j) => (j === i ? e.target.value : v)))}
                placeholder={`{{${p.position}}} ${p.value}`}
                className="w-full bg-white/5 rounded-xl px-3 py-2.5 text-sm outline-none placeholder:text-zinc-500"
              />
            ))}
            <div className="flex justify-end gap-2">
              <button onClick={() => setTemplateOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white">Cancel</button>
              <button
                onClick={async () => { await sendTemplate(); setTemplateOpen(false); }}
                disabled={sending || !selectedTemplate || templateParams.some((v) => !v.trim())}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 rounded-xl text-sm font-semibold text-white"
              >
                {sending ? <Spinner size="w-4 h-4" /> : "Send template"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
