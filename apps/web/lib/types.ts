export type JobItem = {
  id: string;
  originalName: string;
  outputName: string | null;
  status: string;
  outputSizeBytes: number | null;
  errorMessage: string | null;
};

export type ConversionJob = {
  id: string;
  toolSlug: string;
  status: string;
  fastMode: boolean;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  completedCount: number;
  originalCount: number;
  items: JobItem[];
};
