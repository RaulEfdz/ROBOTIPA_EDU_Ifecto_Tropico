"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ChapterExamSelectorProps {
  courseId: string;
  chapterId: string;
}

// Constantes de endpoints
const API_BASE = "/api";
const ENDPOINTS = {
  getCourseExams: (courseId: string) =>
    `${API_BASE}/courses/${courseId}/exams/currents`,
  getChapterCurrent: (courseId: string, chapterId: string) =>
    `${API_BASE}/courses/${courseId}/chapters/${chapterId}/exam/current`,
  assignExamToChapter: (courseId: string, chapterId: string) =>
    `${API_BASE}/courses/${courseId}/chapters/${chapterId}/exam/set`,
};

export const ChapterExamSelector: React.FC<ChapterExamSelectorProps> =
  React.memo(({ courseId, chapterId }) => {
    const router = useRouter();

    // Estados
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
    const [exams, setExams] = useState<{ id: string; title: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>();
    const [isSaving, setIsSaving] = useState(false);

    // Efecto inicial: traer lista de exámenes y examen actual
    useEffect(() => {
      async function fetchData() {
        setIsLoading(true);
        setError(undefined);

        try {
          // 1) Listar exámenes del curso
          const [listRes, currentRes] = await Promise.all([
            fetch(ENDPOINTS.getCourseExams(courseId)),
            fetch(ENDPOINTS.getChapterCurrent(courseId, chapterId)),
          ]);

          if (!listRes.ok)
            throw new Error(`Error fetching exams list: ${listRes.statusText}`);

          const listData = await listRes.json();
          setExams(listData.exams || []);

          // Manejo especial para currentRes: 404 es normal (no hay examen asignado)
          if (currentRes.ok) {
            const currentData = await currentRes.json();
            setSelectedExamId(currentData.exam?.id || null);
          } else if (currentRes.status === 404) {
            // 404 significa que no hay examen asignado al capítulo, es normal
            setSelectedExamId(null);
          } else {
            // Solo otros errores son problemáticos
            throw new Error(
              `Error fetching current exam: ${currentRes.statusText}`
            );
          }
        } catch (err: any) {
          setError(err.message || "Error fetching data");
        } finally {
          setIsLoading(false);
        }
      }

      fetchData();
    }, [courseId, chapterId]);

    // Filtrar exámenes por título
    const filteredExams = useMemo(
      () =>
        exams.filter((exam) =>
          exam.title.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      [exams, searchTerm]
    );

    // Guardar examen en el capítulo
    const handleSave = async () => {
      setIsSaving(true);
      try {
        const res = await fetch(
          ENDPOINTS.assignExamToChapter(courseId, chapterId),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ examId: selectedExamId }),
          }
        );
        if (!res.ok) throw new Error(await res.text());

        if (selectedExamId) {
          toast.success("Examen asignado al capítulo");
        } else {
          toast.success("Examen desasignado del capítulo");
        }
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || "Error guardando el examen");
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div
        className={cn(
          "mt-4 border border-gray-200 dark:border-gray-700",
          "bg-stone-50 dark:bg-stone-900 rounded-lg p-6 shadow-sm"
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
            Examen del capítulo
          </h4>
          <Input
            placeholder="Buscar exámenes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isLoading || Boolean(error)}
            className="max-w-xs"
          />
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {isLoading ? (
            <p className="text-gray-500 italic">Cargando exámenes...</p>
          ) : error ? (
            <p className="text-red-500 italic">{error}</p>
          ) : (
            <>
              {/* Opción para no asignar examen */}
              <label className="flex items-center">
                <input
                  type="radio"
                  name={`chapter-exam-${chapterId}`}
                  value=""
                  checked={selectedExamId === null}
                  onChange={() => setSelectedExamId(null)}
                  className="mr-2"
                />
                <span className="text-gray-500 dark:text-gray-400 italic">
                  Sin examen asignado
                </span>
              </label>
              
              {/* Lista de exámenes disponibles */}
              {filteredExams.length === 0 ? (
                <p className="text-gray-500 italic ml-6">No hay exámenes creados para este curso.</p>
              ) : (
                filteredExams.map((exam) => (
                  <label key={exam.id} className="flex items-center">
                    <input
                      type="radio"
                      name={`chapter-exam-${chapterId}`}
                      value={exam.id}
                      checked={selectedExamId === exam.id}
                      onChange={() => setSelectedExamId(exam.id)}
                      className="mr-2"
                    />
                    <span className="text-gray-700 dark:text-gray-300">
                      {exam.title}
                    </span>
                  </label>
                ))
              )}
            </>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving || isLoading || Boolean(error)}
          >
            {isSaving ? "Guardando..." : selectedExamId ? "Asignar Examen" : "Desasignar Examen"}
          </Button>
        </div>
      </div>
    );
  });

ChapterExamSelector.displayName = "ChapterExamSelector";
