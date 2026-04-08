"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { getToken, getSessionUser } from "@/lib/auth";
import { ConversionJob } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/utils";

type SummaryResponse = {
  usage: {
    todayCount: number;
    lifetimeCount: number;
    bytesUsed: number;
    remainingFreeQuota: number | null;
  };
  limits: {
    label: string;
    maxBatchFiles: number;
    maxFileSizeMb: number;
    fastMode: boolean;
  };
};

export function DashboardClient() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [jobs, setJobs] = useState<ConversionJob[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      return;
    }

    Promise.all([
      apiFetch<SummaryResponse>("/usage/summary", { token }),
      apiFetch<{ jobs: ConversionJob[] }>("/jobs", { token })
    ])
      .then(([summaryResponse, jobsResponse]) => {
        setSummary(summaryResponse);
        setJobs(jobsResponse.jobs);
      })
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load dashboard."));
  }, []);

  const sessionUser = typeof window === "undefined" ? null : getSessionUser();

  if (!sessionUser) {
    return (
      <div className="rounded-[2rem] bg-white p-6 shadow-card sm:p-8">
        <p className="text-lg font-semibold text-ink">Sign in to unlock your dashboard</p>
        <p className="mt-2 max-w-xl text-sm text-ink/70">Track conversions, storage output, and remaining quota for your free or premium plan.</p>
        <div className="mt-5">
          <Link href="/login">
            <Button>Go to login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Converted today" value={summary ? String(summary.usage.todayCount) : "..."} />
        <StatCard label="Files converted" value={summary ? String(summary.usage.lifetimeCount) : "..."} />
        <StatCard label="Output generated" value={summary ? formatBytes(summary.usage.bytesUsed) : "..."} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[2rem] bg-white p-6 shadow-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold text-ink">Recent jobs</p>
              <p className="text-sm text-ink/70">Repeat actions quickly from your latest conversions.</p>
            </div>
            <Link href="/pricing" className="text-sm font-semibold text-coral">
              Upgrade
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {jobs.length === 0 ? (
              <p className="text-sm text-ink/70">No jobs yet. Try a tool from the home page.</p>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="rounded-2xl border border-ink/10 px-4 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold capitalize text-ink">{job.toolSlug.replaceAll("-", " ")}</p>
                      <p className="text-sm text-ink/60">{formatDate(job.createdAt)}</p>
                    </div>
                    <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal">
                      {job.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-ink/70">
                    {job.completedCount}/{job.originalCount} files complete
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
        <section className="rounded-[2rem] bg-ink p-6 text-white shadow-card">
          <p className="text-lg font-semibold">Plan snapshot</p>
          <div className="mt-5 space-y-3 text-sm text-white/80">
            <p>Tier: {summary?.limits.label ?? sessionUser.planTier}</p>
            <p>Batch size: up to {summary?.limits.maxBatchFiles ?? 3} files</p>
            <p>File size: up to {summary?.limits.maxFileSizeMb ?? 10}MB</p>
            <p>Fast queue: {summary?.limits.fastMode ? "Included" : "Upgrade required"}</p>
            <p>
              Remaining free quota: {summary?.usage.remainingFreeQuota === null ? "Unlimited" : summary?.usage.remainingFreeQuota ?? "..."}
            </p>
          </div>
          {error ? <p className="mt-4 text-sm text-gold">{error}</p> : null}
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-card">
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-3 font-display text-4xl font-bold text-ink">{value}</p>
    </div>
  );
}
