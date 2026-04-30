"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Search, X } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  clientId: string;
  clientNameSnapshot: string;
  clientEmailSnapshot?: string | null;
  letterSubjectSnapshot: string;
  sendMethod: string;
  sentToEmail?: string | null;
  sentAt: string;
  scenario?: string | null;
}

const SCENARIOS = [
  { value: "pre_renewal", label: "Pre-Renewal" },
  { value: "rate_increase", label: "Rate Increase" },
  { value: "new_client_welcome", label: "New Client Welcome" },
];

const PAGE_SIZE = 50;

export default function LogPage() {
  const [search, setSearch] = useState("");
  const [scenarioFilter, setScenarioFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loaded, setLoaded] = useState(PAGE_SIZE);

  const params = new URLSearchParams({ limit: "2000" });
  if (fromDate) params.set("from", fromDate);
  if (toDate) params.set("to", toDate);

  const { data, isLoading } = useQuery({
    queryKey: ["eo-log-page", fromDate, toDate],
    queryFn: () => api.get<{ log: LogEntry[] }>(`/log?${params.toString()}`),
  });

  const allEntries = data?.log ?? [];

  const filtered = allEntries.filter((e) => {
    if (scenarioFilter && e.scenario !== scenarioFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        (e.clientNameSnapshot ?? "").toLowerCase().includes(q) ||
        (e.letterSubjectSnapshot ?? "").toLowerCase().includes(q) ||
        (e.sentToEmail ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const visible = filtered.slice(0, loaded);
  const hasMore = filtered.length > loaded;
  const hasFilters = !!(search || scenarioFilter || fromDate || toDate);

  function clearFilters() {
    setSearch(""); setScenarioFilter(""); setFromDate(""); setToDate("");
  }

  return (
    <div className="flex flex-col h-full pb-14 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div>
          <h1 className="text-base font-semibold">E&amp;O Log</h1>
          <p className="text-xs text-muted-foreground">Immutable record of all sent communications</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 px-4 py-2 border-b flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by client or subject…"
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
          value={scenarioFilter}
          onChange={(e) => setScenarioFilter(e.target.value)}
          className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Scenarios</option>
          {SCENARIOS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        {hasFilters && (
          <button onClick={clearFilters} className="text-xs text-blue-600 hover:underline">
            Clear all
          </button>
        )}

        <span className="ml-auto text-xs text-muted-foreground">
          {isLoading ? "Loading…" : `${filtered.length} entr${filtered.length === 1 ? "y" : "ies"}`}
        </span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {!isLoading && allEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center px-4">
            <div className="text-5xl">📋</div>
            <div>
              <p className="font-semibold">No log entries yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Sent letters will appear here for your E&amp;O records.</p>
            </div>
          </div>
        ) : !isLoading && filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">No entries match your filters.</p>
            <button onClick={clearFilters} className="mt-2 text-sm text-blue-600 hover:underline">Clear filters</button>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead className="border-b sticky top-0 bg-background">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Date Sent</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Client</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Subject</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Scenario</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Sent To</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground hidden xl:table-cell">Method</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody>
                {visible.map((e, i) => (
                  <tr key={e.id} className={cn("border-b hover:bg-accent/30 transition-colors", i % 2 === 0 ? "" : "bg-muted/20")}>
                    <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                      {format(new Date(e.sentAt), "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-2">
                      <Link href={`/clients/${e.clientId}`} className="font-medium hover:text-blue-600 transition-colors">
                        {e.clientNameSnapshot}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground hidden md:table-cell max-w-xs truncate">
                      {e.letterSubjectSnapshot}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground hidden lg:table-cell capitalize">
                      {e.scenario?.replace(/_/g, " ") ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground hidden lg:table-cell">
                      {e.sentToEmail ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground hidden xl:table-cell capitalize">
                      {e.sendMethod?.replace(/_/g, " ") ?? "—"}
                    </td>
                    <td className="px-4 py-2">
                      <Link href={`/log/${e.id}`} className="text-xs text-blue-600 hover:underline whitespace-nowrap">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {hasMore && (
              <div className="flex justify-center py-4">
                <button
                  onClick={() => setLoaded((n) => n + PAGE_SIZE)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Load more ({filtered.length - loaded} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
