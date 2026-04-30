"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { OnboardingProgress } from "@/components/onboarding-progress";

const TONES = [
  {
    value: "formal",
    label: "Formal",
    description: "Professional and precise. Best for commercial clients.",
  },
  {
    value: "inbetween",
    label: "In Between",
    description: "Warm but professional. Works for most agents.",
    default: true,
  },
  {
    value: "conversational",
    label: "Conversational",
    description: "Friendly and personal. Best for long-term personal clients.",
  },
] as const;

const TONE_DESCRIPTIONS: Record<string, string> = {
  formal: "Professional and precise tone.",
  inbetween: "Warm but professional tone.",
  conversational: "Friendly and personal tone.",
};

export default function OnboardingStylePage() {
  const router = useRouter();
  const [tone, setTone] = useState<"formal" | "inbetween" | "conversational">("inbetween");
  const [signoff, setSignoff] = useState("Best,");
  const [signoffError, setSignoffError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!signoff.trim()) {
      setSignoffError("Please enter a sign-off phrase");
      return;
    }
    setSignoffError("");
    setLoading(true);

    try {
      const step1 = JSON.parse(sessionStorage.getItem("onboarding_step1") ?? "{}");
      const { agentName = "", agencyName = "", state = "", phone = "", workEmail = "" } = step1;

      const signatureBlock = [
        signoff.trim(),
        "",
        agentName,
        agencyName,
        [state, phone, workEmail].filter(Boolean).join(" | "),
      ]
        .filter((l, i) => i < 2 || l)
        .join("\n")
        .trimEnd();

      const agencyVoice = `${TONE_DESCRIPTIONS[tone]} Sign-off: "${signoff.trim()}"`;

      await api.patch("/workspace", { signatureBlock, agencyVoice });

      router.push("/onboarding/logo");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <OnboardingProgress step={2} />

      <Card className="shadow-md mt-4">
        <CardHeader>
          <CardTitle>How do you write to clients?</CardTitle>
          <CardDescription>Beacon will match your tone in every letter.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Your Communication Tone <span className="text-destructive">*</span></Label>
            <div className="space-y-2">
              {TONES.map(({ value, label, description }) => (
                <label
                  key={value}
                  className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-accent transition-colors"
                >
                  <input
                    type="radio"
                    name="tone"
                    value={value}
                    checked={tone === value}
                    onChange={() => setTone(value)}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="signoff">
              How do you sign off? <span className="text-destructive">*</span>
            </Label>
            <Input
              id="signoff"
              value={signoff}
              onChange={(e) => setSignoff(e.target.value)}
              placeholder="e.g. Best regards,"
              className={signoffError ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            <p className="text-xs text-muted-foreground">
              e.g. &quot;Best regards,&quot; &quot;Warmly,&quot; &quot;Thank you,&quot;
            </p>
            {signoffError && <p className="text-xs text-destructive">{signoffError}</p>}
          </div>

          <div className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            Preview: Your letters will begin with a warm greeting and end with &quot;
            {signoff || "…"} [Agent Name]&quot;
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleContinue} disabled={loading} className="w-full">
              {loading ? "Saving…" : "Continue →"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.push("/onboarding/agency")}
              className="w-full text-muted-foreground"
            >
              ← Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
