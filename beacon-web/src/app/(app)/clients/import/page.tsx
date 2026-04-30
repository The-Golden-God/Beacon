"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Stage = "upload" | "map" | "preview" | "done";

const FIELDS = [
  { key: "firstName", label: "First Name", required: true },
  { key: "lastName", label: "Last Name", required: true },
  { key: "email", label: "Email", required: false },
  { key: "phone", label: "Phone", required: false },
  { key: "policyType", label: "Policy Type", required: false },
  { key: "carrier", label: "Carrier", required: false },
  { key: "premium", label: "Premium", required: false },
  { key: "renewalDate", label: "Renewal Date", required: false },
];

const ALIASES: Record<string, string> = {
  "first name": "firstName", "first": "firstName", "firstname": "firstName",
  "last name": "lastName", "last": "lastName", "lastname": "lastName",
  "email": "email", "email address": "email",
  "phone": "phone", "phone number": "phone", "mobile": "phone", "cell": "phone",
  "policy type": "policyType", "policytype": "policyType", "policy": "policyType", "type": "policyType",
  "carrier": "carrier", "insurance company": "carrier", "company": "carrier",
  "premium": "premium", "annual premium": "premium", "premium amount": "premium",
  "renewal date": "renewalDate", "renewaldate": "renewalDate", "renewal": "renewalDate", "expiration": "renewalDate", "expiry": "renewalDate",
};

function parseCsv(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return { headers: [], rows: [] };
  const parse = (line: string) => {
    const cols: string[] = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    cols.push(cur.trim());
    return cols;
  };
  return { headers: parse(lines[0]), rows: lines.slice(1).filter(Boolean).map(parse) };
}

function autoMap(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  for (const h of headers) {
    const norm = h.toLowerCase().trim();
    const match = ALIASES[norm];
    if (match) mapping[h] = match;
  }
  return mapping;
}

export default function ImportPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("upload");
  const [dragging, setDragging] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);

  function handleFile(file: File) {
    if (!file.name.endsWith(".csv")) { toast.error("Please upload a CSV file."); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers: h, rows: r } = parseCsv(text);
      if (h.length === 0) { toast.error("Could not parse CSV headers."); return; }
      setHeaders(h);
      setRows(r);
      setMapping(autoMap(h));
      setStage("map");
    };
    reader.readAsText(file);
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  function buildPreview() {
    return rows.slice(0, 5).map((row) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        if (mapping[h]) obj[mapping[h]] = row[i] ?? "";
      });
      return obj;
    });
  }

  async function handleImport() {
    setImporting(true);
    try {
      const clients = rows.map((row) => {
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          if (mapping[h]) obj[mapping[h]] = row[i] ?? "";
        });
        return obj;
      }).filter((c) => c.firstName || c.lastName);

      const res = await api.post<{ imported: number; skipped: number }>("/clients/import", { clients });
      setResult(res);
      setStage("done");
    } catch {
      toast.error("Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  }

  const mappedRequiredFields = FIELDS.filter((f) => f.required).every((f) =>
    Object.values(mapping).includes(f.key)
  );

  return (
    <div className="p-4 md:p-6 max-w-2xl pb-14 lg:pb-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/clients" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Clients
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-base font-semibold">Import CSV</h1>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {(["upload", "map", "preview", "done"] as Stage[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className={cn("h-px w-8 flex-shrink-0", stage === "upload" || (stage === "map" && i > 1) || (stage === "preview" && i > 2) ? "bg-border" : "bg-primary")} />}
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
              s === stage ? "bg-primary text-primary-foreground" : i < (["upload","map","preview","done"].indexOf(stage)) ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {i + 1}
            </div>
            <span className={cn("text-xs hidden sm:block", s === stage ? "text-foreground font-medium" : "text-muted-foreground")}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Stage: Upload */}
      {stage === "upload" && (
        <div
          className={cn(
            "border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium mb-1">Drop your CSV here or click to browse</p>
          <p className="text-sm text-muted-foreground">Expected columns: First Name, Last Name, Email, Phone, Policy Type, Carrier, Premium, Renewal Date</p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
          />
        </div>
      )}

      {/* Stage: Map */}
      {stage === "map" && (
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Found <strong>{headers.length}</strong> columns and <strong>{rows.length}</strong> rows. Map your CSV columns to client fields.
            </p>
          </div>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">CSV Column</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Maps to Field</th>
                </tr>
              </thead>
              <tbody>
                {headers.map((h) => (
                  <tr key={h} className="border-b last:border-0">
                    <td className="px-4 py-2 font-mono text-xs">{h}</td>
                    <td className="px-4 py-2">
                      <select
                        value={mapping[h] ?? ""}
                        onChange={(e) => setMapping((m) => ({ ...m, [h]: e.target.value }))}
                        className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring w-full"
                      >
                        <option value="">— skip —</option>
                        {FIELDS.map((f) => (
                          <option key={f.key} value={f.key}>
                            {f.label}{f.required ? " *" : ""}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!mappedRequiredFields && (
            <p className="text-xs text-amber-600">Map at least First Name and Last Name to continue.</p>
          )}
          <div className="flex gap-3">
            <Button onClick={() => setStage("preview")} disabled={!mappedRequiredFields}>
              Preview Import
            </Button>
            <button onClick={() => setStage("upload")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back
            </button>
          </div>
        </div>
      )}

      {/* Stage: Preview */}
      {stage === "preview" && (
        <div className="space-y-6">
          <p className="text-sm text-muted-foreground">
            Importing <strong>{rows.length}</strong> client{rows.length === 1 ? "" : "s"}. Here&apos;s a preview of the first few rows.
          </p>
          <div className="rounded-lg border overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  {FIELDS.filter((f) => Object.values(mapping).includes(f.key)).map((f) => (
                    <th key={f.key} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {buildPreview().map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    {FIELDS.filter((f) => Object.values(mapping).includes(f.key)).map((f) => (
                      <td key={f.key} className="px-3 py-2 text-muted-foreground">{row[f.key] || "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 5 && (
            <p className="text-xs text-muted-foreground">…and {rows.length - 5} more rows</p>
          )}
          <div className="flex gap-3">
            <Button onClick={handleImport} disabled={importing}>
              {importing ? "Importing…" : `Import ${rows.length} Client${rows.length === 1 ? "" : "s"}`}
            </Button>
            <button onClick={() => setStage("map")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Back
            </button>
          </div>
        </div>
      )}

      {/* Stage: Done */}
      {stage === "done" && result && (
        <div className="text-center py-12 space-y-4">
          <CheckCircle size={48} className="mx-auto text-green-500" />
          <div>
            <h2 className="text-lg font-semibold">Import Complete</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {result.imported} client{result.imported === 1 ? "" : "s"} imported
              {result.skipped > 0 && `, ${result.skipped} skipped`}.
            </p>
          </div>
          {result.skipped > 0 && (
            <div className="inline-flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
              <AlertCircle size={13} />
              Skipped rows were missing required fields or were duplicates.
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push("/clients")}>View Clients</Button>
            <button
              onClick={() => { setStage("upload"); setHeaders([]); setRows([]); setMapping({}); setResult(null); }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Import Another File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
