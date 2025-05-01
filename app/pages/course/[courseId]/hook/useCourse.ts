// hooks/useCourse.ts
"use client";

import { useEffect, useState } from "react";
import { Course, Chapter } from "@/prisma/types";

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

  useEffect(() => {
    if (!courseId) return;

    async function fetchData() {
      setIsLoading(true);
      try {
        // 1. Cargar información del curso
        const res = await fetch(`/api/preview/courses/${courseId}`);
        if (!res.ok) throw new Error(res.statusText);
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
      } catch (err) {
        console.error(err);
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [courseId]);

  return { course, relatedCourses, chaptersPreview, isLoading };
}
