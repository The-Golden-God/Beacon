"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Copy, Send, CheckCircle, Loader2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Letter {
  id: string;
  clientId: string;
  scenario: string;
  status: string;
  subject: string;
  content: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  policyType?: string | null;
}

const SCENARIO_LABELS: Record<string, string> = {
  pre_renewal: "Pre-Renewal Outreach",
  rate_increase: "Rate Increase Explanation",
  new_client_welcome: "New Client Welcome",
  claims_checkin: "Claims Check-In",
  coverage_gap: "Coverage Gap Notice",
  annual_review: "Annual Review Invitation",
};

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  pending_approval: "bg-amber-100 text-amber-700",
  approved: "bg-blue-100 text-blue-700",
  sent: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const DEFAULT_DISCLAIMER =
  "This communication is for informational purposes only and does not constitute a contract or guarantee of coverage. Please refer to your policy documents for complete terms, conditions, and exclusions. Coverage is subject to underwriting approval.";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LetterViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [sending, setSending] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);

  const { data: letterData, isLoading } = useQuery({
    queryKey: ["letter", id],
    queryFn: () => api.get<{ letter: Letter }>(`/letters/${id}`),
  });

  const letter = letterData?.letter;

  const { data: clientData } = useQuery({
    queryKey: ["client", letter?.clientId],
    queryFn: () => api.get<{ client: Client }>(`/clients/${letter!.clientId}`),
    enabled: !!letter?.clientId,
  });

  const { data: workspaceData } = useQuery({
    queryKey: ["workspace"],
    queryFn: () => api.get<{ workspace: { eoDisclaimer?: string | null; signatureBlock?: string | null } }>("/workspace"),
  });

  const client = clientData?.client;
  const disclaimer = workspaceData?.workspace.eoDisclaimer ?? DEFAULT_DISCLAIMER;
  const signatureBlock = workspaceData?.workspace.signatureBlock;

  async function handleSend() {
    if (!letter || !client) return;
    setSending(true);
    try {
      await api.post(`/letters/${letter.id}/send`, {
        method: "manual",
        toEmail: client.email ?? undefined,
      });
      setShowSendConfirm(false);
      toast.success("Letter sent and logged to your E&O record.");
      queryClient.invalidateQueries({ queryKey: ["letter", id] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  async function handleCopy() {
    if (!letter) return;
    await navigator.clipboard.writeText(`${letter.subject}\n\n${letter.content}`);
    toast.success("Copied to clipboard");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-muted-foreground" size={20} />
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Letter not found.{" "}
        <Link href="/letters/new" className="underline">Generate a new one</Link>
      </div>
    );
  }

  const isSent = letter.status === "sent";

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 pb-14 lg:pb-6">
      {/* Back nav */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        Back
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", STATUS_STYLES[letter.status] ?? STATUS_STYLES.draft)}>
              {letter.status.replace("_", " ")}
            </span>
            <span className="text-xs text-muted-foreground">
              {SCENARIO_LABELS[letter.scenario] ?? letter.scenario}
            </span>
          </div>
          <h1 className="text-lg font-semibold truncate">{letter.subject}</h1>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
            {client && (
              <Link
                href={`/clients/${client.id}`}
                className="hover:text-foreground flex items-center gap-1 transition-colors"
              >
                {client.firstName} {client.lastName}
                <ExternalLink size={10} />
              </Link>
            )}
            <span>Created {format(parseISO(letter.createdAt), "MMM d, yyyy")}</span>
            {letter.version > 1 && <span>v{letter.version}</span>}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border hover:bg-accent transition-colors"
          >
            <Copy size={13} />
            Copy
          </button>
          {!isSent && (
            <button
              onClick={() => setShowSendConfirm(true)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Send size={13} />
              Send
            </button>
          )}
          {isSent && (
            <span className="flex items-center gap-1.5 text-sm text-green-600">
              <CheckCircle size={14} />
              Sent
            </span>
          )}
        </div>
      </div>

      {/* Send confirm */}
      {showSendConfirm && !isSent && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between gap-4">
          <p className="text-sm text-amber-800">
            Send to <strong>{client?.email ?? "client"}</strong> and log to E&amp;O record?
          </p>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setShowSendConfirm(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSend} disabled={sending}>
              {sending ? <Loader2 size={13} className="animate-spin" /> : "Confirm Send"}
            </Button>
          </div>
        </div>
      )}

      {/* Letter content */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <div className="border-b pb-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-1">Subject</p>
          <p className="text-sm font-medium">{letter.subject}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2">Letter</p>
          <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{letter.content}</pre>
        </div>

        {signatureBlock && (
          <div className="border-t pt-3">
            <pre className="text-sm whitespace-pre-wrap font-sans text-muted-foreground leading-relaxed">
              {signatureBlock}
            </pre>
          </div>
        )}

        <div className="border-t pt-3 rounded-md bg-muted/40 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground mb-1">🔒 E&amp;O Disclaimer</p>
          <p className="text-xs text-muted-foreground italic">{disclaimer}</p>
        </div>
      </div>

      {/* Edit link (only if not sent) */}
      {!isSent && (
        <p className="mt-4 text-xs text-center text-muted-foreground">
          Need to make changes?{" "}
          <Link
            href={`/letters/new?clientId=${letter.clientId}`}
            className="underline hover:text-foreground"
          >
            Generate a new letter for this client
          </Link>
        </p>
      )}
    </div>
  );
}
