import type { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { verifyAuthToken } from "../lib/jwt.js";

type AuthenticatedUser = Prisma.UserGetPayload<{
  include: {
    subscription: true;
  };
}>;

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser | null;
    }
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    next();
    return;
  }

  try {
    const token = authorization.slice("Bearer ".length);
    const payload = verifyAuthToken(token);
    req.user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { subscription: true }
    });
  } catch {
    req.user = null;
  }

  next();
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ message: "Authentication required." });
    return;
  }

  next();
}
