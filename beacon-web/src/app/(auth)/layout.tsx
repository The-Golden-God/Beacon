import { Suspense } from "react";
import Link from "next/link";
import { BeaconLogo } from "@/components/beacon-logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8">
        <BeaconLogo size="lg" />
      </div>

      <div className="w-full max-w-[400px]">
        <Suspense>{children}</Suspense>
      </div>

      <footer className="mt-8 text-center text-xs text-slate-400 space-x-3">
        <span>© 2026 Beacon</span>
        <span>·</span>
        <Link href="/privacy-policy" className="hover:text-slate-600">Privacy Policy</Link>
        <span>·</span>
        <Link href="/terms-of-service" className="hover:text-slate-600">Terms of Service</Link>
      </footer>
    </div>
  );
}
