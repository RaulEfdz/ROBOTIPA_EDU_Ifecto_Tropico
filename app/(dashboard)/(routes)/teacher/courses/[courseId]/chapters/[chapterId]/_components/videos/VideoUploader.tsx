"use client";

import { useState, useEffect, SetStateAction } from "react";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";
import { Upload, Loader2 } from "lucide-react";

type UploadthingEndpoints = "chapterVideo" | "chapterVideoUpload" | "courseImage" | "courseAttachment";

interface VideoUploaderProps {
  endpoint?: UploadthingEndpoints;
  onUploadSuccess: (url: string) => void;
  lang?: "es" | "en";
}

const texts = {
  es: {
    uploadInstructions: "Subir archivo de video",
    uploadingState: "Subiendo archivo...",
    processingState: "Procesando video...",
    success: "Video subido con éxito",
    error: "Error al subir el video",
    dragInstructions: "Arrastra y suelta o haz clic para seleccionar",
    fileTypes: "Formatos aceptados: .mp4, .webm",
    maxSize: "Tamaño máximo: 100MB"
  },
  en: {
    uploadInstructions: "Upload video file",
    uploadingState: "Uploading file...",
    processingState: "Processing video...",
    success: "Video uploaded successfully",
    error: "Error uploading video",
    dragInstructions: "Drag and drop or click to select",
    fileTypes: "Accepted formats: .mp4, .webm",
    maxSize: "Maximum size: 100MB"
  },
};

export const VideoUploader = ({
  endpoint = "chapterVideo",
  onUploadSuccess,
  lang = "es",
}: VideoUploaderProps) => {
  const t = texts[lang];
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);

  // Reset progress when component unmounts or when not uploading
  useEffect(() => {
    if (!uploading) {
      setUploadProgress(0);
    }
  }, [uploading]);

  const handleUploadStart = () => {
    setUploading(true);
    setUploadProgress(0);
  };

interface UploadResponse {
    url: string;
}

const handleUploadComplete = (res?: UploadResponse[]) => {
    setUploading(false);
    setProcessing(true);

    if (!res || res.length === 0) {
        setProcessing(false);
        toast.error(t.error);
        return;
    }

    // Simulate processing time (remove in production if not needed)
    setTimeout(() => {
        setProcessing(false);
        const url = res[0].url;
        if (url) {
            toast.success(t.success);
            onUploadSuccess(url);
        }
    }, 1000);
};

const handleUploadError = (error: Error) => {
    setUploading(false);
    setProcessing(false);
    console.error("Upload error:", error);
    toast.error(t.error);
};

  const handleUploadProgress = (progress: SetStateAction<number>) => {
    setUploadProgress(progress);
  };

  return (
    <div className="space-y-10">
      <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <UploadButton
          endpoint={endpoint}
          onUploadBegin={handleUploadStart}
          onClientUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          onUploadProgress={handleUploadProgress}
          appearance={{
            button: "bg-blue-600 text-white rounded-md px-4 py-2 text-sm hover:bg-blue-700 transition-colors w-full flex items-center justify-center",
            container: "flex flex-col items-center w-full gap-2",
            allowedContent: "text-xs text-gray-500 dark:text-gray-400 text-center mt-1"
          }}
          content={{
            button({ isUploading }) {
              return (
                <>
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  {isUploading ? t.uploadingState : t.uploadInstructions}
                </>
              );
            },
            allowedContent() {
              return (
                <div className="space-y-1">
                  <p>{t.dragInstructions}</p>
                  <p>{t.fileTypes}</p>
                  <p>{t.maxSize}</p>
                </div>
              );
            }
          }}
        />
      </div>

      {(uploading || processing) && (
        <div className="space-y-2">
          {uploading && (
            <>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300 ease-out" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                {t.uploadingState} ({uploadProgress}%)
              </p>
            </>
          )}
          
          {processing && !uploading && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.processingState}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};