"use client";
export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn, sendVerificationEmail } from "@/lib/auth-client";

interface FormErrors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);

  // Show success banner if arriving from reset-password
  const resetSuccess = searchParams.get("reset") === "1";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: FormErrors = {};
    if (!email) errs.email = "Email is required";
    if (!password) errs.password = "Password is required";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setErrors({});
    setGeneralError("");
    setUnverifiedEmail("");

    const result = await signIn.email({
      email,
      password,
      rememberMe,
    });

    setLoading(false);

    if (result.error) {
      const code = result.error.code;
      if (code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(email);
      } else if (code === "INVALID_EMAIL_OR_PASSWORD" || code === "USER_NOT_FOUND") {
        setGeneralError("Incorrect email or password.");
      } else {
        setGeneralError(result.error.message ?? "Something went wrong.");
      }
      return;
    }

    // Check onboarding status
    const user = result.data?.user as any;
    if (user?.onboardingComplete === false) {
      router.push("/onboarding/agency");
    } else {
      router.push("/dashboard");
    }
  }

  async function handleResendVerification() {
    if (!unverifiedEmail) return;
    setResendingVerification(true);
    await sendVerificationEmail({ email: unverifiedEmail });
    setResendingVerification(false);
    sessionStorage.setItem("pendingVerifyEmail", unverifiedEmail);
    router.push("/verify-email");
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Welcome back</CardTitle>
      </CardHeader>

      <CardContent>
        {resetSuccess && (
          <div className="mb-4 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm text-green-700">
            Password updated. Log in with your new password.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {generalError && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {generalError}
            </div>
          )}

          {unverifiedEmail && (
            <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
              Please verify your email before logging in.{" "}
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={resendingVerification}
                className="underline font-medium hover:text-amber-900 disabled:opacity-50"
              >
                {resendingVerification ? "Sending…" : "Resend verification email"}
              </button>
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
            {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 accent-blue-600"
            />
            <span className="text-sm text-slate-600">Remember me for 7 days</span>
          </label>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in…" : "Log In"}
          </Button>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{" "}
            <Link href="/signup" className="text-blue-600 hover:underline font-medium">
              Start free
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
