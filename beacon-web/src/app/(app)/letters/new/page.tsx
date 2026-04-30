"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  FileDown,
  Send,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
}

interface WorkspaceData {
  workspace: {
    name: string;
    signatureBlock?: string | null;
    eoDisclaimer?: string | null;
  };
  subscription: {
    status: string;
    trialLettersUsed: number;
    trialLettersLimit: number;
  };
}

const SCENARIOS = [
  { value: "pre_renewal", label: "Pre-Renewal Outreach" },
  { value: "rate_increase", label: "Rate Increase Explanation" },
  { value: "new_client_welcome", label: "New Client Welcome" },
] as const;

type ScenarioValue = (typeof SCENARIOS)[number]["value"];

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

const DEFAULT_DISCLAIMER =
  "This communication is for informational purposes only and does not constitute a contract or guarantee of coverage. Please refer to your policy documents for complete terms, conditions, and exclusions. Coverage is subject to underwriting approval.";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewLetterPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const preloadClientId = searchParams.get("clientId");

  // Left panel state
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [scenario, setScenario] = useState<ScenarioValue>("pre_renewal");
  const [policyType, setPolicyType] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [carrier, setCarrier] = useState("");
  const [premium, setPremium] = useState("");
  const [optionalOpen, setOptionalOpen] = useState(false);

  // Scenario-specific fields
  const [yearsAsClient, setYearsAsClient] = useState("");
  const [recentLifeChange, setRecentLifeChange] = useState("");
  const [rateIncrease, setRateIncrease] = useState("");
  const [rateReason, setRateReason] = useState("");
  const [rateOption, setRateOption] = useState<"quote" | "staying">("staying");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [whatInsured, setWhatInsured] = useState("");

  // Right panel state
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [letterId, setLetterId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "unsaved" | "saving" | "error">("idle");
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [sending, setSending] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Data queries
  const { data: clientsData } = useQuery({
    queryKey: ["clients"],
    queryFn: () => api.get<{ clients: Client[] }>("/clients?limit=500"),
  });

  const { data: workspaceData } = useQuery({
    queryKey: ["workspace"],
    queryFn: () => api.get<WorkspaceData>("/workspace"),
  });

  // Pre-load client from URL param
  useEffect(() => {
    if (!preloadClientId || !clientsData?.clients) return;
    const c = clientsData.clients.find((c) => c.id === preloadClientId);
    if (c) selectClient(c);
  }, [preloadClientId, clientsData]);

  function selectClient(c: Client | null) {
    setSelectedClient(c);
    if (c) {
      setPolicyType(c.policyType ?? "");
      setCarrier(c.carrier ?? "");
      setPremium(c.premium ?? "");
      setRenewalDate(c.renewalDate ? c.renewalDate.split("T")[0] : "");
    } else {
      setPolicyType("");
      setCarrier("");
      setPremium("");
      setRenewalDate("");
    }
  }

  function changeScenario(s: ScenarioValue) {
    if (content && scenario !== s) {
      if (!confirm("Changing the scenario will clear your current letter. Continue?")) return;
      setContent("");
      setSubject("");
      setLetterId(null);
      setSaveStatus("idle");
    }
    setScenario(s);
    setYearsAsClient("");
    setRecentLifeChange("");
    setRateIncrease("");
    setRateReason("");
    setRateOption("staying");
    setEffectiveDate("");
    setWhatInsured("");
  }

  function canGenerate() {
    if (!selectedClient) return false;
    if (!policyType.trim()) return false;
    if (!renewalDate) return false;
    if (scenario === "rate_increase" && !rateIncrease) return false;
    return true;
  }

  async function generate() {
    if (!selectedClient || !canGenerate()) return;

    if (content) {
      const isTrialing = workspaceData?.subscription.status === "trialing";
      const trialWarning = isTrialing ? " This will use 1 of your remaining free letters and" : "";
      if (!confirm(`Regenerate?${trialWarning} This will replace your current letter.`)) return;
    }

    setGenerating(true);
    setContent("");
    setSubject("");
    setLetterId(null);
    setSaveStatus("idle");

    abortRef.current = new AbortController();

    const customInstructions = buildCustomInstructions();

    try {
      const response = await fetch(`${BASE_URL}/api/letters/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          clientId: selectedClient.id,
          scenario,
          customInstructions: customInstructions || undefined,
        }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? "Generation failed");
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.text) setContent((c) => c + data.text);
            if (data.done && data.letterId) {
              setLetterId(data.letterId);
              setSaveStatus("saved");
              // Invalidate relevant queries
              queryClient.invalidateQueries({ queryKey: ["clients"] });
            }
            if (data.error) throw new Error(data.error);
          } catch {
            // ignore parse errors in stream
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "Generation failed";
      toast.error(msg.includes("Trial limit") ? "Trial limit reached. Please upgrade to continue." : "Generation failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  function buildCustomInstructions() {
    const parts: string[] = [];
    if (scenario === "pre_renewal") {
      if (yearsAsClient) parts.push(`Years as client: ${yearsAsClient}`);
      if (recentLifeChange) parts.push(`Recent life change: ${recentLifeChange}`);
    }
    if (scenario === "rate_increase") {
      if (rateIncrease) parts.push(`Rate increase: ${rateIncrease}%`);
      if (rateReason) parts.push(`Reason: ${rateReason}`);
      parts.push(rateOption === "quote" ? "I have a competing quote to present." : "Staying with current carrier is the right move.");
    }
    if (scenario === "new_client_welcome") {
      if (effectiveDate) parts.push(`Policy effective date: ${effectiveDate}`);
      if (whatInsured) parts.push(`What was insured: ${whatInsured}`);
    }
    return parts.join("\n");
  }

  // Auto-save on content change
  const autoSave = useCallback(
    (newContent: string, newSubject: string) => {
      if (!letterId) return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaveStatus("unsaved");
      saveTimerRef.current = setTimeout(async () => {
        setSaveStatus("saving");
        try {
          await api.patch(`/letters/${letterId}`, { content: newContent, subject: newSubject });
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        }
      }, 2000);
    },
    [letterId]
  );

  function handleContentChange(v: string) {
    setContent(v);
    autoSave(v, subject);
  }

  function handleSubjectChange(v: string) {
    setSubject(v);
    autoSave(content, v);
  }

  async function handleSend() {
    if (!letterId || !selectedClient) return;
    setSending(true);
    try {
      await api.post(`/letters/${letterId}/send`, {
        method: "manual",
        toEmail: selectedClient.email ?? undefined,
      });
      setShowSendConfirm(false);
      toast.success(`Letter sent to ${selectedClient.firstName} ${selectedClient.lastName}. Logged to your E&O record.`);
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      queryClient.invalidateQueries({ queryKey: ["eo-log"] });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  }

  async function handleCopy() {
    if (!content) return;
    await navigator.clipboard.writeText(`${subject}\n\n${content}`);
    toast.success("Copied to clipboard");
  }

  async function handleSaveTemplate() {
    if (!content || !letterId) return;
    const name = prompt("Template name:", `${SCENARIOS.find((s) => s.value === scenario)?.label} Template`);
    if (!name) return;
    try {
      await api.post("/templates", { name, scenario, content });
      toast.success("Template saved");
    } catch {
      toast.error("Failed to save template");
    }
  }

  const workspace = workspaceData?.workspace;
  const signatureBlock = workspace?.signatureBlock ?? "";
  const disclaimer = workspace?.eoDisclaimer ?? DEFAULT_DISCLAIMER;
  const hasLetter = !!content;

  return (
    <div className="flex h-full pb-14 lg:pb-0">
      {/* ─── Left Panel ─── */}
      <div className="w-full lg:w-80 lg:min-w-80 lg:max-w-80 lg:border-r flex flex-col overflow-y-auto">
        <div className="flex-1 p-4 space-y-5">
          {/* Client selector */}
          <ClientSelector
            clients={clientsData?.clients ?? []}
            selected={selectedClient}
            onSelect={(c) => {
              if (hasLetter) {
                if (!confirm("Change client? Your current letter will be cleared.")) return;
                setContent("");
                setSubject("");
                setLetterId(null);
                setSaveStatus("idle");
              }
              selectClient(c);
            }}
          />

          {/* Scenario picker */}
          <div className="space-y-2">
            <Label>Scenario</Label>
            <div className="space-y-1">
              {SCENARIOS.map(({ value, label }) => (
                <label
                  key={value}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer text-sm transition-colors",
                    scenario === value
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "border border-transparent hover:bg-accent"
                  )}
                >
                  <input
                    type="radio"
                    name="scenario"
                    value={value}
                    checked={scenario === value}
                    onChange={() => changeScenario(value)}
                    className="accent-blue-600"
                  />
                  {label}
                </label>
              ))}
            </div>
            <Link
              href={`/templates?scenario=${scenario}`}
              className="text-xs text-blue-600 hover:underline"
            >
              Browse saved {SCENARIOS.find((s) => s.value === scenario)?.label} templates →
            </Link>
          </div>

          {/* Universal letter details */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Letter Details
            </Label>
            <div className="space-y-1">
              <Label htmlFor="policyType" className="text-sm">
                Policy Type <span className="text-destructive">*</span>
              </Label>
              <Input
                id="policyType"
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value)}
                placeholder="e.g. Home, Auto, Commercial"
                className={cn("h-8 text-sm", !policyType && "border-amber-400")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="renewalDate" className="text-sm">
                Renewal Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="renewalDate"
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                className={cn("h-8 text-sm", !renewalDate && "border-amber-400")}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="carrier" className="text-sm">Carrier</Label>
              <Input
                id="carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                placeholder="e.g. State Farm"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="premium" className="text-sm">Current Premium</Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input
                  id="premium"
                  value={premium}
                  onChange={(e) => setPremium(e.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="0.00"
                  className="h-8 text-sm pl-6"
                />
              </div>
            </div>
          </div>

          {/* Scenario-specific fields */}
          {scenario === "rate_increase" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="rateIncrease" className="text-sm">
                    Rate Increase Amount <span className="text-destructive">*</span>
                  </Label>
                </div>
                <div className="relative">
                  <Input
                    id="rateIncrease"
                    type="number"
                    value={rateIncrease}
                    onChange={(e) => setRateIncrease(e.target.value)}
                    placeholder="12"
                    className={cn("h-8 text-sm pr-6", !rateIncrease && "border-amber-400")}
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Label htmlFor="rateReason" className="text-sm">Rate Increase Reason</Label>
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                    💡 Strongly recommended
                  </span>
                </div>
                <textarea
                  id="rateReason"
                  value={rateReason}
                  onChange={(e) => setRateReason(e.target.value)}
                  placeholder="e.g. Auto liability losses in your state"
                  rows={2}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <p className="text-xs text-muted-foreground">
                  e.g. &quot;Auto liability losses in your state&quot; or &quot;Reinsurance market hardening.&quot;
                </p>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">
                  What have you found? <span className="text-destructive">*</span>
                </Label>
                {[
                  { value: "quote" as const, label: "I have a quote to present" },
                  { value: "staying" as const, label: "Staying with current carrier is right" },
                ].map(({ value, label }) => (
                  <label
                    key={value}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-2 cursor-pointer text-sm transition-colors border",
                      rateOption === value ? "bg-blue-50 text-blue-700 border-blue-200" : "border-transparent hover:bg-accent"
                    )}
                  >
                    <input
                      type="radio"
                      name="rateOption"
                      value={value}
                      checked={rateOption === value}
                      onChange={() => setRateOption(value)}
                      className="accent-blue-600"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Optional details (collapsible) */}
          {(scenario === "pre_renewal" || scenario === "new_client_welcome") && (
            <div>
              <button
                onClick={() => setOptionalOpen((v) => !v)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-full"
              >
                {optionalOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                Optional Details
              </button>
              {optionalOpen && (
                <div className="mt-3 space-y-3">
                  {scenario === "pre_renewal" && (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor="yearsAsClient" className="text-sm">Years as client</Label>
                        <Input
                          id="yearsAsClient"
                          type="number"
                          value={yearsAsClient}
                          onChange={(e) => setYearsAsClient(e.target.value)}
                          placeholder="e.g. 5"
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="recentLifeChange" className="text-sm">Recent life change</Label>
                        <Input
                          id="recentLifeChange"
                          value={recentLifeChange}
                          onChange={(e) => setRecentLifeChange(e.target.value)}
                          placeholder="e.g. New home purchase, added teenage driver"
                          className="h-8 text-sm"
                        />
                      </div>
                    </>
                  )}
                  {scenario === "new_client_welcome" && (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor="effectiveDate" className="text-sm">Policy effective date</Label>
                        <Input
                          id="effectiveDate"
                          type="date"
                          value={effectiveDate}
                          onChange={(e) => setEffectiveDate(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="whatInsured" className="text-sm">What they insured</Label>
                        <Input
                          id="whatInsured"
                          value={whatInsured}
                          onChange={(e) => setWhatInsured(e.target.value)}
                          placeholder="e.g. 3-bedroom home on Oak Street"
                          className="h-8 text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Generate button */}
        <div className="p-4 border-t bg-background">
          <button
            onClick={generate}
            disabled={!canGenerate() || generating}
            title={!canGenerate() ? "Fill in all required fields to generate" : undefined}
            className={cn(
              "w-full h-10 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-2",
              canGenerate() && !generating
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {generating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Generating…
              </>
            ) : (
              "Generate Letter"
            )}
          </button>
        </div>
      </div>

      {/* ─── Right Panel ─── */}
      <div className="hidden lg:flex flex-1 flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Subject line */}
          <div className="space-y-1">
            <Label htmlFor="subject" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Subject
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              placeholder="Subject line will appear after generation"
              className="text-sm"
            />
          </div>

          {/* Editor */}
          <div className="space-y-1 flex-1">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Letter
            </Label>
            <textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={generating ? "" : "Your letter will appear here after generation…"}
              className={cn(
                "w-full min-h-[300px] rounded-md border border-input bg-transparent px-3 py-2.5 text-sm resize-y",
                "focus:outline-none focus:ring-1 focus:ring-ring font-mono leading-relaxed",
                generating && "animate-pulse"
              )}
              readOnly={generating}
            />
          </div>

          {/* E&O disclaimer (locked) */}
          {hasLetter && (
            <div className="rounded-md bg-muted/60 border px-4 py-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                🔒 E&amp;O disclaimer — cannot be edited
              </p>
              <p className="text-xs text-muted-foreground italic">{disclaimer}</p>
            </div>
          )}

          {/* Signature block (locked) */}
          {hasLetter && signatureBlock && (
            <div className="rounded-md bg-muted/60 border px-4 py-3 space-y-1">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                🔒 Signature —{" "}
                <Link href="/settings/agency" className="underline hover:text-foreground">
                  edit in Settings
                </Link>
              </p>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-sans">
                {signatureBlock}
              </pre>
            </div>
          )}
        </div>

        {/* Status bar + action bar */}
        <div className="border-t">
          {/* Status */}
          {hasLetter && (
            <div className="flex justify-end px-4 py-1.5">
              <SaveStatus status={saveStatus} />
            </div>
          )}

          {/* Action bar */}
          <div className="flex items-center gap-2 px-4 py-3 flex-wrap">
            {/* Send */}
            {showSendConfirm ? (
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm text-foreground">
                  Send to{" "}
                  <strong>
                    {selectedClient?.firstName} {selectedClient?.lastName}
                  </strong>
                  {selectedClient?.email ? ` at ${selectedClient.email}` : ""}?
                </span>
                <button
                  onClick={() => setShowSendConfirm(false)}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <Button size="sm" onClick={handleSend} disabled={sending}>
                  {sending ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
                  Send Letter
                </Button>
              </div>
            ) : (
              <>
                <Button
                  size="sm"
                  disabled={!hasLetter || !selectedClient}
                  onClick={() => setShowSendConfirm(true)}
                  title={!selectedClient ? "Select a client first" : undefined}
                >
                  <Send size={13} className="mr-1.5" />
                  Send
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!hasLetter}
                  onClick={() => toast.info("PDF download coming soon.")}
                >
                  <FileDown size={13} className="mr-1.5" />
                  Download PDF
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!hasLetter}
                  onClick={handleCopy}
                >
                  <Copy size={13} className="mr-1.5" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!hasLetter}
                  onClick={handleSaveTemplate}
                >
                  <Bookmark size={13} className="mr-1.5" />
                  Save as Template
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile: show editor below left panel */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 top-0 mt-0 flex flex-col" />
    </div>
  );
}

// ─── Client Selector ──────────────────────────────────────────────────────────

function ClientSelector({
  clients,
  selected,
  onSelect,
}: {
  clients: Client[];
  selected: Client | null;
  onSelect: (c: Client | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-1" ref={ref}>
      <Label>Client</Label>

      {selected ? (
        <div className="flex items-center justify-between rounded-md border border-input px-3 py-2 text-sm bg-accent/40">
          <div>
            <p className="font-medium">
              {selected.firstName} {selected.lastName}
            </p>
            {selected.renewalDate && (
              <p className="text-xs text-muted-foreground">
                Renewal {format(parseISO(selected.renewalDate), "MMM d, yyyy")}
              </p>
            )}
          </div>
          <button
            onClick={() => onSelect(null)}
            className="text-xs text-blue-600 hover:underline ml-2"
          >
            Change
          </button>
        </div>
      ) : (
        <div className="relative">
          <div
            className="flex items-center gap-2 rounded-md border border-input px-3 py-2 cursor-pointer hover:bg-accent/40 transition-colors"
            onClick={() => setOpen(true)}
          >
            <Search size={13} className="text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
              placeholder="Search or select a client…"
              className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground"
              onFocus={() => setOpen(true)}
            />
          </div>

          {open && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-56 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-sm text-muted-foreground text-center">
                  {search ? "No clients found" : "No clients yet"}
                </div>
              ) : (
                filtered.slice(0, 20).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { onSelect(c); setSearch(""); setOpen(false); }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                  >
                    <span className="font-medium">{c.firstName} {c.lastName}</span>
                    {(c.policyType || c.renewalDate) && (
                      <span className="text-muted-foreground ml-2">
                        {[
                          c.policyType,
                          c.renewalDate ? `Renewal ${format(parseISO(c.renewalDate), "MMM d")}` : null,
                        ]
                          .filter(Boolean)
                          .join(" — ")}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Save Status ──────────────────────────────────────────────────────────────

function SaveStatus({ status }: { status: string }) {
  if (status === "idle") return null;

  return (
    <span className="flex items-center gap-1 text-xs">
      {status === "generating" && (
        <><Loader2 size={11} className="animate-spin text-blue-500" /><span className="text-blue-500">Generating…</span></>
      )}
      {status === "saving" && (
        <><Loader2 size={11} className="animate-spin text-muted-foreground" /><span className="text-muted-foreground">Saving…</span></>
      )}
      {status === "saved" && (
        <><CheckCircle size={11} className="text-green-500" /><span className="text-green-600">Saved ✓</span></>
      )}
      {status === "unsaved" && (
        <span className="text-muted-foreground">Unsaved changes</span>
      )}
      {status === "error" && (
        <><AlertCircle size={11} className="text-destructive" /><span className="text-destructive">Failed to save</span></>
      )}
    </span>
  );
}
