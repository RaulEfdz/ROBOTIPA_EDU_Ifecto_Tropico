// ExamDetailsForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Globe, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Clock, Save } from "lucide-react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { useFormContext } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ExamFormData } from "../page";

export default function ExamDetailsForm({
  isSubmitting,
  isDirty,
  onSubmit,
  isPublished,
  handlePublishChange,
}: {
  isSubmitting: boolean;
  isDirty: boolean;
  onSubmit: () => void;
  isPublished: boolean;
  handlePublishChange: (checked: boolean) => void;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<ExamFormData>();

  // Local state to show select value and pending change
  const [publishedState, setPublishedState] = useState(isPublished);
  const [pendingState, setPendingState] = useState(isPublished);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    setPublishedState(isPublished);
    setPendingState(isPublished);
  }, [isPublished]);

  // When user chooses new option
  const onSelectChange = (value: string) => {
    const checked = value === "published";
    setPublishedState(checked);
    setPendingState(checked);
    setIsConfirmOpen(true);
  };

  const confirmPublish = () => {
    handlePublishChange(pendingState);
    setIsConfirmOpen(false);
  };

  const cancelPublish = () => {
    setPublishedState(isPublished);
    setPendingState(isPublished);
    setIsConfirmOpen(false);
  };

  return (
    <>
      <CardContent>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Título */}
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                {...register("title", { required: "El título es requerido" })}
                placeholder="Ej: Examen de Historia"
              />
              {errors.title && (
                <p className="text-red-500 text-sm">{errors.title.message}</p>
              )}
            </div>

            {/* Duración */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duración (minutos)</Label>
              <div className="flex items-center">
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
                />
                <Clock className="w-4 h-4 ml-2 text-gray-500" />
              </div>
              {errors.duration && (
                <p className="text-red-500 text-sm">
                  {errors.duration.message}
                </p>
              )}
            </div>

            {/* Nota de aprobación */}
            <div className="space-y-2">
              <Label htmlFor="passingScore">Nota de aprobación (%)</Label>
              <Input
                id="passingScore"
                type="number"
                {...register("passingScore", {
                  min: { value: 0, message: "La nota mínima debe ser 0" },
                  max: { value: 100, message: "La nota máxima debe ser 100" },
                  valueAsNumber: true,
                })}
              />
              {errors.passingScore && (
                <p className="text-red-500 text-sm">
                  {errors.passingScore.message}
                </p>
              )}
            </div>

            {/* Estado de publicación */}
            <div className="space-y-2">
              <Label htmlFor="publicationStatus">Estado de Publicación</Label>
              <Select
                // id="publicationStatus"
                value={publishedState ? "published" : "draft"}
                onValueChange={onSelectChange}
              >
                <SelectTrigger
                  className={
                    publishedState
                      ? "border-green-500 bg-green-100 text-green-800"
                      : "border-yellow-500 bg-yellow-100 text-yellow-800"
                  }
                >
                  <div className="flex items-center gap-2">
                    {publishedState ? (
                      <Globe className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    <SelectValue placeholder="Selecciona un estado" />
                  </div>
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-yellow-600" />
                      Borrador
                    </div>
                  </SelectItem>
                  <SelectItem value="published">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-green-600" />
                      Publicado
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {publishedState
                  ? "El examen está disponible para los estudiantes."
                  : "El examen está en modo borrador y no es visible para los estudiantes."}
              </p>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={4}
              placeholder="Describe brevemente este examen..."
            />
          </div>
        </form>
      </CardContent>

      <CardFooter>
        <Button
          onClick={onSubmit}
          disabled={!isDirty || isSubmitting}
          className="ml-auto"
        >
          <Save className="w-4 h-4 mr-1" />
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </CardFooter>

      <Dialog open={isConfirmOpen} onOpenChange={cancelPublish}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pendingState ? "Publicar examen" : "Despublicar examen"}
            </DialogTitle>
            <DialogDescription>
              {pendingState
                ? "¿Estás seguro de que deseas publicar este examen? Los estudiantes podrán verlo."
                : "¿Estás seguro de que deseas despublicar este examen? Los estudiantes ya no podrán verlo."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={cancelPublish}>
              Cancelar
            </Button>
            <Button onClick={confirmPublish}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
