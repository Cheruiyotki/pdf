import path from "node:path";

export function replaceExtension(fileName: string, newExtension: string) {
  const parsed = path.parse(fileName);
  return `${parsed.name}${newExtension}`;
}

export function getMimeForExtension(extension: string) {
  switch (extension) {
    case ".pdf":
      return "application/pdf";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".zip":
      return "application/zip";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}
