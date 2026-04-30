"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function VerifyEmailConfirmedPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/onboarding/agency");
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Card className="shadow-md text-center">
      <CardHeader className="items-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle2 className="text-green-600" size={24} />
        </div>
        <CardTitle className="text-xl">Email verified!</CardTitle>
        <CardDescription>Let's set up your account.</CardDescription>
      </CardHeader>

      <CardContent>
        <Button onClick={() => router.push("/onboarding/agency")} className="w-full">
          Continue to Setup →
        </Button>
        <p className="mt-3 text-xs text-slate-400">Redirecting automatically…</p>
      </CardContent>
    </Card>
  );
}
