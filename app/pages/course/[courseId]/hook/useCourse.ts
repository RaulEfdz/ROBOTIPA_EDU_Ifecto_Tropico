"use client";

import { useEffect, useState } from "react";
import { Course } from "@/prisma/types";

export interface ChapterPreview {
  id: string;
  title: string;
  isPublished: boolean;
}

export function useCourse(courseId?: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [chaptersPreview, setChaptersPreview] = useState<ChapterPreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // 🆕

  useEffect(() => {
    if (!courseId) {
      setError("ID de curso inválido.");
      setIsLoading(false);
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null); // 🆕 resetear errores

      try {
        // 1. Cargar información del curso
        const res = await fetch(`/api/preview/courses/${courseId}`);
        if (!res.ok) throw new Error("Curso no encontrado");
        const data: Course = await res.json();
        setCourse(data);

        // 2. Cargar cursos relacionados
        if (data.categoryId) {
          const relRes = await fetch(
            `/api/courses?category=${data.categoryId}&limit=3`
          );
          if (relRes.ok) {
            const list: Course[] = await relRes.json();
            setRelatedCourses(list.filter((c) => c.id !== courseId));
          }
        }

        // 3. Cargar capítulos en preview
        const chaptersRes = await fetch(
          `/api/preview/chapters?courseId=${courseId}`
        );
        if (chaptersRes.ok) {
          const chapters: ChapterPreview[] = await chaptersRes.json();
          setChaptersPreview(chapters);
        }
      } catch (err: any) {
        console.error("Error en useCourse:", err);
        setCourse(null);
        setRelatedCourses([]);
        setChaptersPreview([]);
        setError(err.message ?? "Error al cargar el curso."); // 🆕
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [courseId]);

  return { course, relatedCourses, chaptersPreview, isLoading, error }; // 🆕
}
