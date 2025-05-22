"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { PlusCircle, X, Save, BookOpen, Info } from "lucide-react";
import {
  learningObjectives,
  suggestedLearningObjectives,
} from "./learning-objectives";
import { Course } from "@/prisma/types";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface LearningObjectivesFormProps {
  initialData: Course;
  courseId: string;
}

export function LearningObjectivesForm({
  initialData,
  courseId,
}: LearningObjectivesFormProps) {
  const [objectives, setObjectives] = useState<string[]>(
    initialData?.data?.learningObjectives || []
  );

  const [newObjective, setNewObjective] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddObjective = (text?: string) => {
    const value = text ?? newObjective.trim();
    if (!value) return;

    if (objectives.includes(value)) {
      toast.error("Este objetivo ya existe en la lista");
      return;
    }

    setObjectives((prev) => [...prev, value]);
    setNewObjective("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newObjective.trim()) {
      e.preventDefault();
      handleAddObjective();
    }
  };

  const handleRemoveObjective = (index: number) => {
    setObjectives((prev) => prev.filter((_, i) => i !== index));
    toast.info("Objetivo eliminado");
  };

  const handleSave = async () => {
    if (objectives.length === 0) {
      toast.warning("Agrega al menos un objetivo antes de guardar");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/courses/${courseId}/learning-objectives`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ learningObjectives: objectives }),
        }
      );

      if (!response.ok) throw new Error();

      toast.success("Objetivos actualizados correctamente");
    } catch (error) {
      toast.error("Error al actualizar los objetivos");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white dark:bg-gray-950 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 border-b pb-4 mb-4">
        <BookOpen className="h-5 w-5 text-emerald-600" />
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
          Objetivos de Aprendizaje
          <span title="Agrega los objetivos que los estudiantes lograrán al finalizar el curso.">
            <Info className="w-4 h-4 text-emerald-500" />
          </span>
        </h3>
        {objectives.length > 0 ? (
          <Badge className="bg-emerald-100 text-emerald-700 text-base px-3 py-1 ml-2 animate-pulse">
            Completado
          </Badge>
        ) : (
          <Badge className="bg-gray-200 text-gray-600 text-base px-3 py-1 ml-2 animate-pulse">
            Pendiente
          </Badge>
        )}
      </div>

      {/* Input para añadir nuevo objetivo con mejoras de accesibilidad */}
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Escribe un objetivo..."
          value={newObjective}
          onChange={(e) => setNewObjective(e.target.value)}
          onKeyDown={handleKeyDown}
          aria-label="Nuevo objetivo de aprendizaje"
          className="shadow-sm focus-visible:ring-emerald-500"
        />
        <Button
          type="button"
          onClick={() => handleAddObjective()}
          disabled={!newObjective.trim()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Añadir
        </Button>
      </div>

      {/* Sugerencias rápidas con mejor diseño */}
      <div className="space-y-3 bg-emerald-50 dark:bg-gray-900 p-4 rounded-lg">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Sugerencias rápidas:
        </p>
        <div className="flex flex-wrap gap-2">
          {learningObjectives.map((option, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleAddObjective(option)}
              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-sm px-3 py-1.5 rounded-full transition flex items-center"
            >
              <PlusCircle className="h-3 w-3 mr-1" />
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de objetivos agregados con mejoras visuales */}
      <div className="space-y-3 mt-6">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-semibold text-gray-700 dark:text-white flex items-center">
            Lista de objetivos
            <span className="ml-2 bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-emerald-900 dark:text-emerald-300">
              {objectives.length}
            </span>
          </h4>
        </div>

        {objectives.length > 0 ? (
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {objectives.map((obj, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-800 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 p-3 rounded-md transition"
              >
                <span className="text-black dark:text-gray-200 flex items-center">
                  <span className="bg-emerald-600 text-white w-6 h-6 flex items-center justify-center rounded-full text-xs mr-3">
                    {index + 1}
                  </span>
                  {obj}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveObjective(index)}
                  className="text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                  aria-label={`Eliminar objetivo: ${obj}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay objetivos agregados. Añade algunos para mejorar tu curso.
            </p>
          </div>
        )}
      </div>

      {/* Botón de guardar con mejor UX */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800 mt-6">
        <Button
          onClick={handleSave}
          disabled={isSaving || objectives.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center"
        >
          {isSaving ? (
            <>Guardando...</>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
