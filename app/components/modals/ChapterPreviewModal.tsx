"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getChapterU } from "@/app/(course)/courses/[courseId]/chapters/[chapterId]/handler/getChapter";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { VideoDisplayPreview } from "@/components/VideoDisplayPreview";

interface ChapterPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  chapterId: string;
  chapterTitle: string;
  isPreview: boolean;
}

const ChapterPreviewModal: React.FC<ChapterPreviewModalProps> = ({
  isOpen,
  onClose,
  courseId,
  chapterId,
  chapterTitle,
  isPreview,
}) => {
  const [chapterVideoUrl, setChapterVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useCurrentUser();

  useEffect(() => {
    if (!isOpen || !courseId || !chapterId) return;

    const fetchChapterContent = async () => {
      setLoading(true);
      setError(null);
      setChapterVideoUrl(null);

      try {
        const userIdForFetch = (user as any)?.id || "anonymous_user_preview";
        const data = await getChapterU({
          userId: userIdForFetch,
          courseId,
          chapterId,
          isPreview,
        });

        if (!data || !("videoUrl" in data)) {
          setError("Este capítulo no está disponible para vista previa.");
          return;
        }

        setChapterVideoUrl(data.videoUrl ? (data.videoUrl as string) : null);
      } catch (err) {
        setError("Error al cargar el contenido del capítulo.");
      } finally {
        setLoading(false);
      }
    };

    fetchChapterContent();
  }, [isOpen, courseId, chapterId, user, isPreview]);

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>{chapterTitle}</DialogTitle>

        <div className="mt-4">
          {loading && (
            <>
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-24 w-full" />
            </>
          )}

          {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

          {!loading && !error && chapterVideoUrl && (
            <VideoDisplayPreview videoUrl={chapterVideoUrl} />
          )}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChapterPreviewModal;
