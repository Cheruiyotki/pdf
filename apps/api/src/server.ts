import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { initSentry } from "./lib/monitoring/sentry.js";
import { ensureStorageRoots } from "./lib/storage/temp-storage.js";
import { startCleanupWorker } from "./modules/cleanup.js";

async function start() {
  initSentry();
  await ensureStorageRoots();
  startCleanupWorker();

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`QuickConvert API listening on http://localhost:${env.PORT}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
