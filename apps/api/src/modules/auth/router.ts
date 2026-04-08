import { Router } from "express";
import { registerSchema, loginSchema } from "@quickconvert/shared";
import { PlanTier } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { compare, hash } from "../../lib/password.js";
import { signAuthToken } from "../../lib/jwt.js";
import { asyncHandler } from "../../lib/http.js";
import { requireAuth } from "../../middleware/auth.js";

export const authRouter = Router();

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const input = registerSchema.parse(req.body);
    const passwordHash = await hash(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email.toLowerCase(),
        name: input.name,
        passwordHash,
        planTier: PlanTier.FREE
      }
    });

    const token = signAuthToken({ sub: user.id, email: user.email });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planTier: user.planTier.toLowerCase()
      }
    });
  }),
);

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const input = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: input.email.toLowerCase() },
      include: { subscription: true }
    });

    if (!user || !(await compare(input.password, user.passwordHash))) {
      res.status(401).json({ message: "Invalid email or password." });
      return;
    }

    const token = signAuthToken({ sub: user.id, email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        planTier: user.planTier.toLowerCase(),
        subscriptionStatus: user.subscription?.status.toLowerCase() ?? "inactive"
      }
    });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({
      user: {
        id: req.user!.id,
        email: req.user!.email,
        name: req.user!.name,
        planTier: req.user!.planTier.toLowerCase(),
        subscriptionStatus: req.user!.subscription?.status.toLowerCase() ?? "inactive"
      }
    });
  }),
);
