"use client";

import type { Course } from "@/prisma/types";
import { CourseCard } from "@/components/course-card";
import { useState } from "react";
import { motion } from "framer-motion";
import { SkeletonCard } from "./SkeletonCard";

// Define un tipo que extiende el modelo para incluir progreso opcional
export type CourseWithProgress = Course & { progress?: number | null };

interface CoursesListProps {
  /**
   * Arreglo de cursos con progreso opcional.
   */
  items: CourseWithProgress[];
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
          {sortedItems.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              setLoading={setLoading}
            />
          ))}
        </motion.div>
      )}
    </section>
  );
};
