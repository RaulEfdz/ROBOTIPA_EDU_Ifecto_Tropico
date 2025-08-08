"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle, X, Search, BookOpen } from "lucide-react";

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
    const [currentExam, setCurrentExam] = useState<{ id: string; title: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>();
    const [isSaving, setIsSaving] = useState(false);
    const [hasDeletedExam, setHasDeletedExam] = useState(false);

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
            if (currentData.exam) {
              setCurrentExam(currentData.exam);
              setSelectedExamId(currentData.exam.id);
              setHasDeletedExam(false);
            } else if (currentData.deletedExamId) {
              // Exam was deleted, show warning and automatically clean up
              setCurrentExam({ id: currentData.deletedExamId, title: "Examen eliminado" });
              setSelectedExamId(null); // Auto-unassign deleted exam
              setHasDeletedExam(true);
              toast.error(currentData.message || "El examen asignado ya no existe");
              
              // Automatically clean up the deleted exam reference
              setTimeout(() => {
                handleSaveInternal(null);
              }, 1000);
            } else {
              setCurrentExam(null);
              setSelectedExamId(null);
              setHasDeletedExam(false);
            }
          } else if (currentRes.status === 404) {
            // 404 significa que no hay examen asignado al capítulo, es normal
            setCurrentExam(null);
            setSelectedExamId(null);
            setHasDeletedExam(false);
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

    // Internal save function that can be called programmatically
    const handleSaveInternal = async (examId: string | null, showToast: boolean = true) => {
      try {
        const res = await fetch(
          ENDPOINTS.assignExamToChapter(courseId, chapterId),
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ examId }),
          }
        );
        if (!res.ok) throw new Error(await res.text());

        if (showToast) {
          if (examId) {
            toast.success("Examen asignado al capítulo");
          } else {
            toast.success("Examen desasignado del capítulo");
          }
        }
        
        // Update local state
        setCurrentExam(examId ? exams.find(e => e.id === examId) || null : null);
        setHasDeletedExam(false);
        
        router.refresh();
      } catch (err: any) {
        if (showToast) {
          toast.error(err.message || "Error guardando el examen");
        }
        throw err;
      }
    };

    // Guardar examen en el capítulo (user-triggered)
    const handleSave = async () => {
      setIsSaving(true);
      try {
        await handleSaveInternal(selectedExamId, true);
      } catch (err: any) {
        // Error already handled in handleSaveInternal
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div
        className={cn(
          "mt-4 border border-gray-200 dark:border-gray-700",
          "bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Examen del capítulo
            </h4>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar exámenes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={isLoading || Boolean(error)}
              className="pl-10 max-w-xs"
            />
          </div>
        </div>

        {/* Current exam status */}
        {currentExam && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Examen actual:
                </span>
                <span className="text-sm text-blue-700 dark:text-blue-300">
                  {currentExam.title}
                </span>
                {hasDeletedExam && (
                  <Badge variant="destructive" className="ml-2">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Eliminado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Warning for deleted exam */}
        {hasDeletedExam && (
          <Alert className="mb-4 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              El examen asignado anteriormente ya no existe. Selecciona un nuevo examen o desasigna el actual.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-500">Cargando exámenes...</span>
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Selecciona un examen para este capítulo:
              </div>
              
              {/* Opción para no asignar examen */}
              <label className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name={`chapter-exam-${chapterId}`}
                  value=""
                  checked={selectedExamId === null}
                  onChange={() => setSelectedExamId(null)}
                  className="mr-3 w-4 h-4 text-blue-600"
                />
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600 dark:text-gray-400">
                    Sin examen asignado
                  </span>
                </div>
              </label>
              
              {/* Lista de exámenes disponibles */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredExams.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                    <p className="font-medium">No hay exámenes disponibles</p>
                    <p className="text-sm mt-1">
                      {searchTerm ? 'No se encontraron exámenes con ese término' : 'No hay exámenes creados para este curso'}
                    </p>
                  </div>
                ) : (
                  filteredExams.map((exam) => (
                    <label key={exam.id} className="flex items-center p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={`chapter-exam-${chapterId}`}
                        value={exam.id}
                        checked={selectedExamId === exam.id}
                        onChange={() => setSelectedExamId(exam.id)}
                        className="mr-3 w-4 h-4 text-blue-600"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {exam.title}
                        </span>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedExamId ? (
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Se asignará el examen seleccionado
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <X className="h-4 w-4 text-gray-400" />
                No se asignará ningún examen
              </span>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving || isLoading || Boolean(error)}
              className={cn(
                "transition-all duration-200",
                selectedExamId 
                  ? "bg-blue-600 hover:bg-blue-700 text-white" 
                  : "bg-gray-600 hover:bg-gray-700 text-white"
              )}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : selectedExamId ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Asignar Examen
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Desasignar Examen
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  });

ChapterExamSelector.displayName = "ChapterExamSelector";
