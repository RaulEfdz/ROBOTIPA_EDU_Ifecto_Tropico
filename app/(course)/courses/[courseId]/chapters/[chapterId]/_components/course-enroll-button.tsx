// app/(course)/courses/[courseId]/chapters/[chapterId]/_components/course-enroll-button.tsx
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface CourseEnrollButtonProps {
  price: number;
}

export const CourseEnrollButton: React.FC<CourseEnrollButtonProps> = ({
  price,
}) => {
  // useParams() te devuelve { courseId, chapterId }
  const { courseId } = useParams() as { courseId: string };
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    if (!courseId) {
      console.error("No courseId encontrado en useParams()");
      return toast.error("Error interno: falta courseId");
    }

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const buttonLabel = isLoading
    ? "Procesando..."
    : price > 0
    ? `Comprar por $${price}`
    : "Inscríbete Gratis";

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="sm"
      className="w-full md:w-auto"
    >
      {buttonLabel}
    </Button>
  );
};
