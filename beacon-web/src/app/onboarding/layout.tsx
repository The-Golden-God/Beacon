"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { BeaconLogo } from "@/components/beacon-logo";

type AppUser = {
  onboardingComplete: boolean;
};

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    const user = session.user as unknown as AppUser;
    if (user.onboardingComplete) {
      router.replace("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  if (!session) return null;
  const user = session.user as unknown as AppUser;
  if (user.onboardingComplete) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <BeaconLogo size="lg" href={undefined} />
      </div>
      <div className="w-full max-w-[480px]">{children}</div>
    </div>
  );
}
