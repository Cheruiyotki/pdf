"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="page-shell py-20">
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <h2 className="font-display text-3xl font-bold text-ink">Something went wrong</h2>
        <p className="mt-3 text-sm text-ink/70">The error was captured for monitoring. You can retry the page or report the bug from any tool page.</p>
        <div className="mt-5">
          <Button onClick={reset}>Try again</Button>
        </div>
      </div>
    </div>
  );
}
