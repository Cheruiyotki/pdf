import { Document, Packer, Paragraph } from "docx";
import mammoth from "mammoth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import pdfParse from "pdf-parse";
import { getMimeForExtension, replaceExtension } from "./shared.js";

export async function pdfToWord(buffer: Buffer, originalName: string) {
  const parsed = await pdfParse(buffer);
  const paragraphs = parsed.text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => new Paragraph(line));

  const document = new Document({
    sections: [
      {
        properties: {},
        children: paragraphs.length > 0 ? paragraphs : [new Paragraph("No extractable text found in the PDF.")]
      }
    ]
  });

  const outputBuffer = await Packer.toBuffer(document);
  return {
    outputBuffer,
    outputName: replaceExtension(originalName, ".docx"),
    outputMimeType: getMimeForExtension(".docx")
  };
}

export async function wordToPdf(buffer: Buffer, originalName: string) {
  const extracted = await mammoth.extractRawText({ buffer });
  let pdf = await PDFDocument.create();
  let page = pdf.addPage([595.28, 841.89]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const margin = 48;
  let y = page.getHeight() - margin;

  const lines = extracted.value
    .split(/\n+/)
    .flatMap((line) => wrapText(line.trim(), 90));

  for (const line of lines) {
    if (y < margin) {
      page = pdf.addPage([595.28, 841.89]);
      y = page.getHeight() - margin;
    }

    page.drawText(line || " ", {
      x: margin,
      y,
      size: fontSize,
      font,
      color: rgb(0.07, 0.14, 0.24),
      maxWidth: page.getWidth() - margin * 2
    });
    y -= 18;
  }

  const outputBuffer = Buffer.from(await pdf.save({ useObjectStreams: true }));
  return {
    outputBuffer,
    outputName: replaceExtension(originalName, ".pdf"),
    outputMimeType: getMimeForExtension(".pdf")
  };
}

function wrapText(line: string, maxCharacters: number) {
  if (line.length <= maxCharacters) {
    return [line];
  }

  const words = line.split(" ");
  const wrapped: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharacters) {
      if (current) {
        wrapped.push(current);
      }
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    wrapped.push(current);
  }

  return wrapped;
}
