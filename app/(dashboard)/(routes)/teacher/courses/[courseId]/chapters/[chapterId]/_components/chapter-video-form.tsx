"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Pencil, PlusCircle, Video, Check, X, ArrowRight, Link, Upload, AlertCircle
} from "lucide-react";
import { Chapter } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchData } from "../../../../custom/fetchData";
import { toast } from "sonner";
import { VideoUploader } from "./videos/mux";

const texts = {
  es: {
    title: "4 - Video del capítulo",
    choose: "¿Cómo deseas subir tu video?",
    youtube: "Pegar enlace de YouTube",
    file: "Subir archivo de video",
    editButton: "Editar video",
    addButton: "Agregar video",
    cancelButton: "Cancelar",
    saveButton: "Guardar",
    placeholder: "Pega la URL del video de YouTube",
    successMessage: "Video actualizado",
    errorMessage: "Error al actualizar el video",
    youtubeError: "URL de YouTube no válida",
    processingMessage: "El video puede tardar unos minutos en procesarse.",
    readyStatus: "Video listo",
    noVideo: "Sin video",
    goBack: "Volver",
  },
  en: {
    title: "4 - Chapter Video",
    choose: "How do you want to upload your video?",
    youtube: "Paste YouTube link",
    file: "Upload video file",
    editButton: "Edit video",
    addButton: "Add video",
    cancelButton: "Cancel",
    saveButton: "Save",
    placeholder: "Paste YouTube video URL",
    successMessage: "Video updated",
    errorMessage: "Error updating video",
    youtubeError: "Invalid YouTube URL",
    processingMessage: "The video may take a few minutes to process.",
    readyStatus: "Video ready",
    noVideo: "No video",
    goBack: "Go back",
  },
};

const getYouTubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|youtu\.be\/|\/v\/|\/e\/|\.be\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

interface ChapterVideoFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
  lang?: "es" | "en";
}

export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
  lang = "es",
}: ChapterVideoFormProps) => {
  const t = texts[lang];
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [videoUrl, setVideoUrl] = useState(initialData.videoUrl || "");
  const [mode, setMode] = useState<"youtube" | "file" | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    // Clear validation errors when URL changes
    if (validationError) setValidationError(null);
  }, [videoUrl]);

  const toggleEdit = () => {
    setVideoUrl(initialData.videoUrl || "");
    setIsEditing((prev) => !prev);
    setMode(null);
    setValidationError(null);
  };

  const validateYouTubeUrl = (url: string) => {
    return !!getYouTubeVideoId(url);
  };

  const onSubmit = async () => {
    if (!videoUrl) return;

    if (mode === "youtube" && !validateYouTubeUrl(videoUrl)) {
      setValidationError(t.youtubeError);
      return;
    }

    setIsSaving(true);
    try {
      await fetchData({
        values: { videoUrl },
        courseId,
        path: `/api/courses/${courseId}/chapters/${chapterId}/video/create`,
        method: "POST",
        callback: () => {
          toast.success(t.successMessage);
          setIsEditing(false);
          setMode(null);
          router.refresh();
        },
      });
    } catch (error) {
      console.error("Video update error:", error);
      toast.error(t.errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const videoId = getYouTubeVideoId(videoUrl);
  const isYouTube = !!videoId;
  const isFile = !isYouTube && videoUrl;

  return (
    <div className="mb-6 bg-white dark:bg-gray-850 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {t.title}
        </h3>

        {!isEditing && (
          <Button
            onClick={toggleEdit}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            {initialData.videoUrl ? (
              <>
                <Pencil className="h-4 w-4 mr-1" />
                {t.editButton}
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-1" />
                {t.addButton}
              </>
            )}
          </Button>
        )}
      </div>

      <div className="relative mb-4 h-[280px] rounded-md overflow-hidden border bg-slate-100 dark:bg-gray-800 flex items-center justify-center">
        {isYouTube ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video preview"
            className="rounded-md"
            allowFullScreen
          />
        ) : isFile ? (
          <video controls className="w-full h-full object-cover rounded-md">
            <source src={videoUrl} />
          </video>
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500">
            <Video className="h-10 w-10 mb-2" />
            <span className="text-sm">{t.noVideo}</span>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="space-y-4">
          {!mode && (
            <div className="space-y-2">
              <p className="text-sm text-gray-500">{t.choose}</p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setMode("youtube")} 
                  variant="outline"
                  className="flex items-center transition-colors hover:bg-blue-50 dark:hover:bg-gray-700"
                >
                  <Link className="w-4 h-4 mr-2" /> 
                  {t.youtube}
                </Button>
                <Button 
                  onClick={() => setMode("file")} 
                  variant="outline"
                  className="flex items-center transition-colors hover:bg-blue-50 dark:hover:bg-gray-700"
                >
                  <Upload className="w-4 h-4 mr-2" /> 
                  {t.file}
                </Button>
              </div>
            </div>
          )}

          {mode === "youtube" && (
            <>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder={t.placeholder}
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className={`h-10 text-sm border-gray-200 dark:border-gray-700 pr-10 ${
                      validationError ? "border-red-300 focus:ring-red-500" : ""
                    }`}
                  />
                  {videoUrl && validateYouTubeUrl(videoUrl) && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Check className="h-4 w-4 text-green-500" />
                    </div>
                  )}
                </div>
                
                {validationError && (
                  <div className="flex items-center text-red-500 text-xs mt-1">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {validationError}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  onClick={() => mode ? setMode(null) : toggleEdit()}
                  variant="outline"
                  size="sm"
                  className="h-9"
                >
                  <X className="h-4 w-4 mr-1 text-gray-500" />
                  {mode ? t.goBack : t.cancelButton} qqqw
                </Button>
                <Button
                  onClick={onSubmit}
                  disabled={!videoUrl || isSaving || !!validationError}
                  className="h-9 bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? (
                    <div className="h-4 w-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check className="h-4 w-4 mr-1 text-white" />
                  )}
                  {t.saveButton}
                </Button>
              </div>
            </>
          )}

          {mode === "file" && (
            <div className="space-y-4">
              <VideoUploader
              
                onUploadSuccess={(url) => {
                  setVideoUrl(url);
                  onSubmit();
                }}
                lang={lang}
              />
              <Button
                variant="outline"
                onClick={() => mode ? setMode(null) : toggleEdit()}
                className="text-sm flex items-center"
              >
                <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
                {mode ? t.goBack : t.cancelButton}
              </Button>
            </div>
          )}
        </div>
      )}

      {videoUrl && !isEditing && (
        <p className="text-xs text-muted-foreground mt-4">
          {t.processingMessage}
        </p>
      )}

      {!isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${videoUrl ? "bg-green-400" : "bg-red-400"}`} />
              <span>{videoUrl ? t.readyStatus : t.noVideo}</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3 w-3" />
              <span>ID: {chapterId.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};