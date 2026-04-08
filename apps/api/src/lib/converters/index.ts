import { ItemStatus, JobStatus } from "@prisma/client";
import { prisma } from "../prisma.js";
import { Sentry } from "../monitoring/sentry.js";
import { getFileSize, readBuffer, writeOutput } from "../storage/temp-storage.js";
import { compressImage, convertJpgPng, resizeImage } from "./image.js";
import { pdfToWord, wordToPdf } from "./office.js";
import { compressPdf, mergePdf, splitPdf } from "./pdf.js";

export async function processJob(jobId: string) {
  const job = await prisma.conversionJob.findUnique({
    where: { id: jobId },
    include: { items: true }
  });

  if (!job) {
    return;
  }

  await prisma.conversionJob.update({
    where: { id: jobId },
    data: { status: JobStatus.PROCESSING }
  });

  try {
    switch (job.toolSlug) {
      case "merge-pdf":
        await processMerge(jobId);
        break;
      case "split-pdf":
        await processSplit(jobId);
        break;
      default:
        await processItems(jobId);
        break;
    }

    const completed = await prisma.conversionItem.count({
      where: { jobId, status: ItemStatus.COMPLETED }
    });

    await prisma.conversionJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMPLETED,
        completedCount: completed
      }
    });

    await prisma.usageEvent.create({
      data: {
        userId: job.userId,
        actorKey: job.actorKey,
        toolSlug: job.toolSlug,
        bytesUsed: job.totalBytes,
        ipAddress: job.ipAddress,
        successful: true
      }
    });
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        jobId,
        toolSlug: job.toolSlug
      }
    });

    await prisma.conversionJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : "Job failed"
      }
    });

    await prisma.conversionItem.updateMany({
      where: {
        jobId,
        status: {
          in: [ItemStatus.PENDING, ItemStatus.PROCESSING]
        }
      },
      data: {
        status: ItemStatus.FAILED,
        errorMessage: error instanceof Error ? error.message : "Job failed"
      }
    });

    await prisma.usageEvent.create({
      data: {
        userId: job.userId,
        actorKey: job.actorKey,
        toolSlug: job.toolSlug,
        bytesUsed: job.totalBytes,
        ipAddress: job.ipAddress,
        successful: false
      }
    });
  }
}

async function processItems(jobId: string) {
  const items = await prisma.conversionItem.findMany({
    where: { jobId },
    orderBy: { createdAt: "asc" }
  });

  await Promise.all(items.map((item) => processSingleItem(jobId, item.id)));
}

async function processSingleItem(jobId: string, itemId: string) {
  const item = await prisma.conversionItem.findUniqueOrThrow({
    where: { id: itemId },
    include: { job: true }
  });

  await prisma.conversionItem.update({
    where: { id: itemId },
    data: { status: ItemStatus.PROCESSING }
  });

  const buffer = await readBuffer(item.originalPath);
  const toolSlug = item.job.toolSlug;

  const result =
    toolSlug === "pdf-to-word"
      ? await pdfToWord(buffer, item.originalName)
      : toolSlug === "word-to-pdf"
        ? await wordToPdf(buffer, item.originalName)
        : toolSlug === "compress-pdf"
          ? await compressPdf(buffer, item.originalName)
          : toolSlug === "image-compressor"
            ? await compressImage({
                buffer,
                originalName: item.originalName,
                options: (item.job.optionsJson as Record<string, string | number | boolean> | null) ?? undefined
              })
            : toolSlug === "jpg-png-converter"
              ? await convertJpgPng({ buffer, originalName: item.originalName })
              : toolSlug === "image-resize"
                ? await resizeImage({
                    buffer,
                    originalName: item.originalName,
                    options: (item.job.optionsJson as Record<string, string | number | boolean> | null) ?? undefined
                  })
                : (() => {
                    throw new Error(`Unsupported tool: ${toolSlug}`);
                  })();

  const outputPath = await writeOutput({
    jobId,
    outputName: result.outputName,
    buffer: result.outputBuffer
  });

  const outputSizeBytes = await getFileSize(outputPath);

  await prisma.conversionItem.update({
    where: { id: item.id },
    data: {
      status: ItemStatus.COMPLETED,
      outputPath,
      outputName: result.outputName,
      outputMimeType: result.outputMimeType,
      outputSizeBytes
    }
  });
}

async function processMerge(jobId: string) {
  const items = await prisma.conversionItem.findMany({
    where: { jobId },
    orderBy: { createdAt: "asc" }
  });

  await prisma.conversionItem.updateMany({
    where: { jobId },
    data: { status: ItemStatus.PROCESSING }
  });

  const buffers = await Promise.all(items.map((item) => readBuffer(item.originalPath)));
  const result = await mergePdf(buffers, "merged.pdf");
  const outputPath = await writeOutput({
    jobId,
    outputName: result.outputName,
    buffer: result.outputBuffer
  });
  const outputSizeBytes = await getFileSize(outputPath);

  await prisma.conversionItem.update({
    where: { id: items[0]!.id },
    data: {
      status: ItemStatus.COMPLETED,
      outputPath,
      outputName: result.outputName,
      outputMimeType: result.outputMimeType,
      outputSizeBytes
    }
  });

  await prisma.conversionItem.updateMany({
    where: {
      jobId,
      id: { not: items[0]!.id }
    },
    data: {
      status: ItemStatus.COMPLETED
    }
  });
}

async function processSplit(jobId: string) {
  const item = await prisma.conversionItem.findFirstOrThrow({
    where: { jobId },
    orderBy: { createdAt: "asc" }
  });

  await prisma.conversionItem.update({
    where: { id: item.id },
    data: { status: ItemStatus.PROCESSING }
  });

  const buffer = await readBuffer(item.originalPath);
  const result = await splitPdf(buffer, item.originalName);
  const outputPath = await writeOutput({
    jobId,
    outputName: result.outputName,
    buffer: result.outputBuffer
  });
  const outputSizeBytes = await getFileSize(outputPath);

  await prisma.conversionItem.update({
    where: { id: item.id },
    data: {
      status: ItemStatus.COMPLETED,
      outputPath,
      outputName: result.outputName,
      outputMimeType: result.outputMimeType,
      outputSizeBytes
    }
  });
}
