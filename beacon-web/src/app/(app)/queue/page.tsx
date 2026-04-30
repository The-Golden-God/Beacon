"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface QueueItem {
  id: string;
  clientId: string;
  clientName: string;
  subject: string;
  scenario: string;
  createdAt: string;
  agentName?: string | null;
}

export default function QueuePage() {
  const queryClient = useQueryClient();
  const [processing, setProcessing] = useState<string | null>(null);
  const [preview, setPreview] = useState<QueueItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["queue"],
    queryFn: () => api.get<{ items: QueueItem[] }>("/letters?status=pending_approval&limit=100"),
  });

  const items = (data as { letters?: QueueItem[] })?.letters ?? [];

  async function handleApprove(item: QueueItem) {
    setProcessing(item.id);
    try {
      await api.post(`/letters/${item.id}/send`, { method: "manual" });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      queryClient.invalidateQueries({ queryKey: ["eo-log"] });
      toast.success(`Letter to ${item.clientName} approved and sent.`);
      if (preview?.id === item.id) setPreview(null);
    } catch {
      toast.error("Failed to approve letter.");
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject(item: QueueItem) {
    setProcessing(item.id);
    try {
      await api.patch(`/letters/${item.id}`, { status: "draft" });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      toast.success("Letter returned to draft.");
      if (preview?.id === item.id) setPreview(null);
    } catch {
      toast.error("Failed to reject letter.");
    } finally {
      setProcessing(null);
    }
  }

  return (
    <div className="flex h-full pb-14 lg:pb-0">
      {/* List */}
      <div className={cn("flex flex-col border-r", preview ? "hidden md:flex md:w-80 shrink-0" : "flex-1")}>
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div>
            <h1 className="text-base font-semibold">Approval Queue</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Review letters before they go out.</p>
          </div>
          {items.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 font-medium">
              {items.length} pending
            </span>
          )}
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground animate-pulse">Loading…</div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-center px-4">
              <CheckCircle size={40} className="text-green-400" />
              <div>
                <p className="font-medium">All caught up!</p>
                <p className="text-sm text-muted-foreground mt-1">No letters awaiting approval.</p>
              </div>
            </div>
          ) : (
            items.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setPreview(item)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b hover:bg-accent/40 transition-colors",
                  preview?.id === item.id && "bg-accent/60",
                  i === 0 && "border-t-0"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.clientName}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{item.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.agentName && <span>{item.agentName} · </span>}
                      {format(new Date(item.createdAt), "MMM d, h:mm a")}
                    </p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 rounded-full px-2 py-0.5 shrink-0">
                    {item.scenario?.replace(/_/g, " ") ?? "letter"}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Preview panel */}
      {preview ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{preview.subject}</p>
              <p className="text-xs text-muted-foreground">
                For{" "}
                <Link href={`/clients/${preview.clientId}`} className="text-blue-600 hover:underline">
                  {preview.clientName}
                </Link>
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <button
                onClick={() => setPreview(null)}
                className="text-xs text-muted-foreground hover:text-foreground md:hidden"
              >
                ← Back
              </button>
              <button
                onClick={() => handleReject(preview)}
                disabled={processing === preview.id}
                className="flex items-center gap-1.5 h-8 px-3 rounded-md border border-destructive text-destructive text-xs font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
              >
                <XCircle size={13} />
                Reject
              </button>
              <button
                onClick={() => handleApprove(preview)}
                disabled={processing === preview.id}
                className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                <CheckCircle size={13} />
                {processing === preview.id ? "Sending…" : "Approve & Send"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <Link
              href={`/letters/new?letterId=${preview.id}`}
              className="text-xs text-blue-600 hover:underline mb-4 inline-block"
            >
              Open in editor →
            </Link>
            <p className="text-xs text-muted-foreground mb-4">
              Submitted {format(new Date(preview.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
            <div className="rounded-lg border p-6 text-sm whitespace-pre-wrap leading-relaxed bg-background">
              {preview.subject}
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center text-muted-foreground">
          <p className="text-sm">Select a letter to preview</p>
        </div>
      )}
    </div>
  );
}
