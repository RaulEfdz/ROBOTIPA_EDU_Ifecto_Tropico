// File: app/pages/course/[courseId]/hook/useCourse.ts
"use client";

import { useState, useEffect, useCallback } from "react";

// (Interfaz CoursePublicData y ChapterPreview permanecen igual)
export interface CoursePublicData {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  isPublished: boolean;
  delete: boolean;
  category: { id: string; name: string } | null;
  categoryId?: string | null;
  // Credits system
  creditEnabled?: boolean;
  creditsPerHour?: number | null;
  totalCredits?: number | null;
  chapters: Array<{
    id: string;
    title: string;
    isFree?: boolean;
    isPublished?: boolean;
    position: number;
  }>;
  data?: {
    learningObjectives?: string[];
    requirements?: string[];
    targetAudience?: string[];
  } | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  examId?: string | null;
  studentCount?: number; // Si decides añadirlo desde la API
}

export interface ChapterPreview {
  id: string;
  title: string;
  isFree?: boolean;
  position: number;
}

interface UseCourseReturn {
  course: CoursePublicData | null;
  chaptersPreview: ChapterPreview[];
  relatedCourses: CoursePublicData[];
  isLoading: boolean;
  error: string | null;
  refetchCourse: () => void; // La firma en la interfaz es correcta
}

export function useCourse(courseId: string | null): UseCourseReturn {
  const [course, setCourse] = useState<CoursePublicData | null>(null);
  const [chaptersPreview, setChaptersPreview] = useState<ChapterPreview[]>([]);
  const [relatedCourses, setRelatedCourses] = useState<CoursePublicData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourseData = useCallback(async () => {
    if (!courseId) {
      setIsLoading(false);
      setError("No se proporcionó ID de curso.");
      setCourse(null);
      setChaptersPreview([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    setCourse(null);
    setChaptersPreview([]);

    try {
      const response = await fetch(`/api/preview/courses/${courseId}`);
      if (!response.ok) {
        let errorMessage = `Error al obtener el curso: ${response.status} ${response.statusText}`;
        try {
          const errorBody = await response.json();
          if (errorBody && errorBody.error) {
            errorMessage = errorBody.error;
          }
        } catch (e) {
          /* No hacer nada si el cuerpo del error no es JSON */
        }
        throw new Error(errorMessage);
      }

      const dataFromApi = await response.json();

      if (dataFromApi && typeof dataFromApi === "object" && dataFromApi.id) {
        const courseData = dataFromApi as CoursePublicData;
        if (!courseData.title || !Array.isArray(courseData.chapters)) {
          throw new Error(
            "Los datos del curso recibidos son incompletos o tienen un formato incorrecto."
          );
        }
        setCourse(courseData);
        const previewChaps = (courseData.chapters || [])
          .filter((ch) => ch.isPublished)
          .sort((a, b) => a.position - b.position)
          .map((ch) => ({
            id: ch.id,
            title: ch.title,
            isFree: ch.isFree,
            position: ch.position,
          }));
        setChaptersPreview(previewChaps);
        setRelatedCourses([]);
      } else {
        console.error(
          "Respuesta de API exitosa pero datos inesperados:",
          dataFromApi
        );
        throw new Error("El formato de los datos del curso no es válido.");
      }
    } catch (err: any) {
      console.error("useCourse fetch error:", err);
      setError(
        err.message || "Ocurrió un error desconocido al cargar el curso."
      );
      setCourse(null);
      setChaptersPreview([]);
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourseData();
  }, [fetchCourseData]);

  return {
    course,
    chaptersPreview,
    relatedCourses,
    isLoading,
    error,
    refetchCourse: fetchCourseData, // <--- CORRECCIÓN AQUÍ
    // Asigna la función 'fetchCourseData' a la propiedad 'refetchCourse'
  };
}
