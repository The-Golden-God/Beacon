"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

interface Workspace {
  id: string;
  name: string;
  agentName?: string | null;
  state?: string | null;
  phone?: string | null;
  workEmail?: string | null;
  logoUrl?: string | null;
}

export default function AgencySettingsPage() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ name: "", agentName: "", state: "", phone: "", workEmail: "" });
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const { data } = useQuery({
    queryKey: ["workspace"],
    queryFn: () => api.get<{ workspace: Workspace }>("/workspace"),
  });

  useEffect(() => {
    if (data?.workspace && !initialized) {
      const w = data.workspace;
      setForm({
        name: w.name ?? "",
        agentName: w.agentName ?? "",
        state: w.state ?? "",
        phone: w.phone ?? "",
        workEmail: w.workEmail ?? "",
      });
      setLogoPreview(w.logoUrl ?? null);
      setInitialized(true);
    }
  }, [data, initialized]);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave() {
    if (!form.name.trim() || !form.agentName.trim()) {
      toast.error("Agency name and agent name are required.");
      return;
    }
    setSaving(true);
    try {
      await api.patch("/workspace", {
        name: form.name.trim(),
        agentName: form.agentName.trim(),
        state: form.state || null,
        phone: form.phone.trim() || null,
        workEmail: form.workEmail.trim() || null,
      });
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
      toast.success("Agency profile saved.");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  function handleLogoFile(file: File) {
    if (file.size > 2 * 1024 * 1024) { toast.error("Logo must be under 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      setLogoPreview(dataUrl);
      setUploadingLogo(true);
      try {
        await api.patch("/workspace", { logoUrl: dataUrl });
        queryClient.invalidateQueries({ queryKey: ["workspace"] });
        toast.success("Logo updated.");
      } catch {
        toast.error("Failed to upload logo.");
        setLogoPreview(data?.workspace?.logoUrl ?? null);
      } finally {
        setUploadingLogo(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="p-4 md:p-6 max-w-xl">
      <h2 className="text-base font-semibold mb-5">Agency Profile</h2>

      <div className="space-y-6">
        {/* Logo */}
        <Card>
          <CardContent className="pt-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Logo</p>
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors",
                logoPreview ? "border-border" : "border-border"
              )}
                onClick={() => fileRef.current?.click()}
              >
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <Upload size={20} className="text-muted-foreground" />
                )}
              </div>
              <div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingLogo}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {uploadingLogo ? "Uploading…" : logoPreview ? "Change logo" : "Upload logo"}
                </button>
                <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, or SVG · max 2 MB</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept=".png,.jpg,.jpeg,.svg"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleLogoFile(e.target.files[0]); }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Identity */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Identity</p>
            <div className="space-y-1">
              <Label htmlFor="name">Agency Name <span className="text-destructive">*</span></Label>
              <Input id="name" value={form.name} onChange={set("name")} placeholder="ABC Insurance Agency" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="agentName">Agent Name <span className="text-destructive">*</span></Label>
              <Input id="agentName" value={form.agentName} onChange={set("agentName")} placeholder="Jane Smith" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="state">State</Label>
              <select
                id="state"
                value={form.state}
                onChange={set("state")}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Select state…</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
            <div className="space-y-1">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" value={form.phone} onChange={set("phone")} placeholder="(555) 123-4567" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="workEmail">Work Email</Label>
              <Input id="workEmail" type="email" value={form.workEmail} onChange={set("workEmail")} placeholder="jane@abcinsurance.com" />
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
