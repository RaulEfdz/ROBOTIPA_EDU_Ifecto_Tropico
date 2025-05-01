"use client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { useMemo, useState } from "react";
import { useExams } from "./hooks/useExams";

interface Exam {
  id: string;
  title: string;
}

interface ExamSelectorProps {
  courseId: string;
  initialExamIds?: string[];
}

export const ExamSelector: React.FC<ExamSelectorProps> = React.memo(
  ({ courseId, initialExamIds = [] }) => {
    const [searchTerm, setSearchTerm] = useState<string>("");

    const {
      exams,
      selected,
      setSelected,
      isLoading,
      error,
      isSaving,
      saveExams,
    } = useExams(courseId, initialExamIds);

    const selectedSet = useMemo(() => new Set(selected), [selected]);

    const filteredExams = useMemo(
      () =>
        exams.filter((exam) =>
          exam.title.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      [exams, searchTerm]
    );

    return (
      <div
        className={cn(
          "mt-6 border border-gray-200 dark:border-gray-700",
          "bg-stone-50 dark:bg-stone-900 rounded-lg p-6 shadow-sm"
        )}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Seleccionar Exámenes
          </h3>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              placeholder="Buscar exámenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading || !!error}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelected([])}
              disabled={isLoading || !!error}
            >
              Limpiar
            </Button>
          </div>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {isLoading ? (
            <p className="text-gray-500 italic">Cargando exámenes...</p>
          ) : error ? (
            <p className="text-red-500 italic">{error}</p>
          ) : filteredExams.length === 0 ? (
            <p className="text-gray-500 italic">No hay exámenes disponibles.</p>
          ) : (
            filteredExams.map((exam) => (
              <label key={exam.id} className="flex items-center">
                <Checkbox
                  checked={selectedSet.has(exam.id)}
                  onCheckedChange={(checked) => {
                    const isChecked = Boolean(checked);
                    setSelected((prev) =>
                      isChecked
                        ? [...prev, exam.id]
                        : prev.filter((id) => id !== exam.id)
                    );
                  }}
                />
                <span className="ml-2 text-gray-700 dark:text-gray-300">
                  {exam.title}
                </span>
              </label>
            ))
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={saveExams}
            disabled={isSaving || isLoading || !!error}
          >
            {isSaving ? "Guardando..." : "Guardar Exámenes"}
          </Button>
        </div>
      </div>
    );
  }
);

ExamSelector.displayName = "ExamSelector";
