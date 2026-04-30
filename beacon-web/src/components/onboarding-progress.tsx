import { cn } from "@/lib/utils";

const STEPS = [
  { n: 1, label: "Agency Info" },
  { n: 2, label: "Your Style" },
  { n: 3, label: "Logo" },
  { n: 4, label: "Clients" },
];

export function OnboardingProgress({ step }: { step: number }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1">
        {STEPS.map(({ n }, i) => (
          <span key={n} className="flex items-center gap-1">
            <span
              className={cn(
                "inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-semibold transition-colors",
                n < step && "bg-blue-600 text-white",
                n === step && "bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-1",
                n > step && "bg-slate-200 text-slate-400"
              )}
            >
              {n < step ? "✓" : n}
            </span>
            {i < STEPS.length - 1 && (
              <span className={cn("w-6 h-0.5", n < step ? "bg-blue-600" : "bg-slate-200")} />
            )}
          </span>
        ))}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Step {step} of {STEPS.length} · {STEPS[step - 1].label}
      </p>
    </div>
  );
}
