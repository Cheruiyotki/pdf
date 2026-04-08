"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type SupportPanelProps = {
  toolSlug?: string;
};

export function SupportPanel({ toolSlug }: SupportPanelProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function handleSubmit() {
    setStatus("Sending...");
    try {
      await apiFetch("/support", {
        method: "POST",
        body: JSON.stringify({
          type: "support",
          email,
          message,
          toolSlug
        })
      });
      setStatus("Support request sent.");
      setMessage("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not submit your request.");
    }
  }

  return (
    <section className="rounded-[2rem] bg-ink p-6 text-white sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-display text-2xl font-bold">Support that stays inside the flow</p>
          <p className="mt-3 text-white/75">Use live chat, email, or the built-in form if a conversion stalls or needs review.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              className="inline-flex min-h-12 items-center rounded-2xl bg-white px-5 font-semibold text-ink"
              href={process.env.NEXT_PUBLIC_LIVE_CHAT_URL ?? "mailto:support@quickconvert.app?subject=QuickConvert%20Support"}
            >
              Open chat or email
            </a>
            <a
              className="inline-flex min-h-12 items-center rounded-2xl border border-white/20 px-5 font-semibold text-white"
              href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@quickconvert.app"}`}
            >
              {process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "support@quickconvert.app"}
            </a>
          </div>
        </div>
        <div className="rounded-[1.75rem] bg-white p-4 text-ink">
          <div className="grid gap-3">
            <input
              className="min-h-12 rounded-2xl border border-ink/10 px-4"
              placeholder="Your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <textarea
              className="min-h-28 rounded-2xl border border-ink/10 px-4 py-3"
              placeholder="How can we help?"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={handleSubmit} disabled={!email || !message}>
                Contact support
              </Button>
              {status ? <p className="text-sm text-ink/70">{status}</p> : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
