import { Router } from "express";
import { planLimits } from "@quickconvert/shared";
import { asyncHandler, getActorKey, getPlanTier, getRequestIp } from "../../lib/http.js";
import { getUsageSummary } from "./service.js";

export const usageRouter = Router();

usageRouter.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const ipAddress = getRequestIp(req);
    const actorKey = getActorKey(req.user, ipAddress);
    const tier = getPlanTier(req.user);
    const summary = await getUsageSummary({
      actorKey,
      userId: req.user?.id
    });

    const limit = planLimits[tier];

    res.json({
      usage: {
        ...summary,
        remainingFreeQuota: limit.dailyConversions === null ? null : Math.max(limit.dailyConversions - summary.todayCount, 0)
      },
      limits: limit
    });
  }),
);
