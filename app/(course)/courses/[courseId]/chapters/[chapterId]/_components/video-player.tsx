
"use client";

import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import MuxPlayer from "@mux/mux-player-react";
import { Video as VideoIcon, Lock } from "lucide-react";

interface VideoPlayerProps {
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  completeOnEnd?: boolean;
  playbackId?: string;
  videoUrl?: string;
  isLocked?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  courseId,
  chapterId,
  nextChapterId,
  completeOnEnd = false,
  playbackId,
  videoUrl = "",
  isLocked = false,
}) => {
  const router = useRouter();

  // Detectores de origen
  const isYouTube = /youtu\.be\/|youtube\.com\/(watch|embed)/.test(videoUrl);
  const isVimeo   = /vimeo\.com\/(?:video\/)?\d+/.test(videoUrl);
  const isMux     = Boolean(playbackId);

  const extractVimeoId = (url: string): string | null => {
    const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    return m ? m[1] : null;
  };

  const handleProgress = async () => {
    if (!completeOnEnd) return;
    try {
      const res = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}/progress`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCompleted: true }),
        }
      );
      if (!res.ok) throw new Error();

      toast.success("Progreso actualizado");
      if (nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
      }
      router.refresh();
    } catch {
      toast.error("Ocurrió un error al guardar el progreso");
    }
  };

  return (
    <div className="relative aspect-video rounded-md overflow-hidden border bg-slate-100 dark:bg-gray-800">
      {/* Contenedor del video con posible blur */}
      <div className={
        `absolute inset-0 ${isLocked ? 'filter blur-sm pointer-events-none' : ''}`
      }>
        {isYouTube && (
          <iframe
            className="absolute inset-0 w-full h-full"
            src={
              `https://www.youtube.com/embed/${new URL(videoUrl).searchParams.get('v')}?rel=0&modestbranding=1`
            }
            title="YouTube video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}

        {isVimeo && (() => {
          const id = extractVimeoId(videoUrl);
          return id ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://player.vimeo.com/video/${id}`}
              title="Vimeo video"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : null;
        })()}

        {isMux && playbackId && (
          <MuxPlayer
            playbackId={playbackId}
            className="absolute inset-0 w-full h-full"
            metadata={{ video_id: playbackId, viewer_user_id: 'anonymous' }}
            onEnded={handleProgress}
          />
        )}

        {!isYouTube && !isVimeo && !isMux && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
            <VideoIcon className="h-10 w-10 mb-2" />
            <span className="text-sm">No se pudo cargar el video</span>
          </div>
        )}
      </div>

      {/* Overlay de bloqueo */}
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
          <Lock className="h-10 w-10 text-white mb-2 animate-pulse" />
          <span className="text-white text-sm">Contenido bloqueado. Suscripción requerida.</span>
        </div>
      )}
    </div>
  );
};
