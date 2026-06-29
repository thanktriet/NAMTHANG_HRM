"use client";

import { useCallback, useState } from "react";
import { Upload, File as FileIcon, X, Image, Video } from "lucide-react";
import { clsx } from "clsx";

interface FileUploadProps {
  label: string;
  accept?: string;
  onChange: (file: File | null) => void;
  value?: File | null;
  error?: string;
  type?: "document" | "image" | "video";
}

export function FileUpload({ label, accept, onChange, value, error, type = "document" }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File | null) => {
      onChange(file);
      if (file && type === "image") {
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    },
    [onChange, type]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0] || null;
      handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      handleFile(file);
    },
    [handleFile]
  );

  const Icon = type === "image" ? Image : type === "video" ? Video : FileIcon;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={clsx(
          "relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
          {
            "border-primary bg-primary-50": isDragging,
            "border-red-300 bg-red-50": error,
            "border-gray-300 hover:border-primary": !isDragging && !error,
          }
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {value ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              {preview ? (
                <img src={preview} alt="Preview" className="w-10 h-10 object-cover rounded" />
              ) : (
                <Icon className="w-5 h-5 text-primary shrink-0" />
              )}
              <span className="text-sm text-gray-700 truncate">{value.name}</span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleFile(null);
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-2">
            <Upload className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-500">Nhấn hoặc kéo thả file</span>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
