// app/(course)/courses/[courseId]/chapters/[chapterId]/_components/course-enroll-button.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface CourseEnrollButtonProps {
  price: number;
}

export const CourseEnrollButton: React.FC<CourseEnrollButtonProps> = ({
  price,
}) => {
  const { courseId } = useParams() as { courseId: string };
  const router = useRouter();
  const { user, loading: userLoading } = useCurrentUser();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEnroll = async () => {
    if (userLoading) return;
    if (!user) {
      // Redirigir a login con URL de retorno
      router.push(`/auth?redirectUrl=/courses/${courseId}`);
      return;
    }

    if (!courseId) {
      console.error("No courseId encontrado en useParams()");
      return toast.error("Error interno: falta courseId");
    }

    setIsProcessing(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();

      if (data.url) {
        window.location.assign(data.url);
      } else {
        toast.success("¡Inscripción completada!");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error en inscripción:", error);
      toast.error("No se pudo completar la inscripción.");
    } finally {
      setIsProcessing(false);
    }
  };

  const buttonLabel = isProcessing
    ? "Procesando..."
    : userLoading
      ? "Cargando..."
      : user
        ? price > 0
          ? `Comprar por $${price}`
          : "Inscríbete Gratis"
        : "Iniciar sesión para comprar";

  return (
    <Button
      onClick={handleEnroll}
      disabled={isProcessing || userLoading}
      size="sm"
      className="w-full md:w-auto"
    >
      {buttonLabel}
    </Button>
  );
};
