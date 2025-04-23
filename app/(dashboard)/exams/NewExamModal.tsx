"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Tipo para los datos del formulario
type ExamFormData = {
  title: string;
  description?: string;
  duration: number;
};

// Props para el componente
interface NewExamModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExamCreated: () => Promise<void>;
}

export default function NewExamModal({
  isOpen,
  onOpenChange,
  onExamCreated,
}: NewExamModalProps) {
  // Configuración del formulario con react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExamFormData>({
    defaultValues: { title: "", description: "", duration: 60 },
  });

  // Función para enviar el formulario
  const onSubmit = async (data: ExamFormData) => {
    try {
      const response = await fetch("/api/exams/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el examen");
      }

      toast.success("Examen creado con éxito");
      reset(); // Limpiar formulario
      await onExamCreated(); // Notificar al componente padre
    } catch (err: any) {
      console.error("Error creating exam:", err);
      toast.error(err.message || "Error al crear examen");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Examen</DialogTitle>
          <DialogDescription>
            Completa los campos para añadir un nuevo examen.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Campo Título */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Título
            </label>
            <Input
              id="title"
              {...register("title", {
                required: "El título es requerido",
              })}
              placeholder="Ej: Examen de Historia"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Campo Descripción */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Descripción (Opcional)
            </label>
            <Textarea
              id="description"
              {...register("description")}
              rows={3}
              placeholder="Ej: Examen parcial sobre la Revolución Francesa."
            />
          </div>

          {/* Campo Duración */}
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium mb-1"
            >
              Duración (minutos)
            </label>
            <Input
              id="duration"
              type="number"
              {...register("duration", {
                required: "La duración es requerida",
                min: {
                  value: 1,
                  message: "La duración mínima es 1 minuto",
                },
                valueAsNumber: true,
              })}
              placeholder="Ej: 90"
            />
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">
                {errors.duration.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Examen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
