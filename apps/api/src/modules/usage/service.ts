import { ItemStatus } from "@prisma/client";
import { startOfDay } from "./time.js";
import { prisma } from "../../lib/prisma.js";

export async function getDailyUsageCount(actorKey: string) {
  return prisma.usageEvent.count({
    where: {
      actorKey,
      successful: true,
      createdAt: {
        gte: startOfDay()
      }
    }
  });
}

export async function getUsageSummary(params: {
  actorKey: string;
  userId?: string;
}) {
  const [todayCount, lifetimeCount, bytesUsed] = await Promise.all([
    getDailyUsageCount(params.actorKey),
    prisma.usageEvent.count({
      where: params.userId ? { userId: params.userId, successful: true } : { actorKey: params.actorKey, successful: true }
    }),
    prisma.conversionItem.aggregate({
      _sum: { outputSizeBytes: true },
      where: {
        job: {
          is: params.userId ? { userId: params.userId } : { actorKey: params.actorKey }
        },
        status: ItemStatus.COMPLETED
      }
    })
  ]);

  return {
    todayCount,
    lifetimeCount,
    bytesUsed: bytesUsed._sum.outputSizeBytes ?? 0
  };
}
