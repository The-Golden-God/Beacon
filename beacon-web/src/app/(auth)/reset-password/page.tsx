"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPassword } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [loading, setLoading] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(() => !token);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!password || password.length < 8) errs.password = "Password must be at least 8 characters";
    if (password !== confirm) errs.confirm = "Passwords don't match";
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setErrors({});

    const result = await resetPassword({ newPassword: password, token: token! });
    setLoading(false);

    if (result.error) {
      if (result.error.code === "INVALID_TOKEN" || result.error.code === "TOKEN_EXPIRED") {
        setTokenExpired(true);
      } else {
        setErrors({ password: result.error.message ?? "Something went wrong." });
      }
      return;
    }

    router.push("/login?reset=1");
  }

  if (tokenExpired) {
    return (
      <Card className="shadow-md text-center">
        <CardHeader className="items-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <XCircle className="text-red-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">This link has expired</h1>
            <p className="mt-1 text-sm text-slate-500">Password reset links expire after 1 hour.</p>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push("/forgot-password")} className="w-full">
            Request a New Link
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Set a new password</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "border-red-500 focus-visible:ring-red-500 pr-10" : "pr-10"}
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
            {errors.password
              ? <p className="text-xs text-red-600">{errors.password}</p>
              : <p className="text-xs text-slate-500">At least 8 characters</p>
            }
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className={errors.confirm ? "border-red-500 focus-visible:ring-red-500 pr-10" : "pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirm && <p className="text-xs text-red-600">{errors.confirm}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving…" : "Set New Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
