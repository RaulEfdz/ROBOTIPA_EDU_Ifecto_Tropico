"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

const texts = {
  es: {
    uploadInstructions: "Selecciona un archivo de video (.mp4 o .webm)",
    uploadingState: "Subiendo video a Mux...",
    success: "Video enviado, procesando en Mux...",
    error: "Error al subir el video",
  },
  en: {
    uploadInstructions: "Select a video file (.mp4 or .webm)",
    uploadingState: "Uploading video to Mux...",
    success: "Video uploaded, processing in Mux...",
    error: "Error uploading video",
  },
};

interface VideoUploaderProps {
  onUploadSuccess: (uploadId: string) => void; // Mux Upload ID
  lang?: "es" | "en";
}

export const VideoUploader = ({
  onUploadSuccess,
  lang = "es",
}: VideoUploaderProps) => {
  const t = texts[lang];
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    try {
      // Paso 1: obtener URL de subida desde tu backend
      const res = await fetch("/api/attachment/videos", { method: "POST" });
      const { uploadUrl, uploadId } = await res.json();

      // Paso 2: subir el archivo a Mux
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Mux upload failed");

      toast.success(t.success);
      onUploadSuccess(uploadId); // Retorna el uploadId para seguimiento
    } catch (err) {
      console.error(err);
      toast.error(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label
        htmlFor="video-upload"
        className="cursor-pointer bg-blue-600 text-white rounded-md px-4 py-2 text-sm hover:bg-blue-700 inline-flex items-center gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {loading ? t.uploadingState : t.uploadInstructions}
      </label>

      <input
        id="video-upload"
        type="file"
        accept="video/mp4,video/webm"
        className="hidden"
        onChange={handleFileChange}
        disabled={loading}
      />
    </div>
  );
};
