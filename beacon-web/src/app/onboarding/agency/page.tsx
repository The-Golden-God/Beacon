"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { OnboardingProgress } from "@/components/onboarding-progress";

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

interface FormErrors {
  agencyName?: string;
  agentName?: string;
  state?: string;
  phone?: string;
  workEmail?: string;
}

export default function OnboardingAgencyPage() {
  const router = useRouter();
  const [agencyName, setAgencyName] = useState("");
  const [agentName, setAgentName] = useState("");
  const [state, setState] = useState("");
  const [phone, setPhone] = useState("");
  const [workEmail, setWorkEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!agencyName.trim()) errs.agencyName = "Agency name is required";
    if (!agentName.trim()) errs.agentName = "Agent name is required";
    if (!state) errs.state = "Please select a state";
    if (phone && !/^[\d\s\-()+.]{7,15}$/.test(phone.trim())) {
      errs.phone = "Enter a valid phone number";
    }
    if (!workEmail.trim()) {
      errs.workEmail = "Work email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail.trim())) {
      errs.workEmail = "Enter a valid email address";
    }
    return errs;
  }

  async function handleContinue() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      await api.post("/workspace/setup", { agencyName: agencyName.trim() });

      // Build and save the contact signature block
      const parts = [state, phone.trim(), workEmail.trim()].filter(Boolean);
      const signatureBlock = [agentName.trim(), agencyName.trim(), parts.join(" | ")]
        .filter(Boolean)
        .join("\n");

      await api.patch("/workspace", { signatureBlock });

      // Persist step 1 data for step 2's preview
      sessionStorage.setItem(
        "onboarding_step1",
        JSON.stringify({ agencyName: agencyName.trim(), agentName: agentName.trim(), state, phone: phone.trim(), workEmail: workEmail.trim() })
      );

      router.push("/onboarding/style");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <OnboardingProgress step={1} />

      <Card className="shadow-md mt-4">
        <CardHeader>
          <CardTitle>Tell us about your agency</CardTitle>
          <CardDescription>
            This information appears in your letter signature.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field
            id="agencyName"
            label="Agency Name"
            required
            value={agencyName}
            onChange={setAgencyName}
            error={errors.agencyName}
          />
          <Field
            id="agentName"
            label="Agent Name"
            required
            value={agentName}
            onChange={setAgentName}
            error={errors.agentName}
          />

          <div className="space-y-1">
            <Label htmlFor="state">
              State <span className="text-destructive">*</span>
            </Label>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className={cn(
                "flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors",
                "focus:outline-none focus:ring-1 focus:ring-ring",
                errors.state ? "border-red-500 focus:ring-red-500" : "border-input"
              )}
            >
              <option value="">Select a state…</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.state && <p className="text-xs text-destructive">{errors.state}</p>}
          </div>

          <Field
            id="phone"
            label="Phone"
            helper="Optional — shown in your signature"
            value={phone}
            onChange={setPhone}
            error={errors.phone}
            type="tel"
          />
          <Field
            id="workEmail"
            label="Work Email"
            required
            helper="Used for your signature, not for login"
            value={workEmail}
            onChange={setWorkEmail}
            error={errors.workEmail}
            type="email"
          />

          <Button onClick={handleContinue} disabled={loading} className="w-full mt-2">
            {loading ? "Saving…" : "Continue →"}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}

function Field({
  id,
  label,
  required,
  helper,
  value,
  onChange,
  error,
  type = "text",
}: {
  id: string;
  label: string;
  required?: boolean;
  helper?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
      />
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

