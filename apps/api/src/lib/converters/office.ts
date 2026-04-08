import { AlignmentType, Document, HeadingLevel, Packer, Paragraph } from "docx";
import mammoth from "mammoth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import pdfParse from "pdf-parse";
import { getMimeForExtension, replaceExtension } from "./shared.js";

export async function pdfToWord(buffer: Buffer, originalName: string) {
  const parsed = await pdfParse(buffer);
  const paragraphs = buildPdfParagraphs(parsed.text);

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

function buildPdfParagraphs(rawText: string) {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => normalizeWhitespace(line))
    .filter((line, index, allLines) => !isStandalonePageNumber(line, index, allLines));

  const paragraphs: Paragraph[] = [];
  let buffer: string[] = [];

  const flushBuffer = () => {
    if (buffer.length === 0) {
      return;
    }

    paragraphs.push(
      new Paragraph({
        text: mergeWrappedLines(buffer),
        spacing: {
          after: 160,
          line: 300
        }
      }),
    );
    buffer = [];
  };

  for (let index = 0; index < lines.length; index += 1) {
    const currentLine = normalizeExtractedText(lines[index]!.trim());
    const nextLine = normalizeExtractedText(lines[index + 1]?.trim() ?? "");

    if (!currentLine) {
      flushBuffer();
      continue;
    }

    const line = isEquationLine(currentLine) && isEquationNumber(nextLine) ? `${currentLine} ${nextLine}` : currentLine;

    if (line !== currentLine) {
      index += 1;
    }

    if (isHeading(line)) {
      flushBuffer();
      paragraphs.push(
        new Paragraph({
          text: line,
          heading: pickHeadingLevel(line),
          spacing: {
            before: 220,
            after: 120
          },
          alignment: isCenteredHeading(line) ? AlignmentType.CENTER : AlignmentType.LEFT
        }),
      );
      continue;
    }

    if (isBulletItem(line)) {
      flushBuffer();
      paragraphs.push(
        new Paragraph({
          text: styleMathText(stripBulletPrefix(line)),
          bullet: {
            level: 0
          },
          spacing: {
            after: 80
          }
        }),
      );
      continue;
    }

    if (isEnumeratedItem(line) && !isEquationLine(line)) {
      flushBuffer();
      paragraphs.push(
        new Paragraph({
          text: styleMathText(line),
          spacing: {
            after: 80
          }
        }),
      );
      continue;
    }

    if (isEquationLine(line)) {
      flushBuffer();
      paragraphs.push(
        new Paragraph({
          text: styleMathText(line),
          spacing: {
            before: 80,
            after: 120
          },
          alignment: AlignmentType.CENTER
        }),
      );
      continue;
    }

    buffer.push(line);
  }

  flushBuffer();

  return paragraphs.length > 0 ? paragraphs : [new Paragraph("No extractable text found in the PDF.")];
}

function normalizeWhitespace(line: string) {
  return line.replace(/\t+/g, " ").replace(/[ ]{2,}/g, "\t").trimEnd();
}

function normalizeExtractedText(line: string) {
  return line
    .replace(/â€¢/g, "\u2022")
    .replace(/â€™/g, "'")
    .replace(/â€˜/g, "'")
    .replace(/â€œ|â€/g, '"')
    .replace(/â€“|â€”/g, "-")
    .replace(/Â/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\u00ad/g, "")
    .normalize("NFKC")
    .replace(/[\u2018\u2019']/g, "\u2032")
    .replace(/\u03d5/g, "\u03c6")
    .replace(/\u2212/g, "-");
}

function isStandalonePageNumber(line: string, index: number, lines: string[]) {
  const trimmed = line.trim();
  if (!/^\d{1,3}$/.test(trimmed)) {
    return false;
  }

  const previous = lines[index - 1]?.trim() ?? "";
  const next = lines[index + 1]?.trim() ?? "";
  return previous.length > 0 && next.length > 0;
}

function isHeading(line: string) {
  return (
    KNOWN_HEADINGS.has(line.toLowerCase()) ||
    /:$/.test(line) ||
    (line.length > 4 && line.length < 120 && line === line.toUpperCase() && /[A-Z]/.test(line) && !isEquationLine(line))
  );
}

function isCenteredHeading(line: string) {
  return line === line.toUpperCase() && line.length < 80;
}

function pickHeadingLevel(line: string) {
  if (line === line.toUpperCase() && line.length < 80) {
    return HeadingLevel.HEADING_1;
  }

  return HeadingLevel.HEADING_2;
}

function isBulletItem(line: string) {
  return /^(?:\u2022|â€¢|-)\s+/.test(line);
}

function stripBulletPrefix(line: string) {
  return line.replace(/^(?:\u2022|â€¢|-)\s+/, "");
}

function isEnumeratedItem(line: string) {
  return /^(\d+[\.\)]|[ivxlcdm]+[\)])\s+/i.test(line);
}

function isEquationLine(line: string) {
  return (
    /[=]/.test(line) ||
    /\b[A-Za-z\u0391-\u03C9]\d*\u2032?\s*[+\-/*]\s*[A-Za-z\u0391-\u03C9(]/.test(line) ||
    /\b(?:cos|sin|tan)\s*[A-Za-z\u0391-\u03C9]/i.test(line) ||
    /\bK\d+\b/.test(line)
  );
}

function isEquationNumber(line: string) {
  return /^\(?\d+(?:\.\d+)*\)?$/.test(line);
}

function mergeWrappedLines(lines: string[]) {
  return lines.reduce((combined, current) => {
    const styled = styleMathText(current);

    if (!combined) {
      return styled;
    }

    if (combined.endsWith("-")) {
      return `${combined.slice(0, -1)}${styled}`;
    }

    return `${combined} ${styled}`;
  }, "");
}

function styleMathText(text: string) {
  const normalized = normalizeExtractedText(text);

  let styled = normalized
    .replace(/\bK(\d+)\b/g, (_match, digits: string) => `K${toSuperscriptDigits(digits)}`)
    .replace(/\b([A-Za-z\u0391-\u03C9])(\d+)(\u2032)?\b/g, (_match, symbol: string, digits: string, prime?: string) => {
      if (symbol === "K" && isEquationLine(normalized)) {
        return `${symbol}${toSuperscriptDigits(digits)}${prime ?? ""}`;
      }

      return `${symbol}${toSubscriptDigits(digits)}${prime ?? ""}`;
    });

  if (isEquationLine(styled)) {
    styled = styled
      .replace(/\s*=\s*/g, " = ")
      .replace(/\s*\/\s*/g, " / ")
      .replace(/\s*\+\s*/g, " + ")
      .replace(/\s*-\s*/g, " - ");
  }

  return styled.replace(/[ ]{2,}/g, " ").trim();
}

function toSubscriptDigits(digits: string) {
  return digits
    .split("")
    .map((digit) => SUBSCRIPT_DIGITS[digit] ?? digit)
    .join("");
}

function toSuperscriptDigits(digits: string) {
  return digits
    .split("")
    .map((digit) => SUPERSCRIPT_DIGITS[digit] ?? digit)
    .join("");
}

const KNOWN_HEADINGS = new Set([
  "prerequisites",
  "expected learning outcomes",
  "course content",
  "laboratory/practical exercises",
  "course assessment",
  "ref books:",
  "ref books",
  "introduction",
  "example",
  "applications of ampere's law",
  "applications of ampere\u2032s law"
]);

const SUBSCRIPT_DIGITS: Record<string, string> = {
  "0": "\u2080",
  "1": "\u2081",
  "2": "\u2082",
  "3": "\u2083",
  "4": "\u2084",
  "5": "\u2085",
  "6": "\u2086",
  "7": "\u2087",
  "8": "\u2088",
  "9": "\u2089"
};

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  "0": "\u2070",
  "1": "\u00b9",
  "2": "\u00b2",
  "3": "\u00b3",
  "4": "\u2074",
  "5": "\u2075",
  "6": "\u2076",
  "7": "\u2077",
  "8": "\u2078",
  "9": "\u2079"
};

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
