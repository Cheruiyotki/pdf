import { promises as fs } from "node:fs";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { planLimits, toolMap } from "@quickconvert/shared";
import { ItemStatus, JobStatus, PlanTier } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { asyncHandler, getActorKey, getPlanTier, getRequestIp } from "../../lib/http.js";
import { getDailyUsageCount } from "../usage/service.js";
import { saveBuffer } from "../../lib/storage/temp-storage.js";
import { processJob } from "../../lib/converters/index.js";
import { AsyncJobQueue } from "../../lib/queue.js";
import { requireAuth } from "../../middleware/auth.js";

const upload = multer({
  storage: multer.memoryStorage()
});

const jobQueue = new AsyncJobQueue(6);

function parseOptions(rawOptions: string | undefined) {
  if (!rawOptions) {
    return undefined;
  }

  return JSON.parse(rawOptions) as Record<string, string | number | boolean>;
}

function ensureSupportedExtensions(fileName: string, acceptedExtensions: string[]) {
  const ext = path.extname(fileName).toLowerCase();
  return acceptedExtensions.includes(ext);
}

export const jobsRouter = Router();

jobsRouter.post(
  "/",
  upload.array("files", 20),
  asyncHandler(async (req, res) => {
    const files = (req.files as Express.Multer.File[] | undefined) ?? [];

    if (files.length === 0) {
      res.status(400).json({ message: "Upload at least one file." });
      return;
    }

    const toolSlug = String(req.body.toolSlug ?? "");
    const tool = toolMap[toolSlug];

    if (!tool) {
      res.status(400).json({ message: "Unsupported tool." });
      return;
    }

    const ipAddress = getRequestIp(req);
    const actorKey = getActorKey(req.user, ipAddress);
    const tier = getPlanTier(req.user);
    const limit = planLimits[tier];
    const fastModeRequested = String(req.body.fastMode ?? "false") === "true";
    const fastMode = limit.fastMode && fastModeRequested;
    const options = parseOptions(req.body.options);
    const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
    const maxBytes = limit.maxFileSizeMb * 1024 * 1024;

    if (files.length > limit.maxBatchFiles) {
      res.status(429).json({
        message: `Your ${limit.label.toLowerCase()} plan supports up to ${limit.maxBatchFiles} files at once.`,
        upgradeRequired: true
      });
      return;
    }

    if (tier === "free") {
      const dailyCount = await getDailyUsageCount(actorKey);
      if (limit.dailyConversions !== null && dailyCount >= limit.dailyConversions) {
        res.status(429).json({
          message: "You've reached today's limit. Upgrade for unlimited conversions.",
          upgradeRequired: true
        });
        return;
      }
    }

    if (totalBytes > maxBytes) {
      res.status(413).json({
        message: `Files exceed your ${limit.label.toLowerCase()} upload size limit of ${limit.maxFileSizeMb}MB.`,
        upgradeRequired: tier === "free"
      });
      return;
    }

    if (!files.every((file) => ensureSupportedExtensions(file.originalname, tool.accepts))) {
      res.status(400).json({
        message: `Accepted file types: ${tool.accepts.join(", ")}`
      });
      return;
    }

    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    const job = await prisma.conversionJob.create({
      data: {
        userId: req.user?.id,
        toolSlug,
        planTier: tier === "premium" ? PlanTier.PREMIUM : PlanTier.FREE,
        originalCount: files.length,
        totalBytes,
        fastMode,
        optionsJson: options,
        actorKey,
        ipAddress,
        expiresAt
      }
    });

    for (const file of files) {
      const originalPath = await saveBuffer({
        jobId: job.id,
        originalName: file.originalname,
        buffer: file.buffer
      });

      await prisma.conversionItem.create({
        data: {
          jobId: job.id,
          originalName: file.originalname,
          originalMimeType: file.mimetype || "application/octet-stream",
          originalPath
        }
      });
    }

    jobQueue.add({
      id: job.id,
      priority: fastMode ? 100 : limit.queuePriority,
      run: () => processJob(job.id)
    });

    const created = await prisma.conversionJob.findUniqueOrThrow({
      where: { id: job.id },
      include: { items: true }
    });

    res.status(201).json({
      job: serializeJob(created),
      limits: {
        ...limit,
        message:
          tier === "free"
            ? "Free plan: 3 conversions/day, max 10MB, up to 3 files."
            : "Premium plan: unlimited conversions, larger files, fast queue."
      }
    });
  }),
);

jobsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const jobs = await prisma.conversionJob.findMany({
      where: { userId: req.user!.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 20
    });

    res.json({ jobs: jobs.map(serializeJob) });
  }),
);

jobsRouter.get(
  "/:jobId",
  asyncHandler(async (req, res) => {
    const ipAddress = getRequestIp(req);
    const actorKey = getActorKey(req.user, ipAddress);
    const job = await prisma.conversionJob.findUnique({
      where: { id: req.params.jobId },
      include: { items: true }
    });

    if (!job) {
      res.status(404).json({ message: "Job not found." });
      return;
    }

    const ownerMatch = job.userId ? job.userId === req.user?.id : job.actorKey === actorKey;
    if (!ownerMatch) {
      res.status(403).json({ message: "Access denied." });
      return;
    }

    res.json({ job: serializeJob(job) });
  }),
);

jobsRouter.post(
  "/:jobId/retry",
  asyncHandler(async (req, res) => {
    const ipAddress = getRequestIp(req);
    const actorKey = getActorKey(req.user, ipAddress);
    const job = await prisma.conversionJob.findUnique({
      where: { id: req.params.jobId }
    });

    if (!job || job.actorKey !== actorKey) {
      res.status(404).json({ message: "Job not found." });
      return;
    }

    await prisma.conversionJob.update({
      where: { id: job.id },
      data: {
        status: JobStatus.QUEUED,
        errorMessage: null
      }
    });

    await prisma.conversionItem.updateMany({
      where: { jobId: job.id },
      data: {
        status: ItemStatus.PENDING,
        errorMessage: null,
        outputPath: null,
        outputName: null,
        outputMimeType: null,
        outputSizeBytes: null
      }
    });

    jobQueue.add({
      id: job.id,
      priority: job.fastMode ? 100 : 1,
      run: () => processJob(job.id)
    });

    res.json({ message: "Job requeued." });
  }),
);

jobsRouter.get(
  "/:jobId/items/:itemId/download",
  asyncHandler(async (req, res) => {
    const ipAddress = getRequestIp(req);
    const actorKey = getActorKey(req.user, ipAddress);
    const item = await prisma.conversionItem.findUnique({
      where: { id: req.params.itemId },
      include: { job: true }
    });

    if (!item || item.jobId !== req.params.jobId) {
      res.status(404).json({ message: "File not found." });
      return;
    }

    const ownerMatch = item.job.userId ? item.job.userId === req.user?.id : item.job.actorKey === actorKey;
    if (!ownerMatch) {
      res.status(403).json({ message: "Access denied." });
      return;
    }

    if (!item.outputPath) {
      res.status(409).json({ message: "Conversion output not ready yet." });
      return;
    }

    const buffer = await fs.readFile(item.outputPath);
    res.setHeader("Content-Type", item.outputMimeType ?? "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${item.outputName ?? "download"}"`);
    res.send(buffer);
  }),
);

function serializeJob(job: {
  id: string;
  toolSlug: string;
  status: JobStatus;
  fastMode: boolean;
  errorMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  completedCount: number;
  originalCount: number;
  items: Array<{
    id: string;
    originalName: string;
    outputName: string | null;
    status: ItemStatus;
    outputSizeBytes: number | null;
    errorMessage: string | null;
  }>;
}) {
  return {
    id: job.id,
    toolSlug: job.toolSlug,
    status: job.status.toLowerCase(),
    fastMode: job.fastMode,
    errorMessage: job.errorMessage,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    expiresAt: job.expiresAt,
    completedCount: job.completedCount,
    originalCount: job.originalCount,
    items: job.items.map((item) => ({
      id: item.id,
      originalName: item.originalName,
      outputName: item.outputName,
      status: item.status.toLowerCase(),
      outputSizeBytes: item.outputSizeBytes,
      errorMessage: item.errorMessage
    }))
  };
}
