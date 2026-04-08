export type ToolCategory = "document" | "image";

export type ToolDefinition = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  category: ToolCategory;
  accepts: string[];
  outputs: string[];
  batchFriendly: boolean;
  hero: string;
  steps: string[];
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  suggestedNext: string[];
};

export const tools: ToolDefinition[] = [
  {
    slug: "pdf-to-word",
    title: "PDF to Word Converter",
    shortTitle: "PDF to Word",
    description: "Turn PDFs into editable Word documents with a high-accuracy extraction flow.",
    category: "document",
    accepts: [".pdf"],
    outputs: [".docx"],
    batchFriendly: true,
    hero: "Extract text and structure from PDFs into editable DOCX files in a few taps.",
    steps: ["Upload your PDF", "QuickConvert processes the file securely", "Download your editable Word file"],
    seoTitle: "PDF to Word Converter | QuickConvert",
    seoDescription: "Convert PDF files to editable Word documents online with secure temporary processing and fast turnaround.",
    keywords: ["pdf to word", "convert pdf to docx", "editable word from pdf"],
    suggestedNext: ["compress-pdf", "word-to-pdf"]
  },
  {
    slug: "word-to-pdf",
    title: "Word to PDF Converter",
    shortTitle: "Word to PDF",
    description: "Create clean PDF exports from DOCX files with consistent layout and sharing-ready output.",
    category: "document",
    accepts: [".docx"],
    outputs: [".pdf"],
    batchFriendly: true,
    hero: "Turn DOCX files into polished PDFs for sharing, printing, and archiving.",
    steps: ["Drop your DOCX", "We render a PDF copy", "Download and share instantly"],
    seoTitle: "Word to PDF Converter | QuickConvert",
    seoDescription: "Convert DOCX files to PDF in seconds with mobile-first upload and secure file deletion.",
    keywords: ["word to pdf", "docx to pdf", "convert word file to pdf"],
    suggestedNext: ["compress-pdf", "merge-pdf"]
  },
  {
    slug: "merge-pdf",
    title: "Merge PDF Files",
    shortTitle: "Merge PDF",
    description: "Combine multiple PDFs into a single file with drag-and-drop ordering and batch upload.",
    category: "document",
    accepts: [".pdf"],
    outputs: [".pdf"],
    batchFriendly: true,
    hero: "Merge invoices, reports, and scans into one PDF without storing files long term.",
    steps: ["Upload multiple PDFs", "QuickConvert merges them in order", "Download a single combined PDF"],
    seoTitle: "Merge PDF Online | QuickConvert",
    seoDescription: "Merge multiple PDF files online with a fast, privacy-first workflow designed for mobile and desktop.",
    keywords: ["merge pdf", "combine pdf files", "pdf merger"],
    suggestedNext: ["compress-pdf", "split-pdf"]
  },
  {
    slug: "split-pdf",
    title: "Split PDF Pages",
    shortTitle: "Split PDF",
    description: "Split one PDF into separate pages or page groups and download them as a ZIP package.",
    category: "document",
    accepts: [".pdf"],
    outputs: [".zip"],
    batchFriendly: false,
    hero: "Break apart large PDFs into page-level downloads for editing and sharing.",
    steps: ["Upload a PDF", "Choose page rules or use auto split", "Download a ZIP of split pages"],
    seoTitle: "Split PDF Online | QuickConvert",
    seoDescription: "Split PDF pages online with secure temporary processing, page-level exports, and clean ZIP downloads.",
    keywords: ["split pdf", "extract pdf pages", "pdf page splitter"],
    suggestedNext: ["merge-pdf", "compress-pdf"]
  },
  {
    slug: "compress-pdf",
    title: "Compress PDF",
    shortTitle: "Compress PDF",
    description: "Reduce PDF size for email, sharing, and uploads while keeping pages readable.",
    category: "document",
    accepts: [".pdf"],
    outputs: [".pdf"],
    batchFriendly: true,
    hero: "Shrink PDF file sizes fast for easier uploads, sharing, and storage control.",
    steps: ["Upload your PDF", "Choose balanced compression", "Download a smaller file"],
    seoTitle: "Compress PDF Online | QuickConvert",
    seoDescription: "Compress PDF files online with smart size reduction, secure deletion, and fast downloads.",
    keywords: ["compress pdf", "reduce pdf size", "pdf compressor"],
    suggestedNext: ["merge-pdf", "pdf-to-word"]
  },
  {
    slug: "image-compressor",
    title: "Image Compressor",
    shortTitle: "Image Compressor",
    description: "Compress JPG, PNG, and WebP files with clear quality settings and instant upload feedback.",
    category: "image",
    accepts: [".jpg", ".jpeg", ".png", ".webp"],
    outputs: [".jpg", ".png", ".webp"],
    batchFriendly: true,
    hero: "Shrink images for websites, messaging, and uploads without slowing down your workflow.",
    steps: ["Drop one or more images", "QuickConvert compresses in parallel", "Download lighter files"],
    seoTitle: "Image Compressor | QuickConvert",
    seoDescription: "Compress JPG, PNG, and WebP images online with responsive upload flows and secure deletion.",
    keywords: ["image compressor", "compress jpg", "compress png"],
    suggestedNext: ["jpg-png-converter", "image-resize"]
  },
  {
    slug: "jpg-png-converter",
    title: "JPG PNG Converter",
    shortTitle: "JPG ↔ PNG",
    description: "Convert JPG to PNG or PNG to JPG in one tap, with optional compression and batch support.",
    category: "image",
    accepts: [".jpg", ".jpeg", ".png"],
    outputs: [".jpg", ".png"],
    batchFriendly: true,
    hero: "Swap between JPG and PNG formats instantly for design, uploads, and sharing.",
    steps: ["Upload JPG or PNG", "QuickConvert chooses the opposite format", "Download the converted image"],
    seoTitle: "JPG to PNG and PNG to JPG Converter | QuickConvert",
    seoDescription: "Convert JPG to PNG and PNG to JPG online with batch processing, fast queues, and mobile-friendly uploads.",
    keywords: ["jpg to png", "png to jpg", "image converter"],
    suggestedNext: ["image-compressor", "image-resize"]
  },
  {
    slug: "image-resize",
    title: "Image Resizer",
    shortTitle: "Image Resizer",
    description: "Resize images for web, profile photos, and uploads with simple width and height presets.",
    category: "image",
    accepts: [".jpg", ".jpeg", ".png", ".webp"],
    outputs: [".jpg", ".png", ".webp"],
    batchFriendly: true,
    hero: "Resize images with touch-friendly controls and export-ready output sizes.",
    steps: ["Upload your image", "Set dimensions or choose a preset", "Download the resized image"],
    seoTitle: "Image Resizer Online | QuickConvert",
    seoDescription: "Resize images online for web, social, and documents with fast secure processing on any screen size.",
    keywords: ["image resizer", "resize jpg", "resize png"],
    suggestedNext: ["image-compressor", "jpg-png-converter"]
  }
];

export const toolMap = Object.fromEntries(tools.map((tool) => [tool.slug, tool]));

export const toolSlugs = tools.map((tool) => tool.slug);
