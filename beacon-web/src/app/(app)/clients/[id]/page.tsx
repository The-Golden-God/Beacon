"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
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
  notes?: string | null;
}

interface Letter {
  id: string;
  scenario: string;
  status: string;
  subject: string;
  createdAt: string;
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dangerOpen, setDangerOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notes, setNotes] = useState<string | null>(null);
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  const { data: clientData, isLoading } = useQuery({
    queryKey: ["client", id],
    queryFn: () => api.get<{ client: Client }>(`/clients/${id}`),
    enabled: !!id,
  });

  const { data: lettersData } = useQuery({
    queryKey: ["client-letters", id],
    queryFn: () => api.get<{ letters: Letter[] }>(`/letters?clientId=${id}&limit=20`),
    enabled: !!id,
  });

  const { data: logData } = useQuery({
    queryKey: ["eo-log"],
    queryFn: () => api.get<{ log: Array<{ clientId: string; sentAt: string }> }>("/log?limit=2000"),
  });

  const client = clientData?.client;
  const lastSentAt = client ? (buildSentMap(logData?.log ?? []).get(client.id) ?? null) : null;
  const status = client ? computeClientStatus(client.renewalDate, lastSentAt) : "inactive";
  const cfg = STATUS_CONFIG[status];
  const displayNotes = notes ?? client?.notes ?? "";

  async function handleSaveNotes() {
    if (!client) return;
    setSavingNotes(true);
    try {
      await api.patch(`/clients/${id}`, { notes: displayNotes });
      queryClient.invalidateQueries({ queryKey: ["client", id] });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch {
      toast.error("Failed to save notes.");
    } finally {
      setSavingNotes(false);
    }
  }

  async function handleDelete() {
    if (!client) return;
    setDeleting(true);
    try {
      await api.delete(`/clients/${id}`);
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      toast.success(`${client.firstName} ${client.lastName} deleted.`);
      router.push("/clients");
    } catch {
      toast.error("Failed to delete client.");
      setDeleting(false);
    }
  }

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground animate-pulse">Loading…</div>;
  }

  if (!client) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">Client not found.</p>
        <Link href="/clients" className="text-sm text-blue-600 hover:underline mt-2 inline-block">← Back to Clients</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl pb-14 lg:pb-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4">
        <Link href="/clients" className="text-sm text-muted-foreground hover:text-foreground">← Clients</Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">{client.firstName} {client.lastName}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium mb-2", cfg.pillClass)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dotClass)} />
            {cfg.label}
          </span>
          <h1 className="text-xl font-semibold">{client.firstName} {client.lastName}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {[client.policyType, client.carrier, client.renewalDate ? `Renewal ${format(parseISO(client.renewalDate), "MMM d, yyyy")}` : null]
              .filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/letters/new?clientId=${id}`} className="flex h-9 items-center rounded-md bg-primary text-primary-foreground px-3 text-sm font-medium hover:bg-primary/90 transition-colors gap-1.5">
            <FileText size={13} />
            Generate Letter
          </Link>
          <Link href={`/clients/${id}/edit`} className="flex h-9 items-center rounded-md border border-input px-3 text-sm hover:bg-accent transition-colors">
            Edit
          </Link>
        </div>
      </div>

      {/* Two-column info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Contact</h3>
            <dl className="space-y-1 text-sm">
              <InfoRow label="Email" value={client.email} />
              <InfoRow label="Phone" value={client.phone} />
            </dl>
          </section>

          <section>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Notes</h3>
            <textarea
              value={displayNotes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="No notes — click to add…"
              rows={4}
              className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {savingNotes && <p className="text-xs text-muted-foreground mt-1">Saving…</p>}
            {notesSaved && <p className="text-xs text-green-600 mt-1">Saved ✓</p>}
          </section>
        </div>

        <section>
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Policy</h3>
          <dl className="space-y-1 text-sm">
            <InfoRow label="Type" value={client.policyType} className="capitalize" />
            <InfoRow label="Carrier" value={client.carrier} />
            <InfoRow label="Premium" value={client.premium ? `$${parseFloat(client.premium).toLocaleString()}/yr` : undefined} />
            <InfoRow label="Renewal" value={client.renewalDate ? format(parseISO(client.renewalDate), "MMMM d, yyyy") : undefined} />
          </dl>
        </section>
      </div>

      {/* Letter history */}
      <section className="mb-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Letter History</h3>
        {!lettersData || lettersData.letters.length === 0 ? (
          <div className="py-6 text-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">No letters generated yet for this client.</p>
            <Link href={`/letters/new?clientId=${id}`} className="text-sm text-blue-600 hover:underline mt-1 inline-block">
              Generate First Letter →
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            {lettersData.letters.map((l, i) => (
              <div key={l.id} className={cn("flex items-center gap-3 px-4 py-3 text-sm", i > 0 && "border-t")}>
                <span className="text-muted-foreground shrink-0 w-20">
                  {format(new Date(l.createdAt), "MMM d, yyyy")}
                </span>
                <span className="flex-1 truncate capitalize">{l.scenario.replace(/_/g, " ")}</span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium shrink-0",
                  l.status === "sent" ? "bg-green-100 text-green-700"
                  : l.status === "pending_approval" ? "bg-amber-100 text-amber-700"
                  : "bg-slate-100 text-slate-600"
                )}>
                  {l.status === "sent" ? "Sent" : l.status === "pending_approval" ? "Awaiting Approval" : "Saved"}
                </span>
                <Link href={`/log`} className="text-xs text-blue-600 hover:underline shrink-0">View</Link>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Danger zone */}
      <div className="border rounded-lg">
        <button
          onClick={() => setDangerOpen((v) => !v)}
          className="flex items-center gap-2 w-full px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {dangerOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          Danger Zone
        </button>
        {dangerOpen && (
          <div className="border-t px-4 py-3">
            <p className="text-sm text-muted-foreground mb-3">Permanently delete this client record.</p>
            <button
              onClick={() => setShowDelete(true)}
              className="h-9 px-4 rounded-md border border-destructive text-destructive text-sm hover:bg-destructive/10 transition-colors"
            >
              Delete Client
            </button>
          </div>
        )}
      </div>

      {showDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-background rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h2 className="font-semibold">Delete {client.firstName} {client.lastName}?</h2>
            <p className="text-sm text-muted-foreground">This removes their record and cannot be undone. Their E&amp;O log entries will be retained.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowDelete(false)} className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="h-9 px-4 rounded-md bg-destructive text-white text-sm font-medium hover:bg-destructive/90 disabled:opacity-50 transition-colors">
                {deleting ? "Deleting…" : "Delete Client"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, className }: { label: string; value?: string | null; className?: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-muted-foreground w-16 shrink-0">{label}</dt>
      <dd className={cn("text-foreground", className)}>{value || "—"}</dd>
    </div>
  );
}
