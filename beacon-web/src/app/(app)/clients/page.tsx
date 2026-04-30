"use client";
export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Plus, Upload, Search, X, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { computeClientStatus, buildSentMap, STATUS_CONFIG } from "@/lib/client-status";

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  policyType?: string | null;
  carrier?: string | null;
  premium?: string | null;
  renewalDate?: string | null;
  doNotContact: boolean;
}

const POLICY_TYPES = ["Auto", "Home", "Life", "Health", "Commercial", "Umbrella", "Other"];
const PAGE_SIZE = 50;

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [policyFilter, setPolicyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showActionsFor, setShowActionsFor] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(PAGE_SIZE);

  const { data: clientsData, isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => api.get<{ clients: Client[] }>("/clients?limit=1000"),
  });

  const { data: logData } = useQuery({
    queryKey: ["eo-log"],
    queryFn: () => api.get<{ log: Array<{ clientId: string; sentAt: string }> }>("/log?limit=2000"),
  });

  const sentMap = useMemo(() => buildSentMap(logData?.log ?? []), [logData]);

  const enhanced = useMemo(() => {
    return (clientsData?.clients ?? []).map((c) => ({
      ...c,
      status: computeClientStatus(c.renewalDate, sentMap.get(c.id) ?? null),
      lastSentAt: sentMap.get(c.id) ?? null,
    }));
  }, [clientsData, sentMap]);

  const filtered = useMemo(() => {
    let list = enhanced;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.firstName.toLowerCase().includes(q) ||
          c.lastName.toLowerCase().includes(q) ||
          (c.email ?? "").toLowerCase().includes(q)
      );
    }
    if (policyFilter) list = list.filter((c) => c.policyType?.toLowerCase() === policyFilter.toLowerCase());
    if (statusFilter) list = list.filter((c) => c.status === statusFilter);
    return list;
  }, [enhanced, search, policyFilter, statusFilter]);

  // Sort: urgent first, then by renewal date
  const sorted = useMemo(() => {
    const order = { urgent: 0, upcoming: 1, scheduled: 2, contacted: 3, inactive: 4 };
    return [...filtered].sort((a, b) => {
      const so = (order[a.status] ?? 5) - (order[b.status] ?? 5);
      if (so !== 0) return so;
      const ra = a.renewalDate ? new Date(a.renewalDate).getTime() : Infinity;
      const rb = b.renewalDate ? new Date(b.renewalDate).getTime() : Infinity;
      return ra - rb;
    });
  }, [filtered]);

  const visible = sorted.slice(0, loaded);
  const hasMore = sorted.length > loaded;

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/clients/${deleteTarget.id}`);
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(`${deleteTarget.firstName} ${deleteTarget.lastName} deleted.`);
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete client.");
    } finally {
      setDeleting(false);
    }
  }

  const hasFilters = !!(search || policyFilter || statusFilter);

  return (
    <div className="flex flex-col h-full pb-14 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h1 className="text-base font-semibold">Clients</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/clients/import"
            className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-input text-sm hover:bg-accent transition-colors"
          >
            <Upload size={13} />
            Import CSV
          </Link>
          <Link
            href="/clients/new"
            className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
          >
            <Plus size={13} />
            Add Client
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 px-4 py-2 border-b flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-8 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring w-52"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X size={12} />
            </button>
          )}
        </div>

        <select
          value={policyFilter}
          onChange={(e) => setPolicyFilter(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Policy Types</option>
          {POLICY_TYPES.map((t) => <option key={t} value={t.toLowerCase()}>{t}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Statuses</option>
          <option value="urgent">Urgent</option>
          <option value="upcoming">Upcoming</option>
          <option value="contacted">Contacted</option>
          <option value="scheduled">Scheduled</option>
          <option value="inactive">Inactive</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setPolicyFilter(""); setStatusFilter(""); }}
            className="text-xs text-blue-600 hover:underline"
          >
            Clear all
          </button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {isLoading ? "Loading…" : `${sorted.length} client${sorted.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {!isLoading && enhanced.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-24 text-center px-4">
            <div className="text-5xl">👥</div>
            <div>
              <p className="font-semibold">No clients yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Add clients manually or import from a CSV.</p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link href="/clients/import" className="inline-flex h-9 items-center rounded-md bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary/90 transition-colors">
                Import from CSV
              </Link>
              <Link href="/clients/new" className="inline-flex h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent transition-colors">
                Add a Client
              </Link>
            </div>
          </div>
        ) : !isLoading && sorted.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No clients match &ldquo;{search}&rdquo; — check the spelling or try a shorter search.
            </p>
            <button onClick={() => { setSearch(""); setPolicyFilter(""); setStatusFilter(""); }} className="mt-2 text-sm text-blue-600 hover:underline">
              Clear search
            </button>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="border-b sticky top-0 bg-background">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground w-8" />
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Name</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Policy</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Renewal Date</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Carrier</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground hidden xl:table-cell">Last Outreach</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((c) => {
                  const cfg = STATUS_CONFIG[c.status];
                  return (
                    <tr key={c.id} className="border-b hover:bg-accent/30 transition-colors">
                      <td className="px-3 py-2">
                        <span
                          className={cn("w-2 h-2 rounded-full inline-block", cfg.dotClass)}
                          title={cfg.label}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <Link href={`/clients/${c.id}`} className="font-medium hover:text-blue-600 transition-colors">
                          {c.firstName} {c.lastName}
                        </Link>
                        {c.doNotContact && (
                          <span className="ml-1.5 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">DNC</span>
                        )}
                        <p className="text-xs text-muted-foreground">{c.email ?? c.phone ?? ""}</p>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground capitalize hidden md:table-cell">{c.policyType ?? "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground hidden lg:table-cell">
                        {c.renewalDate ? format(parseISO(c.renewalDate), "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground hidden lg:table-cell">{c.carrier ?? "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground hidden xl:table-cell">
                        {c.lastSentAt ? format(c.lastSentAt, "MMM d, yyyy") : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Link href={`/letters/new?clientId=${c.id}`} className="text-xs text-blue-600 hover:underline whitespace-nowrap">
                            Generate Letter
                          </Link>
                          <div className="relative">
                            <button
                              onClick={() => setShowActionsFor(showActionsFor === c.id ? null : c.id)}
                              className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground"
                            >
                              <MoreHorizontal size={14} />
                            </button>
                            {showActionsFor === c.id && (
                              <div className="absolute right-0 top-full mt-0.5 bg-popover border rounded-md shadow-lg z-50 py-1 min-w-[130px]">
                                <Link
                                  href={`/clients/${c.id}/edit`}
                                  onClick={() => setShowActionsFor(null)}
                                  className="block px-3 py-1.5 text-sm hover:bg-accent transition-colors"
                                >
                                  Edit Client
                                </Link>
                                <button
                                  onClick={() => { setShowActionsFor(null); setDeleteTarget(c); }}
                                  className="block w-full text-left px-3 py-1.5 text-sm text-destructive hover:bg-accent transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {hasMore && (
              <div className="flex justify-center py-4">
                <button
                  onClick={() => setLoaded((n) => n + PAGE_SIZE)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Load more ({sorted.length - loaded} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirm modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h2 className="font-semibold text-base">Delete {deleteTarget.firstName} {deleteTarget.lastName}?</h2>
            <p className="text-sm text-muted-foreground">
              This removes their record and cannot be undone. Their E&amp;O log entries will be retained.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="h-9 px-4 rounded-md bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting…" : "Delete Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
