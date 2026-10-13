"use client";

import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/lib/providers/auth-provider";
import { Spinner } from "@/components/ui/Loader";
import { X } from "lucide-react";

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

function TicketDetailsModal({
  ticket,
  onClose,
}: {
  ticket: Ticket;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#18181b] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">{ticket.ticketNumber}</h2>
            <p className="text-sm text-zinc-400">{ticket.subject}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
              Reported By
            </div>
            <div className="text-sm text-zinc-300">
              {ticket.user.firstName} {ticket.user.lastName} ({ticket.user.email})
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">
              Details
            </div>
            <div className="text-sm text-zinc-300 whitespace-pre-wrap bg-white/5 p-4 rounded-xl border border-white/10">
              {ticket.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupportTicketsPage() {
  const { user, handleApiResponse } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/support-tickets");
      const isValidResponse = await handleApiResponse(response);
      if (!isValidResponse) return;

      const result = await response.json();
      if (result.success) {
        setTickets(result.tickets);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch support tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch("/api/admin/support-tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      
      const isValidResponse = await handleApiResponse(response);
      if (!isValidResponse) return;

      const result = await response.json();
      if (result.success) {
        toast.success("Ticket status updated");
        setTickets((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status } : t))
        );
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  if (!user || user.role !== "ADMIN") return null;

  return (
    <div className="p-4 sm:p-8 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Support Tickets
          </h1>
          <p className="text-zinc-400 mt-1">
            Manage user reports and support requests
          </p>
        </div>
      </div>

      <div className="bg-[#18181b] border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Spinner className="w-8 h-8 text-emerald-500" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-20 text-center text-zinc-500">
            No support tickets found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10 text-sm font-semibold text-zinc-300">
                  <th className="p-4">Ticket</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tickets.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => setSelectedTicket(ticket)}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="font-medium text-white">
                        {ticket.ticketNumber}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-white">
                        {ticket.user.firstName} {ticket.user.lastName}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {ticket.user.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-zinc-300 text-sm max-w-xs truncate">
                        {ticket.subject}
                      </div>
                      <div className="text-xs text-zinc-500 mt-1 max-w-xs truncate">
                        {ticket.category}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.status === "OPEN"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : ticket.status === "RESOLVED"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={ticket.status}
                        onChange={(e) => updateStatus(ticket.id, e.target.value)}
                        className="bg-[#0a0a0c] border border-white/10 rounded-lg px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTicket && (
        <TicketDetailsModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
        />
      )}
    </div>
  );
}
