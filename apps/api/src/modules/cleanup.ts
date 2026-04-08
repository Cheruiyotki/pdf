import { JobStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { removeJobFiles } from "../lib/storage/temp-storage.js";

export function startCleanupWorker() {
  const interval = 5 * 60 * 1000;

  const tick = async () => {
    const jobs = await prisma.conversionJob.findMany({
      where: {
        deletedAt: null,
        expiresAt: {
          lte: new Date()
        }
      },
      select: {
        id: true
      }
    });

    for (const job of jobs) {
      await removeJobFiles(job.id);
      await prisma.conversionJob.update({
        where: { id: job.id },
        data: {
          deletedAt: new Date(),
          status: JobStatus.EXPIRED
        }
      });
    }
  };

  tick().catch(() => undefined);
  return setInterval(() => {
    tick().catch(() => undefined);
  }, interval);
}
