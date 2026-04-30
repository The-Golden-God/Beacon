"use client";
export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  differenceInDays,
  parseISO,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Search,
  X,
  FileText,
  ExternalLink,
  Edit2,
} from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface EoLogEntry {
  id: string;
  clientId: string;
  sentAt: string;
}

interface Letter {
  id: string;
  clientId: string;
  scenario: string;
  status: string;
  subject: string;
  createdAt: string;
}

type ClientStatus = "contacted" | "urgent" | "upcoming" | "scheduled" | "inactive";

interface EnhancedClient extends Client {
  status: ClientStatus;
  lastSentAt: Date | null;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ClientStatus, { label: string; dotClass: string; pillClass: string }> = {
  contacted: {
    label: "Contacted",
    dotClass: "bg-green-500",
    pillClass: "bg-green-100 text-green-700",
  },
  urgent: {
    label: "Urgent",
    dotClass: "bg-red-500",
    pillClass: "bg-red-100 text-red-700",
  },
  upcoming: {
    label: "Upcoming",
    dotClass: "bg-amber-500",
    pillClass: "bg-amber-100 text-amber-700",
  },
  scheduled: {
    label: "Scheduled",
    dotClass: "bg-blue-500",
    pillClass: "bg-blue-100 text-blue-700",
  },
  inactive: {
    label: "Inactive",
    dotClass: "bg-slate-400",
    pillClass: "bg-slate-100 text-slate-500",
  },
};

function computeStatus(client: Client, lastSentAt: Date | null): ClientStatus {
  if (lastSentAt) return "contacted";

  if (!client.renewalDate) return "inactive";

  const renewal = parseISO(client.renewalDate);
  const daysUntil = differenceInDays(renewal, new Date());

  if (daysUntil < -7) return "inactive";
  if (daysUntil <= 30) return "urgent";
  if (daysUntil <= 60) return "upcoming";
  return "scheduled";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const viewMode = searchParams.get("view") === "list" ? "list" : "calendar";

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [search, setSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => api.get<{ clients: Client[] }>("/clients?limit=500"),
  });

  const { data: logData } = useQuery({
    queryKey: ["eo-log"],
    queryFn: () => api.get<{ log: EoLogEntry[] }>("/log?limit=1000"),
  });

  const enhancedClients = useMemo<EnhancedClient[]>(() => {
    if (!clientsData?.clients) return [];
    const lastSentMap = new Map<string, Date>();
    for (const entry of logData?.log ?? []) {
      const existing = lastSentMap.get(entry.clientId);
      const date = new Date(entry.sentAt);
      if (!existing || date > existing) lastSentMap.set(entry.clientId, date);
    }
    return clientsData.clients.map((c) => {
      const lastSentAt = lastSentMap.get(c.id) ?? null;
      return { ...c, status: computeStatus(c, lastSentAt), lastSentAt };
    });
  }, [clientsData, logData]);

  const filteredClients = useMemo(() => {
    if (!search.trim()) return enhancedClients;
    const q = search.toLowerCase();
    return enhancedClients.filter(
      (c) =>
        c.firstName.toLowerCase().includes(q) ||
        c.lastName.toLowerCase().includes(q)
    );
  }, [enhancedClients, search]);

  const selectedClient = useMemo(
    () => enhancedClients.find((c) => c.id === selectedClientId) ?? null,
    [enhancedClients, selectedClientId]
  );

  const isEmpty = !clientsLoading && enhancedClients.length === 0;

  return (
    <div className="flex flex-col h-full pb-14 lg:pb-0">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b sticky top-0 bg-background z-10 flex-wrap">
        {viewMode === "calendar" && (
          <div className="flex items-center gap-1 mr-2">
            <button
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              className="p-1.5 rounded hover:bg-accent transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold min-w-[110px] text-center">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="p-1.5 rounded hover:bg-accent transition-colors"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        {viewMode === "list" && (
          <h1 className="text-sm font-semibold mr-2">Clients</h1>
        )}

        <div className="flex-1" />

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 pr-8 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring w-48"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* View toggle */}
        <div className="flex items-center rounded-md border overflow-hidden">
          <button
            onClick={() => router.push("/dashboard")}
            className={cn(
              "px-2 py-1.5 transition-colors",
              viewMode === "calendar" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
            )}
            aria-label="Calendar view"
          >
            <LayoutGrid size={14} />
          </button>
          <button
            onClick={() => router.push("/dashboard?view=list")}
            className={cn(
              "px-2 py-1.5 transition-colors",
              viewMode === "list" ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
            )}
            aria-label="List view"
          >
            <List size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isEmpty ? (
          <EmptyState />
        ) : viewMode === "calendar" ? (
          <CalendarView
            currentMonth={currentMonth}
            clients={filteredClients}
            onSelectClient={setSelectedClientId}
          />
        ) : (
          <ListView clients={filteredClients} onSelectClient={setSelectedClientId} />
        )}
      </div>

      {/* Client Panel */}
      {selectedClient && (
        <ClientPanel
          client={selectedClient}
          onClose={() => setSelectedClientId(null)}
        />
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 py-24 text-center px-4">
      <div className="text-6xl">📅</div>
      <div>
        <p className="font-semibold text-lg">Your renewal calendar is empty.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Add your clients to start tracking renewals.
        </p>
      </div>
      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/clients/import"
          className="inline-flex h-9 items-center rounded-md bg-primary text-primary-foreground px-4 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Import from CSV
        </Link>
        <Link
          href="/clients/new"
          className="inline-flex h-9 items-center rounded-md border border-input bg-background px-4 text-sm font-medium hover:bg-accent transition-colors"
        >
          Add a Client Manually
        </Link>
      </div>
    </div>
  );
}

// ─── Calendar View ────────────────────────────────────────────────────────────

function CalendarView({
  currentMonth,
  clients,
  onSelectClient,
}: {
  currentMonth: Date;
  clients: EnhancedClient[];
  onSelectClient: (id: string) => void;
}) {
  const calendarStart = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const clientsByDay = useMemo(() => {
    const map = new Map<string, EnhancedClient[]>();
    for (const c of clients) {
      if (!c.renewalDate) continue;
      const key = format(parseISO(c.renewalDate), "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    return map;
  }, [clients]);

  const weeks: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div className="min-h-full">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {weeks.flatMap((week, wi) =>
          week.map((day, di) => {
            const key = format(day, "yyyy-MM-dd");
            const dayClients = clientsByDay.get(key) ?? [];
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isCurrentDay = isToday(day);
            const showMore = dayClients.length > 3;
            const visibleClients = showMore ? dayClients.slice(0, 3) : dayClients;

            return (
              <div
                key={key}
                className={cn(
                  "min-h-24 p-1 border-b border-r flex flex-col gap-0.5",
                  !isCurrentMonth && "bg-slate-50/50",
                  di === 6 && "border-r-0"
                )}
              >
                <span
                  className={cn(
                    "text-xs w-6 h-6 flex items-center justify-center rounded-full self-end mb-0.5",
                    isCurrentDay
                      ? "bg-blue-600 text-white font-bold"
                      : isCurrentMonth
                      ? "text-foreground"
                      : "text-muted-foreground/40"
                  )}
                >
                  {format(day, "d")}
                </span>

                {visibleClients.map((c) => (
                  <ClientCard key={c.id} client={c} onClick={() => onSelectClient(c.id)} />
                ))}

                {showMore && (
                  <button
                    className="text-xs text-blue-600 hover:underline text-left px-1"
                    onClick={() => {
                      // For now, clicking shows the first overflow client
                      // Could be expanded to a popover
                    }}
                  >
                    +{dayClients.length - 3} more
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ClientCard({
  client,
  onClick,
}: {
  client: EnhancedClient;
  onClick: () => void;
}) {
  const cfg = STATUS_CONFIG[client.status];
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded px-1.5 py-1 text-xs hover:bg-accent transition-colors group"
    >
      <div className="flex items-center gap-1">
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dotClass)} aria-label={cfg.label} />
        <span className={cn("text-[10px] font-medium", cfg.dotClass.replace("bg-", "text-"))}>{cfg.label}</span>
      </div>
      <p className="font-medium text-foreground truncate mt-0.5">
        {client.firstName} {client.lastName}
      </p>
      {(client.policyType || client.carrier) && (
        <p className="text-muted-foreground truncate">
          {[client.policyType, client.carrier].filter(Boolean).join(" · ")}
        </p>
      )}
    </button>
  );
}

// ─── List View ────────────────────────────────────────────────────────────────

type SortField = "status" | "name" | "policy" | "carrier" | "renewal" | "lastOutreach";
type SortDir = "asc" | "desc";

const STATUS_ORDER: Record<ClientStatus, number> = {
  urgent: 0,
  upcoming: 1,
  scheduled: 2,
  contacted: 3,
  inactive: 4,
};

function ListView({
  clients,
  onSelectClient,
}: {
  clients: EnhancedClient[];
  onSelectClient: (id: string) => void;
}) {
  const [sortField, setSortField] = useState<SortField>("renewal");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    return [...clients].sort((a, b) => {
      let cmp = 0;
      if (sortField === "status") cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      else if (sortField === "name") cmp = `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
      else if (sortField === "policy") cmp = (a.policyType ?? "").localeCompare(b.policyType ?? "");
      else if (sortField === "carrier") cmp = (a.carrier ?? "").localeCompare(b.carrier ?? "");
      else if (sortField === "renewal") {
        const ra = a.renewalDate ? new Date(a.renewalDate).getTime() : Infinity;
        const rb = b.renewalDate ? new Date(b.renewalDate).getTime() : Infinity;
        cmp = ra - rb;
      } else if (sortField === "lastOutreach") {
        const la = a.lastSentAt?.getTime() ?? 0;
        const lb = b.lastSentAt?.getTime() ?? 0;
        cmp = lb - la;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [clients, sortField, sortDir]);

  function SortTh({ field, label }: { field: SortField; label: string }) {
    const active = sortField === field;
    return (
      <th
        className="px-3 py-2 text-left text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground select-none whitespace-nowrap"
        onClick={() => toggleSort(field)}
      >
        {label}{" "}
        <span className={cn("text-muted-foreground/50", active && "text-foreground")}>
          {active ? (sortDir === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </th>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b sticky top-0 bg-background">
          <tr>
            <SortTh field="status" label="Status" />
            <SortTh field="name" label="Client Name" />
            <SortTh field="policy" label="Policy" />
            <SortTh field="carrier" label="Carrier" />
            <SortTh field="renewal" label="Renewal Date" />
            <SortTh field="lastOutreach" label="Last Outreach" />
            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((c) => {
            const cfg = STATUS_CONFIG[c.status];
            return (
              <tr
                key={c.id}
                className="border-b hover:bg-accent/40 cursor-pointer transition-colors"
                onClick={() => onSelectClient(c.id)}
              >
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", cfg.pillClass)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dotClass)} />
                    {cfg.label}
                  </span>
                </td>
                <td className="px-3 py-2 font-medium whitespace-nowrap">
                  {c.firstName} {c.lastName}
                </td>
                <td className="px-3 py-2 text-muted-foreground capitalize">
                  {c.policyType ?? "—"}
                </td>
                <td className="px-3 py-2 text-muted-foreground">{c.carrier ?? "—"}</td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                  {c.renewalDate
                    ? format(parseISO(c.renewalDate), "MMM d, yyyy")
                    : "—"}
                </td>
                <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">
                  {c.lastSentAt ? format(c.lastSentAt, "MMM d, yyyy") : "—"}
                </td>
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <Link
                    href={`/letters/new?clientId=${c.id}`}
                    className="text-blue-600 hover:underline text-xs"
                  >
                    Generate Letter
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {sorted.length === 0 && (
        <div className="py-16 text-center text-muted-foreground text-sm">
          No clients match your search.
        </div>
      )}
    </div>
  );
}

// ─── Client Panel ─────────────────────────────────────────────────────────────

function ClientPanel({
  client,
  onClose,
}: {
  client: EnhancedClient;
  onClose: () => void;
}) {
  const cfg = STATUS_CONFIG[client.status];

  const { data: lettersData } = useQuery({
    queryKey: ["client-letters", client.id],
    queryFn: () => api.get<{ letters: Letter[] }>(`/letters?clientId=${client.id}&limit=10`),
  });

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-background z-50 shadow-xl flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b">
          <div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium mb-2",
                cfg.pillClass
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dotClass)} />
              {cfg.label}
            </span>
            <h2 className="text-lg font-semibold">
              {client.firstName} {client.lastName}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-accent transition-colors text-muted-foreground"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 space-y-4">
          {/* Policy info */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Policy
            </h3>
            <dl className="space-y-1 text-sm">
              <Row label="Type" value={client.policyType} />
              <Row label="Carrier" value={client.carrier} />
              <Row
                label="Premium"
                value={client.premium ? `$${parseFloat(client.premium).toLocaleString()}/yr` : undefined}
              />
              <Row
                label="Renewal"
                value={
                  client.renewalDate
                    ? format(parseISO(client.renewalDate), "MMMM d, yyyy")
                    : undefined
                }
              />
            </dl>
          </section>

          <div className="border-t" />

          {/* Contact */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Contact
            </h3>
            <dl className="space-y-1 text-sm">
              <Row label="Email" value={client.email} />
              <Row label="Phone" value={client.phone} />
            </dl>
          </section>

          <div className="border-t" />

          {/* Letter history */}
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Letter History
            </h3>
            {!lettersData ? (
              <p className="text-xs text-muted-foreground">Loading…</p>
            ) : lettersData.letters.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No letters yet. Generate your first letter for this client.
              </p>
            ) : (
              <ul className="space-y-1">
                {lettersData.letters.map((l) => (
                  <li key={l.id} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground shrink-0">
                      {format(new Date(l.createdAt), "MMM d")}
                    </span>
                    <span className="flex-1 truncate capitalize">
                      {l.scenario.replace(/_/g, " ")}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[10px] font-medium shrink-0",
                        l.status === "sent"
                          ? "bg-green-100 text-green-700"
                          : l.status === "pending_approval"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {l.status === "sent"
                        ? "Sent"
                        : l.status === "pending_approval"
                        ? "Awaiting Approval"
                        : "Saved"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t flex flex-col gap-2">
          <Link
            href={`/letters/new?clientId=${client.id}`}
            className="flex h-9 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors gap-2"
          >
            <FileText size={14} />
            Generate Letter
          </Link>
          <div className="flex gap-2">
            <Link
              href={`/clients/${client.id}/edit`}
              className="flex-1 flex h-9 items-center justify-center rounded-md border border-input text-sm hover:bg-accent transition-colors gap-1.5"
            >
              <Edit2 size={13} />
              Edit Client
            </Link>
            <Link
              href={`/clients/${client.id}`}
              className="flex-1 flex h-9 items-center justify-center rounded-md border border-input text-sm hover:bg-accent transition-colors gap-1.5"
            >
              <ExternalLink size={13} />
              View Full
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-2">
      <dt className="text-muted-foreground w-16 shrink-0">{label}</dt>
      <dd className="text-foreground">{value || "—"}</dd>
    </div>
  );
}
