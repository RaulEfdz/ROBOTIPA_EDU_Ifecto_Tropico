"use client";

import React, { useEffect, useState } from "react";
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
import { Question } from "@/prisma/types";

interface EditQuestionModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  question: Question;
  examId: string;
  onQuestionUpdated: () => void;
}

type QuestionFormData = {
  text: string;
  options: {
    text: string;
    isCorrect: boolean;
  }[];
  explanationText?: string;
  points: number;
};

export default function EditQuestionModal({
  isOpen,
  onOpenChange,
  question,
  examId,
  onQuestionUpdated,
}: EditQuestionModalProps) {
  const [questionType, setQuestionType] = useState<"multiple" | "boolean">(
    question.options.length === 2 &&
      question.options.some((o) => o.text === "Verdadero" || o.text === "Falso")
      ? "boolean"
      : "multiple"
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    getValues,
  } = useForm<QuestionFormData>({
    defaultValues: {
      text: question.text,
      options: question.options,
      explanationText: question.explanationText || "",
      points: question.points,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  useEffect(() => {
    reset({
      text: question.text,
      options: question.options,
      explanationText: question.explanationText || "",
      points: question.points,
    });
  }, [question, reset]);

  const onSubmit = async (data: QuestionFormData) => {
    try {
      if (!data.options.some((opt) => opt.isCorrect)) {
        toast.error("Debes marcar al menos una opción como correcta");
        return;
      }

      const response = await fetch(
        `/api/exams/${examId}/questions/${question.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al actualizar la pregunta");
      }

      toast.success("Pregunta actualizada correctamente");
      onQuestionUpdated();
      reset();
    } catch (err: any) {
      console.error("Error updating question:", err);
      toast.error(err.message || "Error al actualizar la pregunta");
    }
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      reset();
      setQuestionType(
        question.options.length === 2 &&
          question.options.some(
            (o) => o.text === "Verdadero" || o.text === "Falso"
          )
          ? "boolean"
          : "multiple"
      );
    }
    onOpenChange(open);
  };

  const handleQuestionTypeChange = (type: "multiple" | "boolean") => {
    setQuestionType(type);
    if (type === "boolean") {
      setValue("options", [
        { text: "Verdadero", isCorrect: false },
        { text: "Falso", isCorrect: false },
      ]);
    } else if (getValues("options").length < 3) {
      setValue("options", [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Pregunta</DialogTitle>
          <DialogDescription>
            Modifica los campos de esta pregunta.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
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
                onClick={() => append({ text: "", isCorrect: false })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir Opción
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanationText">Explicación (opcional)</Label>
            <Textarea
              id="explanationText"
              {...register("explanationText")}
              rows={2}
              placeholder="Puedes explicar por qué esta es la respuesta correcta..."
            />
          </div>

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

          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
