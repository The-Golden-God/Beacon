"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BeaconLogo } from "@/components/beacon-logo";
import { Toaster } from "@/components/ui/sonner";
import { useSession, signUp } from "@/lib/auth-client";
import { api } from "@/lib/api";

interface InviteData {
  token: string;
  email: string;
  workspaceName: string;
  expired: boolean;
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { data: session } = useSession();

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    api.get<InviteData>(`/team/invite/${token}/info`)
      .then(setInvite)
      .catch(() => setInvite({ token, email: "", workspaceName: "", expired: true }))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleNewUser(e: React.FormEvent) {
    e.preventDefault();
    if (!password || password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    const result = await signUp.email({
      email: invite!.email,
      password,
      name: invite!.email.split("@")[0],
    });

    if (result.error) {
      setPasswordError(result.error.message ?? "Something went wrong");
      setSubmitting(false);
      return;
    }

    await api.post(`/team/invite/${token}/accept`);
    setSubmitting(false);
    router.push("/onboarding/agency");
  }

  async function handleExistingUser() {
    setJoining(true);
    await api.post(`/team/invite/${token}/accept`);
    setJoining(false);
    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading invitation…</div>
      </div>
    );
  }

  const isExpired = invite?.expired || !invite;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8"><BeaconLogo size="lg" /></div>

      <div className="w-full max-w-[400px]">
        {isExpired ? (
          <Card className="shadow-md text-center">
            <CardHeader>
              <CardTitle className="text-xl">This invitation has expired</CardTitle>
              <CardDescription>Ask your agency owner to send a new invitation.</CardDescription>
            </CardHeader>
          </Card>
        ) : session?.user ? (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Join {invite!.workspaceName}</CardTitle>
              <CardDescription>
                You're signed in as {session.user.email}. Click below to join.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleExistingUser} disabled={joining} className="w-full">
                {joining ? "Joining…" : `Join ${invite!.workspaceName}`}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">You're invited to join {invite!.workspaceName}</CardTitle>
              <CardDescription>Create your account to accept the invitation.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNewUser} noValidate className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={invite!.email}
                    readOnly
                    className="bg-slate-50 text-slate-500"
                  />
                  <p className="text-xs text-slate-400">Invitation is tied to this email</p>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={passwordError ? "border-red-500 focus-visible:ring-red-500 pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {passwordError
                    ? <p className="text-xs text-red-600">{passwordError}</p>
                    : <p className="text-xs text-slate-500">At least 8 characters</p>
                  }
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Creating account…" : `Create Account & Join ${invite!.workspaceName}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
