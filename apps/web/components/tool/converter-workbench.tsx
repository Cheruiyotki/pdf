"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ToolDefinition } from "@quickconvert/shared";
import { toolMap } from "@quickconvert/shared";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/tool/file-dropzone";
import { apiFetch, getApiUrl } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { uploadJob } from "@/lib/upload";
import { ConversionJob, JobItem } from "@/lib/types";
import { formatBytes, formatDate } from "@/lib/utils";

type JobResponse = {
  job: ConversionJob;
  limits: {
    message: string;
  };
};

export function ConverterWorkbench({ tool }: { tool: ToolDefinition }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [job, setJob] = useState<ConversionJob | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fastMode, setFastMode] = useState(false);
  const [quality, setQuality] = useState(72);
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(1200);

  const options = useMemo(() => {
    if (tool.slug === "image-compressor") {
      return { quality };
    }

    if (tool.slug === "image-resize") {
      return { width, height };
    }

    return undefined;
  }, [tool.slug, quality, width, height]);

  useEffect(() => {
    if (!job || !["queued", "processing"].includes(job.status)) {
      return;
    }

    const token = getToken();
    const interval = window.setInterval(async () => {
      try {
        const response = await apiFetch<{ job: ConversionJob }>(`/jobs/${job.id}`, { token });
        setJob(response.job);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not refresh job.");
      }
    }, 1800);

    return () => window.clearInterval(interval);
  }, [job]);

  async function startConversion() {
    const token = getToken();
    setMessage("Uploading files...");
    setUploadProgress(0);

    try {
      if (files.length > 0) {
        window.sessionStorage.setItem("quickconvert-last-files", JSON.stringify(files.map((file) => file.name)));
      }

      const response = await uploadJob<JobResponse>({
        toolSlug: tool.slug,
        files,
        options,
        fastMode,
        token,
        onProgress: setUploadProgress
      });

      setJob(response.job);
      setMessage(response.limits.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  async function downloadItem(item: JobItem) {
    if (!job) {
      return;
    }

    const token = getToken();
    const response = await fetch(`${getApiUrl()}/jobs/${job.id}/items/${item.id}/download`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });

    if (!response.ok) {
      setMessage("Download failed.");
      return;
    }

    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = item.outputName ?? "download";
    link.click();
    URL.revokeObjectURL(href);
  }

  function repeatConversion() {
    setJob(null);
    setMessage("Choose another file to run the same conversion again.");
  }

  function reuploadLastFile() {
    const stored = window.sessionStorage.getItem("quickconvert-last-files");
    setMessage(stored ? `Last upload: ${stored}` : "Your last local files can’t be auto-restored by the browser, but you can pick them again in one tap.");
  }

  const completedItems = job?.items.filter((item) => item.outputName) ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[2rem] bg-white p-6 shadow-card sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-display text-3xl font-bold text-ink">{tool.shortTitle}</p>
            <p className="mt-2 max-w-xl text-sm text-ink/70">{tool.description}</p>
          </div>
          <span className="rounded-full bg-mist px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal">
            No file storage
          </span>
        </div>
        <div className="mt-6">
          <FileDropzone
            files={files}
            acceptedExtensions={tool.accepts}
            maxFiles={tool.batchFriendly ? 20 : 1}
            onFilesChange={setFiles}
          />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-cream p-4">
            <p className="font-semibold text-ink">Queue mode</p>
            <label className="mt-3 flex items-center justify-between gap-3 text-sm text-ink/70">
              Fast mode for premium users
              <input type="checkbox" checked={fastMode} onChange={(event) => setFastMode(event.target.checked)} />
            </label>
          </div>
          <div className="rounded-3xl bg-cream p-4">
            {tool.slug === "image-compressor" ? (
              <>
                <p className="font-semibold text-ink">Compression quality</p>
                <input className="mt-3 w-full" type="range" min="35" max="90" value={quality} onChange={(event) => setQuality(Number(event.target.value))} />
                <p className="mt-2 text-sm text-ink/70">Quality: {quality}</p>
              </>
            ) : tool.slug === "image-resize" ? (
              <>
                <p className="font-semibold text-ink">Resize options</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <input className="min-h-11 rounded-2xl border border-ink/10 px-4" type="number" value={width} onChange={(event) => setWidth(Number(event.target.value))} />
                  <input className="min-h-11 rounded-2xl border border-ink/10 px-4" type="number" value={height} onChange={(event) => setHeight(Number(event.target.value))} />
                </div>
              </>
            ) : (
              <>
                <p className="font-semibold text-ink">Privacy and speed</p>
                <p className="mt-3 text-sm text-ink/70">Files are auto-deleted after 30 minutes, processed in async queues, and never stored long term.</p>
              </>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={startConversion} disabled={files.length === 0}>
            Convert now
          </Button>
          <Button variant="secondary" onClick={repeatConversion}>
            Convert same format again
          </Button>
          <Button variant="ghost" onClick={reuploadLastFile}>
            Re-upload last file
          </Button>
        </div>
        <div className="mt-6 rounded-3xl bg-cream p-4">
          <div className="flex items-center justify-between text-sm font-semibold text-ink">
            <span>Upload progress</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="mt-3 h-3 rounded-full bg-white">
            <div className="h-3 rounded-full bg-coral transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
          {message ? <p className="mt-3 text-sm text-ink/70">{message}</p> : null}
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[2rem] bg-ink p-6 text-white shadow-card sm:p-8">
          <p className="font-display text-2xl font-bold">Live conversion status</p>
          {job ? (
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Status</span>
                <span className="rounded-full bg-white/10 px-3 py-1 font-semibold uppercase tracking-[0.14em] text-gold">{job.status}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Files complete</span>
                <span>{job.completedCount}/{job.originalCount}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/70">
                <span>Expires</span>
                <span>{formatDate(job.expiresAt)}</span>
              </div>
              <div className="rounded-3xl bg-white/10 p-4">
                {job.items.map((item) => (
                  <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 py-3 last:border-b-0">
                    <div>
                      <p className="font-medium">{item.outputName ?? item.originalName}</p>
                      <p className="text-sm text-white/60">{item.status}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.outputSizeBytes ? <span className="text-sm text-white/60">{formatBytes(item.outputSizeBytes)}</span> : null}
                      {item.outputName ? (
                        <Button variant="secondary" onClick={() => downloadItem(item)}>
                          Download
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/70">Start a job to see live upload feedback, queue state, and download actions here.</p>
          )}
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-card">
          <p className="font-semibold text-ink">Smart suggestions</p>
          <p className="mt-2 text-sm text-ink/70">After each conversion, jump into the next likely action with one tap.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {tool.suggestedNext.map((slug) => (
              <Link key={slug} href={`/${slug}`} className="rounded-2xl bg-cream px-4 py-3 text-sm font-semibold text-ink">
                {toolMap[slug]?.shortTitle ?? slug}
              </Link>
            ))}
          </div>
          <div className="mt-5 rounded-3xl bg-cream p-4 text-sm text-ink/70">
            {completedItems.length > 0
              ? "You’ve reached the success moment. Upgrade now for unlimited daily conversions, bigger files, and the fast queue."
              : "Free plan includes 3 conversions/day and up to 3 files per batch. Premium unlocks faster and larger workflows."}
          </div>
          <div className="mt-4">
            <Link href="/pricing">
              <Button className="w-full">See premium plans</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
