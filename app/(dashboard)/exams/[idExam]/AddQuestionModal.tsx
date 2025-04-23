"use client";

import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface AddQuestionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  examId: string;
  onQuestionAdded: () => void;
}

// Tipo para los datos del formulario
type QuestionFormData = {
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  explanationText?: string;
  points: number;
};

export default function AddQuestionModal({
  isOpen,
  onOpenChange,
  examId,
  onQuestionAdded,
}: AddQuestionModalProps) {
  // Estado para seguir el tipo de pregunta
  const [questionType, setQuestionType] = useState<"multiple" | "boolean">(
    "multiple"
  );

  // Configurar el formulario
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
  } = useForm<QuestionFormData>({
    defaultValues: {
      text: "",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      explanationText: "",
      points: 1,
    },
  });

  // Configurar el array de campos para las opciones
  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  // Función para enviar el formulario
  const onSubmit = async (data: QuestionFormData) => {
    try {
      // Validar que al menos una opción esté marcada como correcta
      if (!data.options.some((option) => option.isCorrect)) {
        toast.error("Debes marcar al menos una opción como correcta");
        return;
      }

      const response = await fetch(`/api/exams/${examId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear la pregunta");
      }

      toast.success("Pregunta añadida correctamente");
      reset(); // Limpiar formulario
      onQuestionAdded(); // Notificar al componente padre
    } catch (err: any) {
      console.error("Error creating question:", err);
      toast.error(err.message || "Error al crear la pregunta");
    }
  };

  // Función para cambiar el tipo de pregunta
  const handleQuestionTypeChange = (type: "multiple" | "boolean") => {
    setQuestionType(type);

    // Si cambiamos a booleano, ajustar las opciones
    if (type === "boolean") {
      setValue("options", [
        { text: "Verdadero", isCorrect: false },
        { text: "Falso", isCorrect: false },
      ]);
    }
    // Si cambiamos a opción múltiple, restaurar el formato por defecto
    else if (getValues("options").length < 3) {
      setValue("options", [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
    }
  };

  // Función para añadir una nueva opción
  const handleAddOption = () => {
    append({ text: "", isCorrect: false });
  };

  // Función para limpiar el formulario al cerrar
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      reset();
      setQuestionType("multiple");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Añadir Pregunta</DialogTitle>
          <DialogDescription>
            Crea una nueva pregunta para este examen.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* Tipo de pregunta */}
          <div className="flex space-x-4">
            <Button
              type="button"
              variant={questionType === "multiple" ? "default" : "outline"}
              className="flex-1"
              onClick={() => handleQuestionTypeChange("multiple")}
            >
              Opción Múltiple
            </Button>
            <Button
              type="button"
              variant={questionType === "boolean" ? "default" : "outline"}
              className="flex-1"
              onClick={() => handleQuestionTypeChange("boolean")}
            >
              Verdadero/Falso
            </Button>
          </div>

          {/* Texto de la pregunta */}
          <div className="space-y-2">
            <Label htmlFor="text">Pregunta</Label>
            <Textarea
              id="text"
              {...register("text", { required: "La pregunta es requerida" })}
              placeholder="Escribe el enunciado de la pregunta..."
              rows={3}
            />
            {errors.text && (
              <p className="text-red-500 text-sm">{errors.text.message}</p>
            )}
          </div>

          {/* Opciones de respuesta */}
          <div className="space-y-2">
            <Label>Opciones de respuesta</Label>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`option-correct-${index}`}
                    {...register(`options.${index}.isCorrect`)}
                  />
                  <Input
                    id={`option-text-${index}`}
                    {...register(`options.${index}.text`, {
                      required: "La opción no puede estar vacía",
                    })}
                    placeholder={`Opción ${String.fromCharCode(65 + index)}`}
                  />
                  {questionType === "multiple" && fields.length > 2 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(index)}
                      title="Eliminar opción"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {questionType === "multiple" && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleAddOption}
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir Opción
              </Button>
            )}
          </div>

          {/* Explicación de la respuesta */}
          <div className="space-y-2">
            <Label htmlFor="explanationText">Explicación (opcional)</Label>
            <Textarea
              id="explanationText"
              {...register("explanationText")}
              rows={2}
              placeholder="Puedes explicar por qué esta es la respuesta correcta..."
            />
          </div>

          {/* Puntos asignados */}
          <div className="space-y-2">
            <Label htmlFor="points">Puntos</Label>
            <Input
              id="points"
              type="number"
              {...register("points", {
                required: "Los puntos son requeridos",
                min: { value: 1, message: "Debe asignar al menos 1 punto" },
                valueAsNumber: true,
              })}
            />
            {errors.points && (
              <p className="text-red-500 text-sm">{errors.points.message}</p>
            )}
          </div>

          {/* Pie de diálogo */}
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Pregunta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
