"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type FileDropzoneProps = {
  files: File[];
  acceptedExtensions: string[];
  maxFiles: number;
  onFilesChange: (files: File[]) => void;
};

export function FileDropzone({ files, acceptedExtensions, maxFiles, onFilesChange }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging] = useState(false);

  const pickFiles = (nextList: FileList | null) => {
    if (!nextList) {
      return;
    }

    const next = Array.from(nextList).slice(0, maxFiles);
    onFilesChange(next);
  };

  return (
    <div
      className={cn(
        "rounded-[2rem] border-2 border-dashed p-6 transition sm:p-8",
        dragging ? "border-coral bg-coral/5" : "border-ink/15 bg-white",
      )}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        pickFiles(event.dataTransfer.files);
      }}
    >
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        multiple={maxFiles > 1}
        onChange={(event) => pickFiles(event.target.files)}
      />
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="rounded-full bg-teal/10 p-4 text-teal">
          <UploadCloud className="h-8 w-8" />
        </div>
        <div>
          <p className="text-lg font-semibold text-ink">Drag and drop your files</p>
          <p className="mt-2 text-sm text-ink/70">Accepted: {acceptedExtensions.join(", ")}. Up to {maxFiles} files per upload.</p>
        </div>
        <button
          type="button"
          className="min-h-12 rounded-2xl bg-ink px-5 font-semibold text-white"
          onClick={() => inputRef.current?.click()}
        >
          Choose files
        </button>
      </div>
      {files.length > 0 ? (
        <div className="mt-6 grid gap-3">
          {files.map((file) => (
            <div key={file.name + file.size} className="rounded-2xl bg-cream px-4 py-3 text-left text-sm text-ink">
              {file.name}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
