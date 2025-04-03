"use client";

import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Loader2, UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface FileUploaderProps {
  onChange?: (url: string) => void;
  onSuccess?: (result: any) => void;
  value?: string;
  folder?: string;
}

const path = "/api/cloudinary/upload/"

const FileUploader = ({ onChange, onSuccess, value, folder }: FileUploaderProps) => {
  const [preview, setPreview] = useState<string | null>(value || null);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onloadend = async () => {
      // Display local preview first
      setPreview(reader.result as string);

      try {
        // Upload to API
        const response = await fetch(path, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: reader.result,
            folder: folder || `resources`,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Error uploading image");
        }

        const data = await response.json();
        
        // Update the preview with the URL from Cloudinary
        setPreview(data.result.secure_url);
        
        // Call onChange with the URL if provided
        if (onChange) {
          onChange(data.result.secure_url);
        }
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(data.result);
        }
        
        toast.success("Image uploaded successfully");
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(error instanceof Error ? error.message : "Failed to upload image");
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setFile(file);
        uploadImage(file);
      }
    },
    [onChange, onSuccess]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
  });

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    setFile(null);
    if (onChange) {
      onChange("");
    }
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer h-64 relative flex flex-col items-center justify-center ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-gray-300 hover:border-primary"
        }`}
      >
        <input {...getInputProps()} ref={fileInputRef} />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-2" />
            <p className="text-sm text-gray-500">Subiendo imagen...</p>
          </div>
        ) : preview ? (
          <div className="relative w-full h-full">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500 mb-1">
              Arrastra una imagen o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG, GIF hasta 10MB
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Seleccionar archivo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;