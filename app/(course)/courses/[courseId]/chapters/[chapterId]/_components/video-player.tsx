"use client";

import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import { useConfettiStore } from "@/hooks/use-confetti-store";
import YouTubeVideo from "./customs/YouTubeVideo";

interface VideoPlayerProps {
  playbackId: string;
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
  videoUrl: string;
};

export const VideoPlayer = ({
  courseId,
  chapterId,
  nextChapterId,
  completeOnEnd,
  videoUrl
}: VideoPlayerProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();

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
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`)
        }
      }
    } catch {
      toast.error("Ocurrio un error");
    }
  }



  return (
    <div className="relative aspect-video">
      {videoUrl && <YouTubeVideo videoUrl={videoUrl} key={videoUrl} onEnd={onEnd} />}
    </div>
  )
}