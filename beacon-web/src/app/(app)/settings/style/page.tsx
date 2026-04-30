"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const TONES = [
  { value: "formal", label: "Formal", description: "Professional and reserved. Best for traditional or high-net-worth clients." },
  { value: "inbetween", label: "Balanced", description: "Warm yet professional. Works well for most clients." },
  { value: "conversational", label: "Conversational", description: "Friendly and approachable. Great for long-term relationships." },
];

interface Workspace {
  agencyVoice?: string | null;
  signoff?: string | null;
}

export default function StyleSettingsPage() {
  const queryClient = useQueryClient();
  const [tone, setTone] = useState("inbetween");
  const [signoff, setSignoff] = useState("Warm regards");
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const { data } = useQuery({
    queryKey: ["workspace"],
    queryFn: () => api.get<{ workspace: Workspace }>("/workspace"),
  });

  useEffect(() => {
    if (data?.workspace && !initialized) {
      setTone(data.workspace.agencyVoice ?? "inbetween");
      setSignoff(data.workspace.signoff ?? "Warm regards");
      setInitialized(true);
    }
  }, [data, initialized]);

  async function handleSave() {
    setSaving(true);
    try {
      await api.patch("/workspace", { agencyVoice: tone, signoff: signoff.trim() || "Warm regards" });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast.success("Communication style saved.");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-xl">
      <h2 className="text-base font-semibold mb-5">Communication Style</h2>

      <div className="space-y-6">
        <Card>
          <CardContent className="pt-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tone</p>
            <div className="space-y-2">
              {TONES.map((t) => (
                <label
                  key={t.value}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                    tone === t.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  )}
                >
                  <input
                    type="radio"
                    name="tone"
                    value={t.value}
                    checked={tone === t.value}
                    onChange={() => setTone(t.value)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium">{t.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sign-off Phrase</p>
            <div className="space-y-1">
              <Label htmlFor="signoff">Used at the end of every letter</Label>
              <Input
                id="signoff"
                value={signoff}
                onChange={(e) => setSignoff(e.target.value)}
                placeholder="e.g. Warm regards, Best,"
              />
            </div>
            <div className="rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
              Preview: <span className="text-foreground italic">&ldquo;{signoff || "Warm regards"},&rdquo;</span>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
