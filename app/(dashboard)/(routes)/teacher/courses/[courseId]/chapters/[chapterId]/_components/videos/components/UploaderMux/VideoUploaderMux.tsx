"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { Upload, Loader2, XCircle, CircleOff } from "lucide-react";

// Textos para internacionalización (i18n)
const texts = {
  es: {
    dropzoneIdle: "Arrastra un video aquí o haz clic para seleccionar (.mp4, .webm)",
    dropzoneDragging: "Suelta el video aquí",
    uploadingState: "Subiendo video...",
    processingState: "Video enviado, procesando...",
    success: "Video subido y procesándose correctamente.",
    error: "Error al subir el video",
    errorFetchUrl: "Error al obtener URL de subida",
    errorMuxPut: "Error al enviar a Mux",
    invalidType: "Formato de video no permitido (.mp4 o .webm)",
    tryAgain: "Intentar de nuevo",
    preview: "Vista previa",
    selectVideo: "Seleccionar otro video",
  },
  en: {
    dropzoneIdle: "Drag 'n' drop a video here, or click to select (.mp4, .webm)",
    dropzoneDragging: "Drop the video here",
    uploadingState: "Uploading video...",
    processingState: "Video sent, processing...",
    success: "Video uploaded and processing successfully.",
    error: "Error uploading video",
    errorFetchUrl: "Error fetching upload URL",
    errorMuxPut: "Error sending to Mux",
    invalidType: "Invalid video format (.mp4 or .webm allowed)",
    tryAgain: "Try again",
    preview: "Preview",
    selectVideo: "Select another video",
  },
};

// Tipos para el estado del cargador
type UploadStatus = "idle" | "validating" | "uploading" | "success" | "error";

interface VideoUploaderProps {
  onUploadSuccess: (uploadId: string) => void; // Callback cuando la subida a Mux es exitosa
  lang?: "es" | "en"; // Idioma para los textos
}

export const VideoUploaderMux = ({
  onUploadSuccess,
  lang = "es",
}: VideoUploaderProps) => {
  const t = texts[lang]; // Textos según idioma seleccionado
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Crear y revocar la URL de previsualización para evitar memory leaks
  useEffect(() => {
    if (!videoFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(videoFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [videoFile]);

  // Resetea el estado del uploader
  const resetState = useCallback(() => {
    setStatus("idle");
    setVideoFile(null);
    setUploadProgress(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  // Función que maneja la selección y subida del archivo
  const handleFileSelectAndUpload = useCallback(
    async (file: File | null | undefined) => {
      if (!file) {
        if (status !== "idle") resetState();
        return;
      }

      setStatus("validating");

      // Validación del tipo de archivo
      const validTypes = ["video/mp4", "video/webm"];
      if (!validTypes.includes(file.type)) {
        toast.error(t.invalidType);
        setVideoFile(file);
        setStatus("error");
        return;
      }

      setVideoFile(file);
      setStatus("uploading");
      toast.info(t.uploadingState);

      try {
        // 1. Obtener la URL de subida desde la API
        const res = await fetch("/api/attachment/videos", { method: "POST" });
        if (!res.ok) {
          throw new Error(`${t.errorFetchUrl} (Status: ${res.status})`);
        }
        const { uploadUrl, uploadId } = await res.json();
        if (!uploadUrl || !uploadId) {
          throw new Error(t.errorFetchUrl + " (Invalid response)");
        }

        // 2. Subir el archivo usando XMLHttpRequest para seguimiento del progreso
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          // Evento para el progreso de subida
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percentage = Math.round((event.loaded * 100) / event.total);
              setUploadProgress(percentage);
            }
          });

          // Evento cuando la subida se completa exitosamente
          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setUploadProgress(100);
              resolve();
            } else {
              reject(new Error(`${t.errorMuxPut} (Status: ${xhr.status})`));
            }
          });

          // Evento para errores de red
          xhr.addEventListener("error", () => {
            reject(new Error(t.errorMuxPut + " (Network Error)"));
          });

          // Evento en caso de abortar la subida
          xhr.addEventListener("abort", () => {
            reject(new Error(t.errorMuxPut + " (Aborted)"));
          });

          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", file.type);
          setUploadProgress(0);
          setStatus("uploading");
          xhr.send(file);
        });

        // 3. Notificar y resetear el estado
        toast.success(t.processingState);
        setStatus("success");
        onUploadSuccess(uploadId);
        resetState();
      } catch (err) {
        console.error("Upload Error:", err);
        toast.error(err instanceof Error ? err.message : t.error);
        setStatus("error");
        setUploadProgress(null);
      }
    },
    [onUploadSuccess, t, resetState, status]
  );

  // Manejadores de eventos del input y drag-drop
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelectAndUpload(e.target.files?.[0]);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (status === "uploading") return;
      const file = e.dataTransfer.files?.[0];
      handleFileSelectAndUpload(file);
    },
    [status, handleFileSelectAndUpload]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (status !== "uploading") {
        setIsDragging(true);
      }
    },
    [status]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const triggerFileInput = useCallback(() => {
    if (status !== "uploading" && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [status]);

  return (
    <div className="w-full space-y-4">
      {/* Zona de drop/click */}
      <div
        onClick={triggerFileInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200 ease-in-out relative group
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
          ${status === "error" ? "border-red-500 bg-red-50" : ""}
          ${status === "uploading" ? "cursor-not-allowed border-gray-300 bg-gray-50" : ""}
        `}
      >
        {/* Input de archivo oculto */}
        <input
          ref={fileInputRef}
          id="video-upload-mux"
          type="file"
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={handleInputChange}
          disabled={status === "uploading"}
        />

        {/* Estado inactivo */}
        {status === "idle" && (
          <div className="flex flex-col items-center justify-center space-y-2 text-gray-500">
            <Upload className="w-10 h-10" />
            <span>{isDragging ? t.dropzoneDragging : t.dropzoneIdle}</span>
          </div>
        )}

        {/* Vista previa y overlays según el estado */}
        {previewUrl &&
          (status === "uploading" ||
            status === "error" ||
            status === "validating" ||
            status === "success") && (
            <div className="relative w-full max-w-md mx-auto">
              <video
                className={`rounded-md border w-full ${status === "error" ? "opacity-50" : ""}`}
                src={previewUrl}
                controls={status !== "uploading"}
                muted
                autoPlay={false}
              />
              {/* Overlay de carga con barra de progreso */}
              {status === "uploading" && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col items-center justify-center rounded-md text-TextCustom p-4 space-y-2">
                  <Loader2 className="h-8 w-8 animate-spin mb-2" />
                  <span>{t.uploadingState}</span>
                  {uploadProgress !== null && (
                    <div className="w-full bg-gray-600 rounded-full h-2.5 mt-2">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full transition-all duration-150 ease-linear"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  )}
                  {uploadProgress !== null && <span className="text-xs mt-1">{uploadProgress}%</span>}
                </div>
              )}
              {/* Overlay de error */}
              {status === "error" && (
                <div className="absolute inset-0 bg-red-900 bg-opacity-70 flex flex-col items-center justify-center rounded-md text-TextCustom p-4 space-y-2">
                  <XCircle className="h-8 w-8 mb-1" />
                  <span className="text-center text-sm font-semibold">{t.error}</span>
                  {videoFile && (
                    <span className="text-xs text-center truncate w-full px-2">{videoFile.name}</span>
                  )}
                  <span className="text-xs text-center">{t.invalidType}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      resetState();
                    }}
                    className="mt-2 bg-TextCustom text-red-700 px-3 py-1 rounded text-sm hover:bg-gray-100"
                  >
                    {t.tryAgain}
                  </button>
                </div>
              )}
            </div>
          )}

        {/* Mensaje de error sin preview */}
        {status === "error" && !previewUrl && (
          <div className="flex flex-col items-center justify-center space-y-2 text-red-600">
            <CircleOff className="w-10 h-10" />
            <span>{t.invalidType}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetState();
              }}
              className="mt-2 bg-red-600 text-TextCustom px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              {t.tryAgain}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
