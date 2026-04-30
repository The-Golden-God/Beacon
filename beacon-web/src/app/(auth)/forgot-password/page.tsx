"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { requestPasswordReset } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address");
      return;
    }

    setLoading(true);
    setEmailError("");

    // Always call the API regardless — response is always the same to prevent enumeration
    await requestPasswordReset({
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    setSubmitted(true);
    setCooldown(60);

    const interval = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="space-y-1">
        <Link href="/login" className="flex items-center gap-1 text-sm text-blue-600 hover:underline mb-1">
          <ArrowLeft size={14} /> Back to Log In
        </Link>
        <CardTitle className="text-xl">Reset your password</CardTitle>
        <CardDescription>Enter your email and we'll send a reset link.</CardDescription>
      </CardHeader>

      <CardContent>
        {submitted ? (
          <div className="rounded-md bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-700 space-y-1">
            <p>If an account exists for that email, a reset link is on its way.</p>
            <p className="text-slate-500">Check your spam folder if you don't see it.</p>
            {cooldown > 0 && (
              <p className="text-xs text-slate-400 mt-2">You can request another link in {cooldown}s.</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={emailError ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {emailError && <p className="text-xs text-red-600">{emailError}</p>}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending…" : "Send Reset Link"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
