"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash, Globe, Lock, Loader2 } from "lucide-react";
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
  const [published, setPublished] = useState<boolean | null>(
    isPublished ?? null
  );

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
  }, [courseId, published]);

  const handleTogglePublish = async () => {
    if (published === null) return;

    setIsLoading(true);
    const path = `/api/courses/${courseId}/${
      published ? "unpublish" : "publish"
    }`;
    // Determinar el método correcto según la acción
    const method = published ? "PUT" : "POST";

    try {
      await fetchData({
        values: { courseId },
        path,
        method,
        callback: () => {
          toast.success(published ? "Curso despublicado" : "Curso publicado", {
            duration: 2000,
            position: "bottom-right",
          });
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
        // disabled={disabled || isLoading || published === null}
        variant={published ? "secondary" : "default"}
        size="sm"
        className={`rounded-lg transition-all duration-200 ${
          published 
            ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600" 
            : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            {published ? "Despublicando..." : "Publicando..."}
          </>
        ) : published ? (
          <>
            <Lock className="h-4 w-4 mr-2" />
            Despublicar
          </>
        ) : (
          <>
            <Globe className="h-4 w-4 mr-2" />
            Publicar
          </>
        )}
      </Button>

      <ConfirmModal 
        onConfirm={handleDelete}
        title="¿Estás seguro de eliminar este curso?"
        description="Esta acción no se puede deshacer. Se eliminará permanentemente el curso y todo su contenido, incluyendo capítulos, videos y progreso de estudiantes."
        confirmText="Sí, eliminar curso"
        cancelText="Cancelar"
      >
        <Button
          size="sm"
          variant="destructive"
          disabled={isLoading}
          className="rounded-lg hover:bg-red-700 transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Eliminando...
            </>
          ) : (
            <>
              <Trash className="h-4 w-4 mr-2" />
              Eliminar
            </>
          )}
        </Button>
      </ConfirmModal>
    </div>
  );
};
