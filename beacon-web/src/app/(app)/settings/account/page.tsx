"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export default function AccountSettingsPage() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE}/account/export`, { credentials: "include" });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `beacon-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported");
    } catch {
      toast.error("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    if (confirmation !== "DELETE") return;
    setDeleting(true);
    try {
      await api.delete("/account");
      toast.success("Account deleted.");
      router.push("/login");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Deletion failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="px-4 md:px-6 py-6 max-w-2xl space-y-8">
      <div>
        <h1 className="text-base font-semibold">Account</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Manage your data and account settings.</p>
      </div>

      {/* Data Export */}
      <section className="rounded-lg border bg-card p-5">
        <h2 className="text-sm font-semibold mb-1">Export Your Data</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Download a complete copy of your account data — clients, letters, templates, and E&amp;O log — as a JSON file.
        </p>
        <Button variant="outline" onClick={handleExport} disabled={exporting}>
          {exporting ? <Loader2 size={13} className="animate-spin mr-1.5" /> : <Download size={13} className="mr-1.5" />}
          Download Data Export
        </Button>
      </section>

      {/* Account Deletion */}
      <section className="rounded-lg border border-red-200 bg-red-50/30 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-red-800 mb-1">Delete Account</h2>
            <p className="text-sm text-red-700 mb-4">
              Permanently deletes your workspace, all clients, letters, and templates. Your E&amp;O log is anonymized and retained
              for 7 years per our privacy policy. This action cannot be undone.
            </p>
            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={13} className="mr-1.5" />
                Delete Account
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-red-800">
                    Type <span className="font-mono font-bold">DELETE</span> to confirm
                  </Label>
                  <Input
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                    placeholder="DELETE"
                    className="border-red-300 focus-visible:ring-red-400 max-w-xs"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleDelete()}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowDeleteConfirm(false); setConfirmation(""); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={confirmation !== "DELETE" || deleting}
                  >
                    {deleting ? <Loader2 size={13} className="animate-spin mr-1" /> : null}
                    Permanently Delete Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
