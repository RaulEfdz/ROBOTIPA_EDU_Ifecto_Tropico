"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { FcNext, FcOk } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { fetchData } from "../../../../custom/fetchData";

interface ChapterActionsProps {
  disabled: boolean;
  courseId: string;
  chapterId: string;
  isPublished: boolean;
}

export const ChapterActions = ({
  disabled,
  courseId,
  chapterId,
  isPublished,
}: ChapterActionsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePublish = async () => {
    setIsLoading(true);
    const path = `/api/courses/${courseId}/chapters/${chapterId}/${isPublished ? "unpublish" : "publish"}`;

    try {
      await fetchData({
        path,
        method: "PUT",
        callback: () => {
          toast.success(
            isPublished ? "Capítulo ocultado" : "Capítulo publicado",
            { duration: 2000, position: "bottom-right" }
          );
          router.refresh();
        },
      });
    } catch {
      toast.error("Ocurrió un error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    const path = `/api/courses/${courseId}/chapters/${chapterId}/delete`;

    try {
      await fetchData({
        path,
        method: "DELETE",
        callback: () => {
          toast.success("Capítulo eliminado", {
            duration: 2000,
            position: "bottom-right",
          });
          router.push(`/teacher/courses/${courseId}`);
          router.refresh();
        },
      });
    } catch {
      toast.error("Ocurrió un error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={handleTogglePublish}
        disabled={disabled || isLoading}
        variant={isPublished ? "default" : "outline"}
        size="sm"
        className="rounded-lg"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPublished ? (
          <>
            <EyeOff className="h-4 w-4 mr-1" />
            Ocultar
          </>
        ) : (
          <>
            <Eye className="h-4 w-4 mr-1" />
            Publicar
          </>
        )}
      </Button>

      <ConfirmModal onConfirm={handleDelete}>
        <Button
          size="sm"
          variant="destructive"
          disabled={isLoading}
          className="rounded-lg"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
