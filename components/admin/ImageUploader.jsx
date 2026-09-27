"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "@/lib/toast/toast";
import OptimizedImage from "@/components/ui/OptimizedImage";
import { uploadToImageKit } from "@/lib/upload/uploadImage";

/**
 * Multi-image uploader for admin forms.
 * images: [{ url, fileId }]
 */
export default function ImageUploader({
  images = [],
  onChange,
  folder = "/products",
  maxFiles = 10,
  label = "Product images",
  helpText = "PNG or JPG. First image is used as the main catalog photo.",
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  async function handleFiles(fileList) {
    const files = Array.from(fileList || []).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (!files.length) {
      toast.error("Please choose image files");
      return;
    }

    const remaining = maxFiles - images.length;
    if (remaining <= 0) {
      toast.error(`You can upload up to ${maxFiles} images`);
      return;
    }

    const selected = files.slice(0, remaining);
    setUploading(true);

    try {
      const uploaded = [];

      for (const file of selected) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 10MB`);
          continue;
        }

        const image = await uploadToImageKit(file, folder);
        uploaded.push(image);
      }

      if (uploaded.length) {
        onChange?.([...images, ...uploaded]);
        toast.success(
          uploaded.length === 1
            ? "Image uploaded"
            : `${uploaded.length} images uploaded`,
        );
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(index) {
    onChange?.(images.filter((_, i) => i !== index));
  }

  function moveToFront(index) {
    if (index === 0) return;
    const next = [...images];
    const [item] = next.splice(index, 1);
    next.unshift(item);
    onChange?.(next);
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs opacity-60">{helpText}</p>
      </div>

      <div
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-base-300 bg-base-200/40 px-4 py-8 text-center transition hover:border-primary/50 hover:bg-base-200/70"
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          if (!uploading) handleFiles(event.dataTransfer.files);
        }}
      >
        {uploading ? (
          <Loader2 className="animate-spin text-primary" size={28} />
        ) : (
          <Upload className="opacity-60" size={28} />
        )}
        <p className="text-sm font-medium">
          {uploading ? "Uploading..." : "Click or drop images here"}
        </p>
        <p className="text-xs opacity-60">
          {images.length}/{maxFiles} images
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => handleFiles(event.target.files)}
        />
      </div>

      {images.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {images.map((image, index) => (
            <div
              key={image.fileId || image.url || index}
              className="group relative overflow-hidden rounded-xl border border-base-300 bg-base-100"
            >
              <OptimizedImage
                src={image.url}
                alt=""
                width={320}
                height={320}
                className="aspect-square w-full object-cover"
                transformation={[{ width: 320, height: 320, quality: 75 }]}
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/55 p-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-white"
                  onClick={() => moveToFront(index)}
                  title="Set as main"
                >
                  <ImagePlus size={14} />
                  {index === 0 ? "Main" : "Set main"}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-xs text-error"
                  onClick={() => removeAt(index)}
                  title="Remove"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {index === 0 ? (
                <span className="badge badge-primary badge-sm absolute left-2 top-2">
                  Main
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
