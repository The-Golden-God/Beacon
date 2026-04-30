"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { api } from "@/lib/api";

interface LogEntry {
  id: string;
  clientId: string;
  letterId?: string | null;
  clientNameSnapshot: string;
  clientEmailSnapshot?: string | null;
  letterSubjectSnapshot: string;
  letterContentSnapshot: string;
  sendMethod: string;
  sentToEmail?: string | null;
  sentAt: string;
  scenario?: string | null;
}

export default function LogEntryPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["log-entry", id],
    queryFn: () => api.get<{ entry: LogEntry }>(`/log/${id}`),
    enabled: !!id,
  });

  const entry = data?.entry;

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground animate-pulse">Loading…</div>;
  }

  if (!entry) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Log entry not found.</p>
        <Link href="/log" className="text-sm text-blue-600 hover:underline mt-2 inline-block">← Back to Log</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl pb-14 lg:pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <Link href="/log" className="text-sm text-muted-foreground hover:text-foreground">← E&amp;O Log</Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{entry.clientNameSnapshot}</span>
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-lg font-semibold mb-1">{entry.letterSubjectSnapshot}</h1>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Sent {format(new Date(entry.sentAt), "MMMM d, yyyy 'at' h:mm a")}</span>
          <span>To: {entry.sentToEmail ?? "—"}</span>
          <span className="capitalize">via {entry.sendMethod?.replace(/_/g, " ") ?? "—"}</span>
          {entry.scenario && <span className="capitalize">{entry.scenario.replace(/_/g, " ")}</span>}
        </div>
      </div>

      {/* Meta */}
      <div className="rounded-lg border p-4 mb-6 space-y-2 text-sm bg-muted/30">
        <div className="flex gap-3">
          <span className="text-muted-foreground w-28 shrink-0">Client</span>
          <Link href={`/clients/${entry.clientId}`} className="text-blue-600 hover:underline font-medium">
            {entry.clientNameSnapshot}
          </Link>
        </div>
        {entry.clientEmailSnapshot && (
          <div className="flex gap-3">
            <span className="text-muted-foreground w-28 shrink-0">Client Email</span>
            <span>{entry.clientEmailSnapshot}</span>
          </div>
        )}
        <div className="flex gap-3">
          <span className="text-muted-foreground w-28 shrink-0">Sent To</span>
          <span>{entry.sentToEmail ?? "—"}</span>
        </div>
        <div className="flex gap-3">
          <span className="text-muted-foreground w-28 shrink-0">Method</span>
          <span className="capitalize">{entry.sendMethod?.replace(/_/g, " ") ?? "—"}</span>
        </div>
        {entry.letterId && (
          <div className="flex gap-3">
            <span className="text-muted-foreground w-28 shrink-0">Letter ID</span>
            <span className="font-mono text-xs text-muted-foreground">{entry.letterId}</span>
          </div>
        )}
      </div>

      {/* Letter content (read-only) */}
      <div className="rounded-lg border overflow-hidden">
        <div className="px-4 py-2 bg-muted/30 border-b">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Letter Content (Snapshot)</p>
        </div>
        <div className="p-6">
          <p className="text-sm font-medium mb-4">{entry.letterSubjectSnapshot}</p>
          <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground">
            {entry.letterContentSnapshot}
          </div>
        </div>
        <div className="px-6 py-3 bg-amber-50 border-t border-amber-100">
          <p className="text-xs text-amber-700">
            This is an immutable E&amp;O snapshot. The content shown is exactly what was sent to the client.
          </p>
        </div>
      </div>
    </div>
  );
}
