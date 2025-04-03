"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { fetchData } from "../../custom/fetchData";

interface ActionsProps {
  disabled: boolean;
  courseId: string;
  isPublished?: boolean;
}

export const Actions = ({ disabled, courseId, isPublished }: ActionsProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);
  const [published, setPublished] = useState<boolean | null>(isPublished ?? null);

  useEffect(() => {
    const fetchPublicationStatus = async () => {
      try {
        const res = await fetch(`/api/courses/${courseId}/isPublished`, {
          method: "POST",
        });
        const data = await res.json();
        setPublished(data.isPublished);
      } catch {
        toast.error("Error al obtener el estado de publicación");
      }
    };

    if (published === null) {
      fetchPublicationStatus();
    }
  }, []);

  const handleTogglePublish = async () => {
    if (published === null) return;

    setIsLoading(true);
    const path = `/api/courses/${courseId}/${published ? "unpublish" : "publish"}`;

    try {
      await fetchData({
        values: { courseId },
        path,
        method: "POST",
        callback: () => {
          toast.success(
            published ? "Curso ocultado" : "Curso publicado",
            { duration: 2000, position: "bottom-right" }
          );
          if (!published) confetti.onOpen();
          setPublished(!published);
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

    try {
      await fetchData({
        values: { chapterId: courseId },
        path: `/api/courses/${courseId}/delete`,
        method: "POST",
        callback: () => {
          toast.success("Curso eliminado", {
            duration: 2000,
            position: "bottom-right",
          });
          router.push(`/teacher/courses`);
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
        disabled={disabled || isLoading || published === null}
        variant={published ? "default" : "outline"}
        size="sm"
        className="rounded-lg"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : published ? (
          <>
            <EyeOff className="h-4 w-4 mr-1" />
            Ocultar
          </>
        ) : (
          <>
            <Eye className="h-4 w-4 mr-1" />
            Publicar?
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
