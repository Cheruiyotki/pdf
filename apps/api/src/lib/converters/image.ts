import path from "node:path";
import sharp from "sharp";
import { getMimeForExtension, replaceExtension } from "./shared.js";

export async function compressImage(params: {
  buffer: Buffer;
  originalName: string;
  options?: Record<string, string | number | boolean>;
}) {
  const quality = Number(params.options?.quality ?? 72);
  const ext = path.extname(params.originalName).toLowerCase() || ".jpg";
  const image = sharp(params.buffer);

  let outputBuffer: Buffer;
  let outputExtension = ext;

  if (ext === ".png") {
    outputBuffer = await image.png({ compressionLevel: 9, quality }).toBuffer();
  } else if (ext === ".webp") {
    outputBuffer = await image.webp({ quality }).toBuffer();
  } else {
    outputExtension = ".jpg";
    outputBuffer = await image.jpeg({ quality, mozjpeg: true }).toBuffer();
  }

  return {
    outputBuffer,
    outputName: replaceExtension(params.originalName, outputExtension),
    outputMimeType: getMimeForExtension(outputExtension)
  };
}

export async function convertJpgPng(params: {
  buffer: Buffer;
  originalName: string;
}) {
  const ext = path.extname(params.originalName).toLowerCase();
  const image = sharp(params.buffer);

  if (ext === ".png") {
    const outputBuffer = await image.jpeg({ quality: 92, mozjpeg: true }).toBuffer();
    return {
      outputBuffer,
      outputName: replaceExtension(params.originalName, ".jpg"),
      outputMimeType: getMimeForExtension(".jpg")
    };
  }

  const outputBuffer = await image.png({ compressionLevel: 9 }).toBuffer();
  return {
    outputBuffer,
    outputName: replaceExtension(params.originalName, ".png"),
    outputMimeType: getMimeForExtension(".png")
  };
}

export async function resizeImage(params: {
  buffer: Buffer;
  originalName: string;
  options?: Record<string, string | number | boolean>;
}) {
  const width = Number(params.options?.width ?? 1200);
  const height = Number(params.options?.height ?? 1200);
  const ext = path.extname(params.originalName).toLowerCase() || ".jpg";
  const image = sharp(params.buffer).resize({
    width,
    height,
    fit: "inside",
    withoutEnlargement: true
  });

  let outputBuffer: Buffer;

  if (ext === ".png") {
    outputBuffer = await image.png({ compressionLevel: 9 }).toBuffer();
  } else if (ext === ".webp") {
    outputBuffer = await image.webp({ quality: 92 }).toBuffer();
  } else {
    outputBuffer = await image.jpeg({ quality: 92, mozjpeg: true }).toBuffer();
  }

  return {
    outputBuffer,
    outputName: replaceExtension(params.originalName, ext),
    outputMimeType: getMimeForExtension(ext)
  };
}
