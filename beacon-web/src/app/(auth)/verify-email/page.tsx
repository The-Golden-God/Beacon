"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { sendVerificationEmail } from "@/lib/auth-client";

export default function VerifyEmailPage() {
  const [email] = useState(() =>
    typeof window === "undefined"
      ? ""
      : sessionStorage.getItem("pendingVerifyEmail") ?? ""
  );
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleResend() {
    if (!email || cooldown > 0) return;
    setLoading(true);
    await sendVerificationEmail({ email });
    setLoading(false);
    setSent(true);
    setCooldown(60);
  }

  return (
    <Card className="shadow-md text-center">
      <CardHeader className="items-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
          <Mail className="text-blue-600" size={24} />
        </div>
        <CardTitle className="text-xl">Check your inbox</CardTitle>
        <CardDescription>
          We sent a verification link to{" "}
          <span className="font-medium text-slate-700">{email || "your email"}</span>.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-slate-500">
          Didn't get it? Check your spam folder, or:
        </p>

        <Button
          variant="outline"
          onClick={handleResend}
          disabled={loading || cooldown > 0}
          className="w-full"
        >
          {loading
            ? "Sending…"
            : sent && cooldown > 0
            ? `Resend in ${cooldown}s…`
            : sent
            ? "Sent! Check your inbox."
            : "Resend Verification Email"
          }
        </Button>

        <Link href="/signup" className="block text-sm text-blue-600 hover:underline">
          Use a different email
        </Link>
      </CardContent>
    </Card>
  );
}
