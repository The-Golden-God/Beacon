"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { sendVerificationEmail } from "@/lib/auth-client";

const ERROR_MESSAGES: Record<string, string> = {
  expired: "This verification link has expired. Links are valid for 24 hours.",
  used: "This link has already been used. Your email may already be verified.",
  invalid: "This link isn't valid.",
};

export default function VerifyEmailErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "invalid";
  const email = searchParams.get("email") ?? "";

  const message = ERROR_MESSAGES[reason] ?? ERROR_MESSAGES.invalid;

  async function handleRequestNew() {
    if (email) {
      await sendVerificationEmail({ email });
      sessionStorage.setItem("pendingVerifyEmail", email);
    }
    router.push("/verify-email");
  }

  return (
    <Card className="shadow-md text-center">
      <CardHeader className="items-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
          <XCircle className="text-red-500" size={24} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-slate-900">That link didn't work</h1>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <Button onClick={handleRequestNew} className="w-full">
          Request a New Link
        </Button>
        <Link href="/login" className="block text-sm text-blue-600 hover:underline">
          Back to Log In
        </Link>
      </CardContent>
    </Card>
  );
}
