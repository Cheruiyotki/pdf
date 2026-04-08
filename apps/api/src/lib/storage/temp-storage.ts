import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { env } from "../../config/env.js";

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function ensureStorageRoots() {
  await ensureDir(env.tempStorageDir);
}

export async function saveBuffer(params: {
  jobId: string;
  originalName: string;
  buffer: Buffer;
}) {
  const folder = path.join(env.tempStorageDir, params.jobId);
  await ensureDir(folder);
  const sanitizedName = params.originalName.replace(/[^\w.-]+/g, "-").toLowerCase();
  const filePath = path.join(folder, `${randomUUID()}-${sanitizedName}`);
  await fs.writeFile(filePath, params.buffer);
  return filePath;
}

export async function writeOutput(params: {
  jobId: string;
  outputName: string;
  buffer: Buffer;
}) {
  const folder = path.join(env.tempStorageDir, params.jobId, "outputs");
  await ensureDir(folder);
  const outputPath = path.join(folder, params.outputName.replace(/[^\w.-]+/g, "-").toLowerCase());
  await fs.writeFile(outputPath, params.buffer);
  return outputPath;
}

export async function readBuffer(filePath: string) {
  return fs.readFile(filePath);
}

export async function getFileSize(filePath: string) {
  const stat = await fs.stat(filePath);
  return stat.size;
}

export async function removeJobFiles(jobId: string) {
  const folder = path.join(env.tempStorageDir, jobId);
  await fs.rm(folder, { recursive: true, force: true });
}
