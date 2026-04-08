import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { apiLimiter } from "./middleware/rate-limit.js";
import { errorHandler, notFound } from "./middleware/errors.js";
import { optionalAuth } from "./middleware/auth.js";
import { authRouter } from "./modules/auth/router.js";
import { jobsRouter } from "./modules/jobs/router.js";
import { usageRouter } from "./modules/usage/router.js";
import { billingRouter, billingWebhookHandler } from "./modules/billing/router.js";
import { supportRouter } from "./modules/support/router.js";
import { healthRouter } from "./modules/health/router.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.NEXT_PUBLIC_APP_URL, credentials: true }));
  app.post("/api/billing/webhook", express.raw({ type: "application/json" }), async (req, res, next) => {
    try {
      await billingWebhookHandler(req.body as Buffer, req.headers["stripe-signature"]);
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  });
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(helmet());
  app.use(morgan("dev"));
  app.use(apiLimiter);
  app.use(optionalAuth);

  app.use("/api/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/jobs", jobsRouter);
  app.use("/api/usage", usageRouter);
  app.use("/api/billing", billingRouter);
  app.use("/api/support", supportRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
