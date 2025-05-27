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
import ChapterVideoSection from "@/components/ChapterVideoSection";
import EditorTextPreview from "@/components/preview";
import { getChapterU } from "@/app/(course)/courses/[courseId]/chapters/[chapterId]/handler/getChapter";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface ChapterPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  chapterId: string;
  chapterTitle: string;
}

interface ChapterPreviewData {
  chapter: {
    id: string;
    title: string;
    description?: string;
    video?: {
      url?: string;
    };
    isFree: boolean;
  };
  muxData?: {
    playbackId?: string;
  };
}

const ChapterPreviewModal: React.FC<ChapterPreviewModalProps> = ({
  isOpen,
  onClose,
  courseId,
  chapterId,
  chapterTitle,
}) => {
  const [chapterData, setChapterData] = useState<ChapterPreviewData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useCurrentUser();

  useEffect(() => {
    if (!isOpen || !courseId || !chapterId) {
      return;
    }

    const fetchChapterContent = async () => {
      setLoading(true);
      setError(null);
      setChapterData(null);

      try {
        const userIdForFetch = user?.id || "anonymous_user_preview";
        const data = await getChapterU({
          userId: userIdForFetch,
          courseId,
          chapterId,
        });

        if (!data.chapter.isFree) {
          setError("Este capítulo no está disponible para vista previa.");
          setChapterData(null);
        } else {
          setChapterData(data);
        }
      } catch (err) {
        setError("Error al cargar el contenido del capítulo.");
        setChapterData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchChapterContent();
  }, [isOpen, courseId, chapterId, user]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
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

          {!loading && !error && chapterData?.chapter && (
            <>
              <ChapterVideoSection
                videoUrl={chapterData.chapter.video?.url}
                playbackId={chapterData.muxData?.playbackId}
                courseImageUrl="" // You can pass a fallback image URL if needed
                isLocked={false}
              />
              {chapterData.chapter.description && (
                <div className="mt-4">
                  <EditorTextPreview
                    htmlContent={chapterData.chapter.description}
                  />
                </div>
              )}
            </>
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
