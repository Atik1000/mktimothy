"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaUser,
  FaSearch,
} from "react-icons/fa";
import {
  MdAssignment,
  MdBarChart,
  MdCategory,
  MdChat,
  MdHistory,
  MdListAlt,
  MdSave,
} from "react-icons/md";
import { RiDashboardFill } from "react-icons/ri";
import { SiBlogger } from "react-icons/si";
import { IconType } from "react-icons";

interface NavItem {
  label: string;
  path: string;
  icon: IconType;
  hint: string;
}

const NAV: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: RiDashboardFill, hint: "Overview" },
  { label: "Users", path: "/users", icon: FaUser, hint: "Manage users" },
  { label: "Assignments", path: "/moderator-assignments", icon: MdAssignment, hint: "Moderator assignments" },
  { label: "Chat", path: "/chats", icon: MdChat, hint: "Conversations" },
  { label: "Blogs", path: "/blog", icon: SiBlogger, hint: "Manage blogs" },
  { label: "Listings", path: "/listings", icon: MdListAlt, hint: "Manage listings" },
  { label: "Analytics", path: "/analytics", icon: MdBarChart, hint: "Insights" },
  { label: "Categories", path: "/categories", icon: MdCategory, hint: "Manage categories" },
  { label: "Saved", path: "/saved", icon: MdSave, hint: "Saved items" },
  { label: "History", path: "/history", icon: MdHistory, hint: "Activity history" },
];

interface SearchResult {
  type: "user" | "listing";
  id: string;
  label: string;
  sub: string;
  path: string;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Keyboard shortcut: ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  // Debounced search against users + listings endpoints.
  useEffect(() => {
    if (!search.trim() || search.length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const token =
      localStorage.getItem("auth-token") || sessionStorage.getItem("auth-token");
    const run = setTimeout(async () => {
      try {
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const q = encodeURIComponent(search);
        const [usersRes, listingsRes] = await Promise.allSettled([
          fetch(`/api/admin/users?search=${q}&limit=5`, { headers }).then((r) => r.json()),
          fetch(`/api/admin/analytics?search=${q}&limit=5`, { headers }).then((r) => r.json()),
        ]);
        if (cancelled) return;
        const out: SearchResult[] = [];
        if (usersRes.status === "fulfilled" && usersRes.value?.success) {
          for (const u of (usersRes.value.data?.users ?? []).slice(0, 5)) {
            out.push({
              type: "user",
              id: u.id,
              label: `${u.firstName} ${u.lastName}`,
              sub: u.email,
              path: `/users`,
            });
          }
        }
        if (listingsRes.status === "fulfilled" && listingsRes.value?.success) {
          for (const l of (listingsRes.value.data?.listings ?? []).slice(0, 5)) {
            out.push({
              type: "listing",
              id: l.id,
              label: l.title,
              sub: l.businessName ?? "Listing",
              path: `/listings`,
            });
          }
        }
        setResults(out);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(run);
    };
  }, [search]);

  const go = (path: string) => {
    onOpenChange(false);
    setSearch("");
    router.push(path);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      onClick={() => onOpenChange(false)}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <Command
        loop
        label="Command Palette"
        className="relative w-full max-w-xl bg-bgdark border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 border-b border-white/10">
          <FaSearch className="text-lighttext/40 flex-shrink-0" />
          <Command.Input
            autoFocus
            placeholder="Search pages, users, listings…"
            value={search}
            onValueChange={setSearch}
            className="flex-1 bg-transparent text-white placeholder:text-lighttext/40 outline-none py-4 text-sm"
          />
          <kbd className="hidden sm:inline-flex text-[10px] text-lighttext/40 border border-white/10 rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        <Command.List className="max-h-[50vh] overflow-y-auto scrollbar-hide p-2">
          {loading && (
            <Command.Loading className="px-3 py-4 text-sm text-lighttext/40">
              Searching…
            </Command.Loading>
          )}

          {/* Search results first when there's a query */}
          {search.trim().length >= 2 && (
            <Command.Group
              heading="Results"
              className="text-lighttext/40 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium"
            >
              {results.length === 0 && !loading && (
                <Command.Empty className="px-3 py-4 text-sm text-lighttext/40">
                  No matches found.
                </Command.Empty>
              )}
              {results.map((r) => (
                <Command.Item
                  key={`${r.type}-${r.id}`}
                  value={`${r.type} ${r.label} ${r.sub}`}
                  onSelect={() => go(r.path)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-greencolor/10 aria-selected:text-greencolor text-lighttext"
                >
                  <FaUser className="w-4 h-4 flex-shrink-0 opacity-60" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">{r.label}</p>
                    <p className="text-xs text-lighttext/50 truncate">{r.sub}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wide text-lighttext/40">
                    {r.type}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {/* Quick navigation */}
          <Command.Group
            heading="Navigation"
            className="text-lighttext/40 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium"
          >
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <Command.Item
                  key={item.path}
                  value={item.label}
                  onSelect={() => go(item.path)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer aria-selected:bg-greencolor/10 aria-selected:text-greencolor text-lighttext"
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm text-white flex-1">{item.label}</span>
                  <span className="text-xs text-lighttext/40">{item.hint}</span>
                </Command.Item>
              );
            })}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
