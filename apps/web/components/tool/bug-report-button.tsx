"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

type BugReportButtonProps = {
  toolSlug: string;
};

export function BugReportButton({ toolSlug }: BugReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  async function submit() {
    setStatus("Sending...");
    try {
      await apiFetch("/support", {
        method: "POST",
        body: JSON.stringify({
          type: "bug",
          email,
          message,
          toolSlug
        })
      });
      setStatus("Bug report sent.");
      setMessage("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not send report.");
    }
  }

  return (
    <div className="rounded-3xl border border-ink/10 bg-white p-4 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-ink">Found a problem?</p>
          <p className="text-sm text-ink/70">Send a bug report directly from this tool page.</p>
        </div>
        <Button variant="secondary" onClick={() => setOpen((current) => !current)}>
          {open ? "Hide report form" : "Report a bug"}
        </Button>
      </div>
      {open ? (
        <div className="mt-4 grid gap-3">
          <input
            className="min-h-12 rounded-2xl border border-ink/10 px-4"
            placeholder="Your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <textarea
            className="min-h-28 rounded-2xl border border-ink/10 px-4 py-3"
            placeholder="What happened?"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={submit} disabled={!email || !message}>
              Send bug report
            </Button>
            {status ? <p className="text-sm text-ink/70">{status}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
