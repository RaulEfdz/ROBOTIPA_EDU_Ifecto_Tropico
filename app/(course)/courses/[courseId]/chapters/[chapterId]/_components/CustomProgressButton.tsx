"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";

// Colores específicos para el botón de progreso
const courseColors = {
  completed: {
    button: "bg-emerald-600 hover:bg-emerald-700",
  },
  progress: {
    button: "bg-emerald-600 hover:bg-emerald-700",
  },
};

export interface CustomProgressButtonProps {
  chapterId: string;
  courseId: string;
  nextChapterId?: string;
  isCompleted: boolean;
}

const CustomProgressButton: React.FC<CustomProgressButtonProps> = ({
  chapterId,
  courseId,
  nextChapterId,
  isCompleted,
}) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      // Si no está completado, marcamos como completado
      if (!isCompleted) {
        const res = await fetch(
          `/api/courses/${courseId}/chapters/${chapterId}/progress`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isCompleted: true }),
          }
        );
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();

        // Notificación y confetti por certificado
        if (
          data.courseCompleted &&
          (data.certificateGenerated || data.certificateId)
        ) {
          toast.success(
            <span>
              ¡Felicidades! Has completado el curso y obtenido tu certificado.{" "}
              <a
                href="/students/my-certificates"
                className="underline text-emerald-700 hover:text-emerald-900 ml-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver mis certificados
              </a>
            </span>
          );
          confetti.onOpen(); // Confetti del certificado
        } else if (!isCompleted && !nextChapterId) {
          // Confetti solo si es el último capítulo y NO se generó certificado
          confetti.onOpen();
          toast.success("✅ Capítulo marcado como completado");
        } else {
          toast.success("✅ Capítulo marcado como completado");
        }

        // Esperar a que el confeti se vea (3 s)
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      // Navegar al siguiente capítulo o al curso
      if (nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
      } else {
        router.push(`/courses/${courseId}`);
      }
    } catch (error) {
      console.error("Error al actualizar progreso:", error);
      toast.error("Ocurrió un error al actualizar el progreso");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      size="sm"
      className={`shadow-sm hover:shadow ${
        isCompleted
          ? courseColors.completed.button
          : courseColors.progress.button
      }`}
    >
      {isLoading
        ? "Cargando..."
        : isCompleted
          ? "Continuar ."
          : "Marcar como completado"}
    </Button>
  );
};

export default CustomProgressButton;
