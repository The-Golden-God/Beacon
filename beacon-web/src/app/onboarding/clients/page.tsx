"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { OnboardingProgress } from "@/components/onboarding-progress";

type ImportStage = "idle" | "mapping" | "importing" | "done" | "error";

interface CsvRow {
  [key: string]: string;
}

const FIELD_MAP: Record<string, string[]> = {
  firstName: ["first_name", "firstname", "first name", "fname"],
  lastName: ["last_name", "lastname", "last name", "lname"],
  email: ["email", "email address"],
  phone: ["phone", "phone number", "telephone"],
  carrier: ["carrier", "insurance company", "company"],
  premium: ["premium", "annual premium", "price"],
  renewalDate: ["renewal_date", "renewal date", "renew date", "expiration date", "expiration", "expires"],
};

function autoMap(headers: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [field, aliases] of Object.entries(FIELD_MAP)) {
    const match = headers.find((h) =>
      aliases.includes(h.toLowerCase().trim())
    );
    if (match) result[field] = match;
  }
  return result;
}

function parseCsv(text: string): { headers: string[]; rows: CsvRow[] } {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
  });
  return { headers, rows };
}

export default function OnboardingClientsPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [showImport, setShowImport] = useState(false);
  const [stage, setStage] = useState<ImportStage>("idle");
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [parsedRows, setParsedRows] = useState<CsvRow[]>([]);
  const [importResult, setImportResult] = useState<{ imported: number } | null>(null);
  const [completing, setCompleting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { headers: h, rows } = parseCsv(ev.target?.result as string);
      if (!h.length) {
        toast.error("Couldn't read the CSV. Please check the file format.");
        return;
      }
      setHeaders(h);
      setParsedRows(rows);
      setMapping(autoMap(h));
      setStage("mapping");
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    setStage("importing");
    try {
      const rows = parsedRows.map((row) => {
        const mapped: Record<string, string> = {};
        for (const [field, header] of Object.entries(mapping)) {
          if (header && row[header]) mapped[field] = row[header];
        }
        return mapped;
      });

      const result = await api.post<{ imported: number }>("/clients/import", { rows });
      setImportResult(result);
      setStage("done");
    } catch {
      setStage("error");
    }
  }

  async function completeOnboarding() {
    setCompleting(true);
    try {
      await api.patch("/me", { onboardingComplete: true });
      router.push("/dashboard");
    } catch {
      toast.error("Something went wrong. Please try again.");
      setCompleting(false);
    }
  }

  if (!showImport) {
    return (
      <>
        <OnboardingProgress step={4} />
        <Card className="shadow-md mt-4">
          <CardHeader>
            <CardTitle>Import your client list</CardTitle>
            <CardDescription>
              Upload a CSV to see your renewal calendar. You can always do this later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={() => setShowImport(true)} className="w-full">
              <Upload size={14} className="mr-2" />
              Import from CSV
            </Button>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex-1 border-t" />
              <span>or</span>
              <div className="flex-1 border-t" />
            </div>
            <Button variant="outline" onClick={completeOnboarding} disabled={completing} className="w-full">
              {completing ? "Setting up…" : "Go to Dashboard — I'll import later"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/onboarding/logo")}
              className="w-full text-muted-foreground"
            >
              ← Back
            </Button>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <OnboardingProgress step={4} />
      <Card className="shadow-md mt-4">
        <CardHeader>
          <CardTitle>Import from CSV</CardTitle>
          <CardDescription>
            {stage === "idle" && "Select a CSV file to upload."}
            {stage === "mapping" && `${parsedRows.length} rows found. Map your columns below.`}
            {stage === "importing" && "Importing…"}
            {stage === "done" && `${importResult?.imported} clients imported successfully.`}
            {stage === "error" && "Import failed. Please try again."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {stage === "idle" && (
            <>
              <div
                onClick={() => inputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-input p-8 cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-colors"
              >
                <Upload size={24} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to select a CSV file
                </p>
              </div>
              <input ref={inputRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
              <Button
                variant="ghost"
                onClick={() => setShowImport(false)}
                className="w-full text-muted-foreground"
              >
                ← Back to Import Options
              </Button>
            </>
          )}

          {stage === "mapping" && (
            <>
              <div className="space-y-2">
                {Object.entries(FIELD_MAP).map(([field, _]) => (
                  <div key={field} className="flex items-center gap-2 text-sm">
                    <span className="w-32 text-muted-foreground capitalize">
                      {field.replace(/([A-Z])/g, " $1").trim()}
                      {(field === "firstName" || field === "lastName") && (
                        <span className="text-destructive ml-0.5">*</span>
                      )}
                    </span>
                    <select
                      value={mapping[field] ?? ""}
                      onChange={(e) => setMapping((m) => ({ ...m, [field]: e.target.value }))}
                      className="flex-1 h-8 rounded-md border border-input bg-transparent px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">— skip —</option>
                      {headers.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {parsedRows.length} rows ready · First Name and Last Name are required
              </p>
              <Button
                onClick={handleImport}
                disabled={!mapping.firstName || !mapping.lastName}
                className="w-full"
              >
                Import {parsedRows.length} Clients
              </Button>
              <Button
                variant="ghost"
                onClick={() => { setStage("idle"); setParsedRows([]); setHeaders([]); }}
                className="w-full text-muted-foreground"
              >
                ← Back
              </Button>
            </>
          )}

          {stage === "importing" && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          )}

          {stage === "done" && (
            <>
              <div className="flex flex-col items-center gap-3 py-4">
                <CheckCircle size={40} className="text-green-500" />
                <p className="text-sm font-medium">
                  {importResult?.imported} clients imported!
                </p>
              </div>
              <Button onClick={completeOnboarding} disabled={completing} className="w-full">
                {completing ? "Setting up…" : "Go to My Renewal Calendar →"}
              </Button>
            </>
          )}

          {stage === "error" && (
            <>
              <div className="flex flex-col items-center gap-3 py-4">
                <AlertCircle size={40} className="text-destructive" />
                <p className="text-sm text-destructive">Import failed. Please try again.</p>
              </div>
              <Button onClick={() => setStage("mapping")} className="w-full">
                Retry
              </Button>
              <Button
                variant="outline"
                onClick={completeOnboarding}
                disabled={completing}
                className="w-full"
              >
                Skip — I&apos;ll import later
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
