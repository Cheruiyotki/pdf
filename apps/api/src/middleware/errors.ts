import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Sentry } from "../lib/monitoring/sentry.js";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ message: "Route not found." });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: "Validation failed.",
      issues: error.flatten()
    });
    return;
  }

  Sentry.captureException(error);

  res.status(500).json({
    message: error instanceof Error ? error.message : "Unexpected server error."
  });
}
