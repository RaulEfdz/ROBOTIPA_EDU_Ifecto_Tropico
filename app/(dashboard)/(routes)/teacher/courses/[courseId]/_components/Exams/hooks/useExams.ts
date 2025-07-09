import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

interface Exam {
  id: string;
  title: string;
}

/**
 * Hook para cargar, seleccionar y guardar exámenes asociados a un curso
 */
export function useExams(courseId: string, initialExamIds: string[] = []) {
  const [exams, setExams] = useState<Exam[]>([]);
  const [selected, setSelected] = useState<string[]>(initialExamIds);
  const [isLoadingExams, setIsLoadingExams] = useState<boolean>(true);
  const [isLoadingSelected, setIsLoadingSelected] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // 1) Carga de todos los exámenes disponibles
  useEffect(() => {
    let mounted = true;
    setIsLoadingExams(true);

    fetch("/api/exams/gets")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        setExams(Array.isArray(data.exams) ? data.exams : []);
      })
      .catch((err) => {
        console.error("[EXAMS_GETS]", err);
        if (mounted) setError("No se pudieron cargar los exámenes");
      })
      .finally(() => {
        if (mounted) setIsLoadingExams(false);
      });

    return () => {
      mounted = false;
    };
  }, [courseId]);

  // 2) Carga de los exámenes ya asignados al curso (id + title)
  useEffect(() => {
    let mounted = true;
    setIsLoadingSelected(true);

    fetch(`/api/courses/${courseId}/exams/currents`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!mounted) return;
        // data.exams: Array<{ id, title }>
        const currentIds = Array.isArray(data.exams)
          ? data.exams.map((e: Exam) => e.id)
          : initialExamIds;
        setSelected(currentIds);
      })
      .catch((err) => {
        console.error("[COURSE_EXAMS_CURRENTS]", err);
        // No es crítico, mantengo initialExamIds
      })
      .finally(() => {
        if (mounted) setIsLoadingSelected(false);
      });

    return () => {
      mounted = false;
    };
  }, [courseId]); // Solo depende de courseId

  // 3) Guardado de la selección de exámenes
  const saveExams = useCallback(async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/courses/${courseId}/exams/set`, {
        //  app/api/courses/[courseId]/exams/route.ts
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examIds: selected }),
      });

      // Manejo de respuesta vacía o JSON
      const text = await res.text();
      let payload: any = {};
      if (text) {
        try {
          payload = JSON.parse(text);
        } catch {
          payload = {};
        }
      }

      if (!res.ok) {
        throw new Error(payload.message || `HTTP ${res.status}`);
      }

      toast.success("Exámenes actualizados correctamente");
    } catch (err: any) {
      console.error("[SAVE_EXAMS]", err);
      toast.error(err.message || "Error al actualizar exámenes");
    } finally {
      setIsSaving(false);
    }
  }, [courseId, selected]);

  return {
    exams,
    selected,
    setSelected,
    isLoading: isLoadingExams || isLoadingSelected,
    error,
    isSaving,
    saveExams,
  };
}
