"use client";

import { useState, useCallback } from "react";
import { ImagePlus, Loader2, X, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteImageFromUrl } from "@/lib/supabase/storage";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const supabase = createClient();

  // Convert image to JPEG using canvas (handles HEIC, BMP, etc.)
  const convertToJpeg = useCallback(async (file: File): Promise<File> => {
    const supportedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (supportedTypes.includes(file.type)) return file;

    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Conversion failed"));
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
          },
          "image/jpeg",
          0.9
        );
      };
      img.onerror = () => reject(new Error("Could not load image. HEIC format may not be supported — please convert to JPG/PNG first."));
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError("");

      // Enforce the limit the UI promises
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setError("Image is too large — maximum size is 5MB.");
        setUploading(false);
        return;
      }

      // Convert unsupported formats
      let processedFile = file;
      try {
        processedFile = await convertToJpeg(file);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Image conversion failed. Please use JPG, PNG, or WebP.");
        setUploading(false);
        return;
      }

      // Only image extensions may land in the public bucket — a spoofed
      // name like "x.html" would otherwise be served as HTML (stored XSS).
      const ALLOWED_EXT: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
        gif: "image/gif",
      };
      const rawExt = (processedFile.name.split(".").pop() || "jpg").toLowerCase();
      const ext = ALLOWED_EXT[rawExt] ? rawExt : "jpg";
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, processedFile, { contentType: ALLOWED_EXT[ext] });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError(uploadError.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(data.path);

      // Remove the replaced image only after the new upload succeeded
      if (value) {
        await deleteImageFromUrl(value);
      }

      onChange(urlData.publicUrl);
      setUploading(false);
    },
    [supabase, onChange, value]
  );

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);

      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        uploadFile(file);
      } else {
        setError("Please drop an image file");
      }
    },
    [uploadFile]
  );

  // Click to browse — dynamically create input to avoid CSS/sandbox issues
  const handleBrowseClick = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.heic,.heif";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) uploadFile(file);
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }, [uploadFile]);

  // Show current image
  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative inline-block">
          <img
            src={value}
            alt="Product"
            className="w-32 h-32 rounded-xl object-cover border border-border"
          />
          <button
            type="button"
            onClick={async () => {
              await deleteImageFromUrl(value);
              onChange("");
            }}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-white flex items-center justify-center shadow-md hover:bg-destructive/80"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={`
          flex flex-col items-center justify-center gap-3 p-8 rounded-xl border-2 border-dashed cursor-pointer transition-all
          ${dragOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-accent/50"
          }
          ${uploading ? "opacity-60 pointer-events-none" : ""}
        `}
      >
        {uploading ? (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium">
                Drop an image here or <span className="text-primary underline">browse</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WebP up to 5MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}
    </div>
  );
}
