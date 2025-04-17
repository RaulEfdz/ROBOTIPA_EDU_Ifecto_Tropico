"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface CourseEnrollButtonProps {
  price: number;
  courseId: string;
}

export const CourseEnrollButton = ({
  price,
  courseId,
}: CourseEnrollButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);

      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Error al procesar la inscripción");

      const data = await res.json();

      if (data?.url) {
        // Redirige a link de pago
        window.location.assign(data.url);
      } else {
        // Éxito directo
        toast.success("¡Inscripción completada!");
        window.location.reload(); // o redirige al curso si lo prefieres
      }
    } catch (error) {
      console.error("Error en inscripción:", error);
      toast.error("No se pudo completar la inscripción.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="sm"
      className="w-full md:w-auto"
    >
      {isLoading ? "Procesando..." : "Inscríbete"}
    </Button>
  );
};
