import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
        transition-all duration-200
        ${
          isDragActive
            ? "border-receipt-stamp bg-receipt-stamp/5 scale-[1.02]"
            : "border-receipt-line hover:border-ink-300 hover:bg-ink-50/50"
        }
      `}
    >
      <input {...getInputProps()} />
      <CloudArrowUpIcon
        className={`w-12 h-12 mx-auto mb-3 ${
          isDragActive ? "text-receipt-stamp" : "text-ink-300"
        }`}
      />
      <p className="font-medium text-ink-600 mb-1">
        {isDragActive ? "Drop your receipt here" : "Drag & drop a receipt image"}
      </p>
      <p className="text-sm text-ink-400">
        or click to browse • JPEG, PNG, WebP up to 10MB
      </p>
    </div>
  );
}
