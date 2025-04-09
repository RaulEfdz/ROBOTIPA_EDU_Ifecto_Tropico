"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, PlusCircle, X, Loader2 } from "lucide-react";
import { Chapter, Video } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { translations } from "../components/translations";
import { getYouTubeVideoId } from "../components/utils";
import { VideoDisplay } from "../components/VideoDisplay";
import { UploadOptions } from "../components/UploadOptions";
import { YouTubeInput } from "../components/YouTubeInput";
import { VideoUploaderMux } from "./UploaderMux/VideoUploaderMux";

interface ChapterWithVideo extends Chapter {
  video?: Video | null;
}

interface ChapterVideoFormProps {
  initialData: ChapterWithVideo;
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
  const t = translations[lang];
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);
  const [isSubmittingYouTube, setIsSubmittingYouTube] = useState(false);
  const [videoUrl, setVideoUrl] = useState(initialData.video?.url || "");
  const [mode, setMode] = useState<"youtube" | "file" | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const getInitialVideoType = (url: string | undefined | null): "youtube" | "file" | null => {
    if (!url) return null;
    return getYouTubeVideoId(url) ? "youtube" : "file";
  };

  const handleSetVideoUrl = (url: string) => {
    if (apiError) setApiError(null);
    setVideoUrl(url);
  };

  const toggleEdit = () => {
    const next = !isEditing;
    setIsEditing(next);
    setApiError(null);
    setIsReplacing(false);

    if (next) {
      const currentVideoUrl = videoUrl || initialData.video?.url || "";
      setVideoUrl(currentVideoUrl);
      setMode(getInitialVideoType(currentVideoUrl));
    } else {
      setMode(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setApiError(null);
    setIsReplacing(false);
    setMode(null);
    setVideoUrl(initialData.video?.url || "");
  };

  const validateYouTubeUrl = (url: string): boolean => {
    return Boolean(getYouTubeVideoId(url));
  };

  const postYouTubeVideoData = async (urlToSave: string) => {
    const res = await fetch(`/api/courses/${courseId}/chapters/${chapterId}/video/youtube`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoUrl: urlToSave }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: t.errorMessage }));
      throw new Error(error.message || t.errorMessage);
    }
    return res.json();
  };

  const postMuxVideoData = async (uploadId: string): Promise<{ url: string }> => {
    const res = await fetch(`/api/courses/${courseId}/chapters/${chapterId}/video/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ message: t.errorMessage }));
      throw new Error(error.message || t.errorMessage);
    }
    const data = await res.json();
    if (!data.url) {
      throw new Error(t.errorMessage + " (Missing URL in response)");
    }
    return data;
  };

  const handleYouTubeSubmit = async () => {
    if (!validateYouTubeUrl(videoUrl)) {
      setApiError(t.youtubeError);
      return;
    }

    setIsSubmittingYouTube(true);
    setApiError(null);

    try {
      await postYouTubeVideoData(videoUrl);
      toast.success(t.successMessage);
      setIsEditing(false);
      setIsReplacing(false);
      setMode(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : t.errorMessage;
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsSubmittingYouTube(false);
    }
  };

  const handleMuxUploadSuccess = async (uploadId: string) => {
    setApiError(null);

    try {
      const data = await postMuxVideoData(uploadId);
      toast.success(t.successMessage);
      setVideoUrl(data.url);
      setIsEditing(false);
      setIsReplacing(false);
      setMode(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : t.errorMessage;
      toast.error(msg);
      setIsEditing(false);
      setMode(null);
      setVideoUrl(initialData.video?.url || "");
    }
  };

  return (
    <div className="mb-6 bg-white dark:bg-gray-850 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {t.title}
        </h3>
        {isEditing ? (
          <Button
            onClick={handleCancelEdit}
            variant="ghost"
            size="sm"
            className="text-sm text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
            disabled={isSubmittingYouTube}
          >
            <X className="h-4 w-4 mr-1" />
            {t.cancelButton || "Cancelar"}
          </Button>
        ) : (
          <Button
            onClick={toggleEdit}
            variant="ghost"
            size="sm"
            className="text-sm text-gray-500 hover:text-blue-600 transition-colors dark:text-gray-400 dark:hover:text-blue-500"
          >
            {initialData.video?.url ? (
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

      {!isEditing && (
        <VideoDisplay videoUrl={videoUrl} noVideoText={t.noVideo} />
      )}

      {isEditing && initialData.video?.url && !isReplacing && (
        <div className="space-y-4">
          <VideoDisplay videoUrl={videoUrl} noVideoText={t.noVideo} />
          <div className="flex gap-4">
            <Button onClick={() => {
              setMode(null)
              setIsReplacing(true)
            }} variant="outline">
              {t.replaceButton || "Reemplazar video"}
            </Button>
          </div>
        </div>
      )}

      {isEditing && (!initialData.video?.url || isReplacing) && (
        <div className="space-y-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {!mode && (
            <UploadOptions
              onSelectYouTube={() => setMode("youtube")}
              onSelectFile={() => setMode("file")}
              chooseText={t.choose}
              youtubeText={t.youtube}
              fileText={t.file}
            />
          )}

          {mode === "youtube" && (
            <YouTubeInput
              videoUrl={videoUrl}
              setVideoUrl={handleSetVideoUrl}
              validateUrl={validateYouTubeUrl}
              onBack={() => setMode(null)}
              onSubmit={handleYouTubeSubmit}
              isSaving={isSubmittingYouTube}
              placeholder={t.placeholder}
              invalidFormatText={t.youtubeError}
              errorText={apiError}
              backText={t.goBack}
              saveText={t.saveButton}
            />
          )}

          {mode === "file" && (
            <VideoUploaderMux
              onUploadSuccess={handleMuxUploadSuccess}
              lang={lang}
            />
          )}
        </div>
      )}
    </div>
  );
};
