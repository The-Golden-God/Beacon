"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2, Plus, X, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Template {
  id: string;
  name: string;
  scenario: string;
  content: string;
  usageCount: number;
  createdAt: string;
}

const SCENARIOS = [
  { value: "pre_renewal", label: "Pre-Renewal Outreach" },
  { value: "rate_increase", label: "Rate Increase Explanation" },
  { value: "new_client_welcome", label: "New Client Welcome" },
  { value: "claims_checkin", label: "Claims Check-In" },
  { value: "coverage_gap", label: "Coverage Gap Notice" },
  { value: "annual_review", label: "Annual Review Invitation" },
];

function scenarioLabel(s: string) {
  return SCENARIOS.find((x) => x.value === s)?.label ?? s.replace(/_/g, " ");
}

// ── Edit/Create dialog ────────────────────────────────────────────────────────

interface DialogProps {
  template?: Template;
  onClose: () => void;
  onSaved: () => void;
}

function TemplateDialog({ template, onClose, onSaved }: DialogProps) {
  const [name, setName] = useState(template?.name ?? "");
  const [scenario, setScenario] = useState(template?.scenario ?? "pre_renewal");
  const [content, setContent] = useState(template?.content ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || !content.trim()) {
      toast.error("Name and content are required");
      return;
    }
    setSaving(true);
    try {
      if (template) {
        await api.patch(`/templates/${template.id}`, { name, content });
      } else {
        await api.post("/templates", { name, scenario, content });
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-base font-semibold">{template ? "Edit Template" : "New Template"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto px-5 py-4 space-y-4">
          <div className="space-y-1">
            <Label>Template Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Friendly Pre-Renewal"
            />
          </div>

          {!template && (
            <div className="space-y-1">
              <Label>Scenario</Label>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {SCENARIOS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1">
            <Label>Letter Content</Label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={14}
              placeholder="Write your template letter content here…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring resize-y"
            />
            <p className="text-xs text-muted-foreground">
              Use placeholders like [client name], [renewal date], [policy type] where client-specific details belong.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-5 py-3 border-t">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 size={13} className="animate-spin mr-1" /> : null}
            {template ? "Save Changes" : "Create Template"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function TemplatesSettingsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Template | null | "new">(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => api.get<{ templates: Template[] }>("/templates"),
  });

  const templates = data?.templates ?? [];

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await api.delete(`/templates/${id}`);
      toast.success("Template deleted");
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(null);
    }
  }

  function onSaved() {
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    setEditing(null);
    toast.success("Template saved");
  }

  return (
    <div className="px-4 md:px-6 py-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-semibold">Letter Templates</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reusable starting points for common letter scenarios.
          </p>
        </div>
        <Button size="sm" onClick={() => setEditing("new")}>
          <Plus size={13} className="mr-1" />
          New Template
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border border-dashed px-6 py-12 text-center">
          <FileText size={28} className="mx-auto text-muted-foreground mb-3" />
          <p className="font-medium text-sm">No templates yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Save generated letters as templates for quick reuse, or create one from scratch.
          </p>
          <Button size="sm" variant="outline" className="mt-4" onClick={() => setEditing("new")}>
            <Plus size={13} className="mr-1" /> Create your first template
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => (
            <div key={t.id} className="rounded-lg border bg-card px-4 py-3 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{t.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground">{scenarioLabel(t.scenario)}</span>
                  {t.usageCount > 0 && (
                    <span className="text-xs text-muted-foreground">· Used {t.usageCount}×</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 font-mono">
                  {t.content.slice(0, 120)}{t.content.length > 120 ? "…" : ""}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setEditing(t)}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deleting === t.id}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                >
                  {deleting === t.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <TemplateDialog
          template={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
