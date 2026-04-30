"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Workspace {
  plan?: string | null;
  trialEndsAt?: string | null;
  subscriptionStatus?: string | null;
}

const PLANS = [
  {
    id: "solo",
    name: "Solo",
    price: "$29",
    period: "/mo",
    description: "1 agent, unlimited clients",
    features: ["Unlimited letter generation", "E&O log", "CSV import", "Email sending"],
  },
  {
    id: "agency",
    name: "Agency",
    price: "$79",
    period: "/mo",
    description: "Up to 5 agents",
    features: ["Everything in Solo", "Team management", "Approval queue", "Priority support"],
    highlighted: true,
  },
  {
    id: "office",
    name: "Office",
    price: "$199",
    period: "/mo",
    description: "Unlimited agents",
    features: ["Everything in Agency", "Custom templates", "Dedicated onboarding", "SLA support"],
  },
];

export default function BillingPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["workspace"],
    queryFn: () => api.get<{ workspace: Workspace }>("/workspace"),
  });

  const workspace = data?.workspace;
  const currentPlan = workspace?.plan ?? "solo";
  const trialEndsAt = workspace?.trialEndsAt;
  const isTrialing = workspace?.subscriptionStatus === "trialing" || !!trialEndsAt;

  async function handleUpgrade(planId: string) {
    try {
      const res = await api.post<{ url: string }>("/billing/checkout", { plan: planId });
      if (res.url) window.location.assign(res.url);
    } catch {
      toast.error("Failed to start checkout.");
    }
  }

  async function handleManage() {
    try {
      const res = await api.post<{ url: string }>("/billing/portal", {});
      if (res.url) window.location.assign(res.url);
    } catch {
      toast.error("Failed to open billing portal.");
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl">
      <h2 className="text-base font-semibold mb-1">Billing</h2>
      <p className="text-sm text-muted-foreground mb-6">Manage your subscription and plan.</p>

      {isLoading ? (
        <div className="text-sm text-muted-foreground animate-pulse">Loading…</div>
      ) : (
        <div className="space-y-6">
          {/* Current status */}
          {isTrialing && trialEndsAt && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-sm font-medium text-amber-800">
                Free trial active — ends {format(new Date(trialEndsAt), "MMMM d, yyyy")}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">Add a payment method before your trial ends to keep your data.</p>
            </div>
          )}

          {/* Plans */}
          <div className="grid gap-4 sm:grid-cols-3">
            {PLANS.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              return (
                <Card key={plan.id} className={cn(
                  "relative",
                  plan.highlighted && "border-primary shadow-sm",
                  isCurrent && "bg-primary/5"
                )}>
                  {plan.highlighted && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                      <span className="bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full">Popular</span>
                    </div>
                  )}
                  <CardContent className="pt-5 space-y-3">
                    <div>
                      <p className="font-semibold">{plan.name}</p>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      <span className="text-xs text-muted-foreground">{plan.period}</span>
                    </div>
                    <ul className="space-y-1.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle size={12} className="text-green-500 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" size="sm" onClick={handleManage}>
                        Manage
                      </Button>
                    ) : (
                      <Button className="w-full" size="sm" onClick={() => handleUpgrade(plan.id)}>
                        Upgrade
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            All plans include a 14-day free trial. Cancel any time — no lock-in.
          </p>
        </div>
      )}
    </div>
  );
}
