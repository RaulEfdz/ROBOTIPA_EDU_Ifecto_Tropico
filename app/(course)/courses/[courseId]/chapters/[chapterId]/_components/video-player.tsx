"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useEffect, useRef } from "react";
import MuxPlayer from "@mux/mux-player-react";

import { useConfettiStore } from "@/hooks/use-confetti-store";
import { Video } from "lucide-react";

interface VideoPlayerProps {
  playbackId: string;
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
  videoUrl: string;
}

export const VideoPlayer = ({
  courseId,
  chapterId,
  nextChapterId,
  completeOnEnd,
  videoUrl,
  playbackId,
}: VideoPlayerProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();

  const isYouTube = /youtube\.com|youtu\.be/.test(videoUrl);
  const isMux = /stream\.mux\.com/.test(videoUrl);

  const extractYouTubeId = (url: string): string | null => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
      if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
      return null;
    } catch {
      return null;
    }
  };

  const finalYouTubeId = isYouTube ? extractYouTubeId(videoUrl) : null;

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
          isCompleted: true,
        });

        if (!nextChapterId) {
          confetti.onOpen();
        }

        toast.success("Progreso actualizado");
        router.refresh();

        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
        }
      }
    } catch {
      toast.error("Ocurrió un error al guardar el progreso");
    }
  };

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const element = videoRef.current;
    if (element && completeOnEnd) {
      element.addEventListener("ended", onEnd);
      return () => {
        element.removeEventListener("ended", onEnd);
      };
    }
  }, [videoUrl, completeOnEnd]);

  return (
    <div className="relative aspect-video rounded-md overflow-hidden border bg-slate-100 dark:bg-gray-800">
      {isYouTube && finalYouTubeId ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${finalYouTubeId}?rel=0&modestbranding=1`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : isMux && playbackId ? (
        <MuxPlayer
          playbackId={playbackId}
          className="absolute inset-0 w-full h-full"
          metadata={{
            video_id: playbackId,
            video_title: "Video Mux",
            viewer_user_id: "anonymous",
          }}
          onEnded={onEnd}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600">
          <Video className="h-10 w-10 mb-2" />
          <span className="text-sm">No se pudo cargar el video</span>
        </div>
      )}
    </div>
  );
};
