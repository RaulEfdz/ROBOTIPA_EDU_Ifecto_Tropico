"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCourseWithPublishedChapters } from "./getCourseData"; // esto debe llamarse desde un API, no directo
import NoChaptersPage from "./NoChaptersPage";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

// ⚠️ Client components NO pueden llamar funciones server directamente.
// Creamos un endpoint en /api para eso.
interface Chapter {
  id: string;
  isPublished: boolean;
  position: number;
}

interface Course {
  id: string;
  chapters: Chapter[];
}

const CourseRedirector = () => {
  const { courseId } = useParams() as { courseId: string };
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/courses/${courseId}/published-chapters`, {
          //   app/api/courses/[courseId]/published-chapters/route.ts
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("No se encontró el curso");
        }

        const data: Course = await res.json();
        setCourse(data);

        if (!data.chapters.length) return;

        router.push(`/courses/${data.id}/chapters/${data.chapters[0].id}`);
      } catch (error) {
        console.error("Error al obtener curso:", error);
        toast.error("No se pudo cargar el curso.");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, router]);

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-64 w-full mb-4" />
      </div>
    );
  }

  if (!course) return <NoChaptersPage />;

  if (!course.chapters.length) return <NoChaptersPage />;

  return null;
};

export default CourseRedirector;
