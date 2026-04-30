"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-bold text-slate-200 mb-4">500</p>
      <h1 className="text-2xl font-semibold text-slate-900 mb-2">Something went wrong</h1>
      <p className="text-slate-500 mb-8">
        We're having trouble loading this page. Our team has been notified.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset}>Try Again</Button>
        <Button variant="outline" onClick={() => window.location.href = "/dashboard"}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
