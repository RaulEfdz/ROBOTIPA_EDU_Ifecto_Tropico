"use client";

import React, { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export type QuestionFormData = {
  text: string;
  options: { text: string; isCorrect: boolean }[];
  explanationText?: string;
  points: number;
};

interface QuestionFormProps {
  examId: string;
  onQuestionAdded: () => void;
}

export default function QuestionForm({
  examId,
  onQuestionAdded,
}: QuestionFormProps) {
  const [questionType, setQuestionType] = useState<"multiple" | "boolean">(
    "multiple"
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
      text: "",
      options: Array.from({ length: 3 }, () => ({
        text: "",
        isCorrect: false,
      })),
      explanationText: "",
      points: 1,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const onSubmit = async (data: QuestionFormData) => {
    if (!data.options.some((o) => o.isCorrect)) {
      toast.error("Debes marcar al menos una opción como correcta");
      return;
    }
    try {
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
      reset();
      setQuestionType("multiple");
      onQuestionAdded();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al crear la pregunta");
    }
  };

  const handleQuestionTypeChange = (type: "multiple" | "boolean") => {
    setQuestionType(type);
    if (type === "boolean") {
      setValue(
        "options",
        [
          { text: "Verdadero", isCorrect: false },
          { text: "Falso", isCorrect: false },
        ],
        { shouldDirty: true }
      );
    } else {
      setValue(
        "options",
        Array.from({ length: 3 }, () => ({
          text: "",
          isCorrect: false,
        })),
        { shouldDirty: true }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
      {/* Selector de tipo */}
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

      {/* Enunciado */}
      <div className="space-y-2">
        <Label htmlFor="text">Pregunta</Label>
        <Textarea
          id="text"
          {...register("text", {
            required: "La pregunta es requerida",
          })}
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
              {/* Checkbox controlado */}
              <Controller
                control={control}
                name={`options.${index}.isCorrect`}
                render={({ field: { value, onChange } }) => (
                  <Checkbox
                    id={`option-correct-${index}`}
                    checked={value}
                    onCheckedChange={onChange}
                  />
                )}
              />

              {/* Texto de la opción */}
              <Input
                id={`option-text-${index}`}
                {...register(`options.${index}.text`, {
                  required: "La opción no puede estar vacía",
                })}
                placeholder={`Opción ${String.fromCharCode(65 + index)}`}
              />

              {/* Botón para eliminar (solo en múltiple) */}
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

        {/* Añadir opción en múltiple */}
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

      {/* Explicación */}
      <div className="space-y-2">
        <Label htmlFor="explanationText">Explicación (opcional)</Label>
        <Textarea
          id="explanationText"
          {...register("explanationText")}
          rows={2}
          placeholder="Puedes explicar por qué esta es la respuesta correcta..."
        />
      </div>

      {/* Puntos */}
      <div className="space-y-2">
        <Label htmlFor="points">Puntos</Label>
        <Input
          id="points"
          type="number"
          {...register("points", {
            required: "Los puntos son requeridos",
            min: {
              value: 1,
              message: "Debe asignar al menos 1 punto",
            },
            valueAsNumber: true,
          })}
        />
        {errors.points && (
          <p className="text-red-500 text-sm">{errors.points.message}</p>
        )}
      </div>

      <DialogFooter className="pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar Pregunta"}
        </Button>
      </DialogFooter>
    </form>
  );
}
