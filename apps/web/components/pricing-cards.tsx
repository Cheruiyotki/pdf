"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";

const plans = [
  {
    title: "Free",
    price: "$0",
    description: "For occasional conversions on mobile or desktop.",
    features: ["3 conversions/day", "Up to 10MB files", "Batch up to 3 files", "Standard queue"]
  },
  {
    title: "Premium",
    price: "$12",
    description: "For heavier workflows and faster turnaround.",
    features: ["Unlimited conversions", "Up to 200MB files", "Batch up to 20 files", "Fast queue + smart repeat actions"]
  }
];

export function PricingCards() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function upgrade() {
    const token = getToken();
    if (!token) {
      setMessage("Sign in first to start a subscription.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await apiFetch<{ url?: string }>("/billing/checkout", {
        method: "POST",
        token
      });

      if (response.url) {
        window.location.href = response.url;
        return;
      }

      setMessage("Stripe is configured, but no checkout URL was returned.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start checkout.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {plans.map((plan) => (
        <article
          key={plan.title}
          className={`rounded-[2rem] p-6 shadow-card sm:p-8 ${plan.title === "Premium" ? "bg-ink text-white" : "bg-white text-ink"}`}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] opacity-70">{plan.title}</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-display text-5xl font-bold">{plan.price}</span>
            <span className="pb-2 text-sm opacity-70">{plan.title === "Premium" ? "/month" : "forever"}</span>
          </div>
          <p className="mt-4 max-w-md text-sm opacity-80">{plan.description}</p>
          <div className="mt-6 space-y-3">
            {plan.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          {plan.title === "Premium" ? (
            <Button className="mt-8 w-full" variant={plan.title === "Premium" ? "secondary" : "primary"} onClick={upgrade} disabled={loading}>
              {loading ? "Opening checkout..." : "Upgrade to Premium"}
            </Button>
          ) : (
            <Button className="mt-8 w-full" variant="secondary">
              Included by default
            </Button>
          )}
        </article>
      ))}
      {message ? <p className="text-sm text-ink/70">{message}</p> : null}
    </div>
  );
}
