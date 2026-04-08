"use client";

import { getApiUrl } from "./api";

export type UploadJobInput = {
  toolSlug: string;
  files: File[];
  options?: Record<string, string | number | boolean>;
  fastMode?: boolean;
  token?: string | null;
  onProgress?: (progress: number) => void;
};

export async function uploadJob<T>(input: UploadJobInput): Promise<T> {
  const formData = new FormData();
  formData.set("toolSlug", input.toolSlug);
  formData.set("fastMode", input.fastMode ? "true" : "false");

  if (input.options) {
    formData.set("options", JSON.stringify(input.options));
  }

  input.files.forEach((file) => formData.append("files", file));

  return new Promise<T>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `${getApiUrl()}/jobs`);

    if (input.token) {
      request.setRequestHeader("Authorization", `Bearer ${input.token}`);
    }

    request.upload.onprogress = (event) => {
      if (event.lengthComputable && input.onProgress) {
        input.onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    request.onload = () => {
      try {
        const data = JSON.parse(request.responseText);
        if (request.status >= 200 && request.status < 300) {
          resolve(data as T);
          return;
        }

        reject(new Error(data.message ?? "Upload failed."));
      } catch (error) {
        reject(error);
      }
    };

    request.onerror = () => reject(new Error("Upload failed."));
    request.send(formData);
  });
}
