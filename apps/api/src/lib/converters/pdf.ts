import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";
import { getMimeForExtension, replaceExtension } from "./shared.js";

export async function mergePdf(buffers: Buffer[], originalName: string) {
  const merged = await PDFDocument.create();

  for (const buffer of buffers) {
    const pdf = await PDFDocument.load(buffer);
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const outputBuffer = Buffer.from(await merged.save({ useObjectStreams: true }));
  return {
    outputBuffer,
    outputName: replaceExtension(originalName, ".pdf"),
    outputMimeType: getMimeForExtension(".pdf")
  };
}

export async function splitPdf(buffer: Buffer, originalName: string) {
  const source = await PDFDocument.load(buffer);
  const zip = new JSZip();

  for (const pageIndex of source.getPageIndices()) {
    const next = await PDFDocument.create();
    const [copied] = await next.copyPages(source, [pageIndex]);
    next.addPage(copied);
    const pageBuffer = Buffer.from(await next.save({ useObjectStreams: true }));
    zip.file(`${originalName.replace(/\.pdf$/i, "")}-page-${pageIndex + 1}.pdf`, pageBuffer);
  }

  const outputBuffer = await zip.generateAsync({ type: "nodebuffer" });
  return {
    outputBuffer,
    outputName: replaceExtension(originalName, ".zip"),
    outputMimeType: getMimeForExtension(".zip")
  };
}

export async function compressPdf(buffer: Buffer, originalName: string) {
  const source = await PDFDocument.load(buffer);
  const next = await PDFDocument.create();
  const pages = await next.copyPages(source, source.getPageIndices());
  pages.forEach((page) => next.addPage(page));
  const outputBuffer = Buffer.from(await next.save({ useObjectStreams: true }));

  return {
    outputBuffer,
    outputName: replaceExtension(originalName, ".pdf"),
    outputMimeType: getMimeForExtension(".pdf")
  };
}
