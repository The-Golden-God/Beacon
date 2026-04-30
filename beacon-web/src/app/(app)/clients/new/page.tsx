"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const POLICY_TYPES = ["auto", "home", "life", "health", "commercial", "umbrella", "other"];

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  policyType: string;
  carrier: string;
  premium: string;
  renewalDate: string;
  notes: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  policyType?: string;
  renewalDate?: string;
  email?: string;
  phone?: string;
  premium?: string;
}

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    firstName: "", lastName: "", email: "", phone: "",
    policyType: "", carrier: "", premium: "", renewalDate: "", notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
    };
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!form.policyType) e.policyType = "Required";
    if (!form.renewalDate) e.renewalDate = "Required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (form.phone && !/^[\d\s\-()+.]{7,15}$/.test(form.phone)) e.phone = "Invalid phone";
    if (form.premium && isNaN(parseFloat(form.premium))) e.premium = "Must be a number";
    return e;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setSaving(true);
    try {
      const result = await api.post<{ client: { id: string } }>("/clients", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        policyType: form.policyType,
        carrier: form.carrier.trim() || undefined,
        premium: form.premium || undefined,
        renewalDate: form.renewalDate || undefined,
        notes: form.notes.trim() || undefined,
      });
      toast.success("Client added.");
      router.push(`/clients/${result.client.id}`);
    } catch {
      toast.error("Failed to save client.");
    } finally {
      setSaving(false);
    }
  }

  const showContactNudge = !form.email && !form.phone;

  return (
    <div className="p-4 md:p-6 max-w-xl pb-14 lg:pb-6">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/clients" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
          ← Clients
        </Link>
        <span className="text-muted-foreground">/</span>
        <h1 className="text-base font-semibold">Add Client</h1>
      </div>

      <div className="space-y-6">
        {/* Contact info */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact Information</p>
            <div className="grid grid-cols-2 gap-3">
              <F id="firstName" label="First Name" required value={form.firstName} onChange={set("firstName")} error={errors.firstName} />
              <F id="lastName" label="Last Name" required value={form.lastName} onChange={set("lastName")} error={errors.lastName} />
            </div>
            <F id="email" label="Email" type="email" value={form.email} onChange={set("email")} error={errors.email} />
            <F id="phone" label="Phone" type="tel" value={form.phone} onChange={set("phone")} error={errors.phone} />
            {showContactNudge && (
              <p className="text-xs text-amber-600">Add at least one so you can send letters directly.</p>
            )}
          </CardContent>
        </Card>

        {/* Policy info */}
        <Card>
          <CardContent className="pt-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Policy Information</p>
            <div className="space-y-1">
              <Label htmlFor="policyType">Policy Type <span className="text-destructive">*</span></Label>
              <select
                id="policyType"
                value={form.policyType}
                onChange={set("policyType")}
                className={cn(
                  "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring",
                  errors.policyType ? "border-red-500" : "border-input"
                )}
              >
                <option value="">Select type…</option>
                {POLICY_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              {errors.policyType && <p className="text-xs text-destructive">{errors.policyType}</p>}
            </div>
            <F id="carrier" label="Carrier" placeholder="e.g. State Farm" value={form.carrier} onChange={set("carrier")} />
            <div className="space-y-1">
              <Label htmlFor="premium">Current Premium</Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input id="premium" value={form.premium} onChange={set("premium")} placeholder="0.00" className={cn("pl-6", errors.premium ? "border-red-500" : "")} />
              </div>
              {errors.premium && <p className="text-xs text-destructive">{errors.premium}</p>}
            </div>
            <div className="space-y-1">
              <Label htmlFor="renewalDate">Renewal Date <span className="text-destructive">*</span></Label>
              <Input id="renewalDate" type="date" value={form.renewalDate} onChange={set("renewalDate")} className={errors.renewalDate ? "border-red-500" : ""} />
              {errors.renewalDate && <p className="text-xs text-destructive">{errors.renewalDate}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="pt-4 space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              value={form.notes}
              onChange={set("notes")}
              placeholder="Agent notes (optional)…"
              rows={4}
              className="w-full rounded-md border border-input bg-transparent px-3 py-1.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </CardContent>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Client"}
          </Button>
          <Link href="/clients" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}

function F({
  id, label, required, helper, value, onChange, error, type = "text", placeholder,
}: {
  id: string; label: string; required?: boolean; helper?: string;
  value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string; type?: string; placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label} {required && <span className="text-destructive">*</span>}</Label>
      <Input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={error ? "border-red-500 focus-visible:ring-red-500" : ""} />
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
