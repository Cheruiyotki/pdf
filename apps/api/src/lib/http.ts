import type { NextFunction, Request, Response } from "express";
import { PlanTier, type User } from "@prisma/client";

export function asyncHandler<T extends Request>(
  handler: (req: T, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: T, res: Response, next: NextFunction) => {
    handler(req, res, next).catch(next);
  };
}

export function getRequestIp(req: Request) {
  return (
    req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ??
    req.socket.remoteAddress ??
    "0.0.0.0"
  );
}

export function getActorKey(user?: User | null, ipAddress?: string) {
  return user ? `user:${user.id}` : `ip:${ipAddress ?? "0.0.0.0"}`;
}

export function getPlanTier(user?: User | null) {
  return user?.planTier === PlanTier.PREMIUM ? "premium" : "free";
}
