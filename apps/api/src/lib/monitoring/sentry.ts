import * as Sentry from "@sentry/node";
import { env } from "../../config/env.js";

let initialized = false;

export function initSentry() {
  if (initialized || !env.SENTRY_DSN) {
    return;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    tracesSampleRate: 1
  });

  initialized = true;
}

export { Sentry };
