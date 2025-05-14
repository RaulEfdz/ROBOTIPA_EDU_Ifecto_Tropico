"use client";

import type { Course } from "@/prisma/types";
import { CourseCard } from "@/components/course-card";
import { useState } from "react";
import { motion } from "framer-motion";
import { SkeletonCard } from "./SkeletonCard";

// Tipo base que extiende Course para añadir progreso opcional
export type CourseWithProgress = Course & {
  progress?: number | null;
};

// Tipo que añade además la categoría
export type CourseWithProgressWithCategory = CourseWithProgress & {
  category: { id: string; name: string };
};

interface CoursesListProps {
  /**
   * Arreglo de cursos con progreso opcional.
   * Puede venir con o sin la propiedad `category`.
   */
  items: Array<CourseWithProgress | CourseWithProgressWithCategory>;
}

export const CoursesList = ({ items }: CoursesListProps) => {
  const [isLoading, setLoading] = useState(false);

  // Ordenar por título
  const sortedItems = [...items].sort((a, b) => a.title.localeCompare(b.title));

  if (isLoading) {
    return <SkeletonCard />;
  }

  return (
    <section className="px-4 py-6">
      {items.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">No se encontraron cursos.</p>
            <p className="text-sm mt-2">
              Vuelve más tarde para descubrir nuevos contenidos.
            </p>
          </div>
        </div>
      ) : (
        <motion.div
          className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {sortedItems.map((course) => {
            if ("examId" in course) {
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  setLoading={setLoading}
                />
              );
            }
            return null; // Skip items without examId
          })}
        </motion.div>
      )}
    </section>
  );
};
