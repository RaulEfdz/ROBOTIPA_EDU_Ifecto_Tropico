"use client";

import { Category, Course } from "@prisma/client";

import { CourseCard } from "@/components/course-card";
import LoaderWait from "./ui/Loader";
import { useState } from "react";

type CourseWithProgressWithCategory = Course & {
  category: Category | null;
  chapters: { id: string }[];
  progress: number | null;
};

interface CoursesListProps {
  items: CourseWithProgressWithCategory[];
}

export const CoursesList = ({ items }: CoursesListProps) => {
  const [isLoading, setLoading] = useState<boolean>(false);

  // Ordena los cursos por su título en orden alfabético
  const sortedItems = items.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      {isLoading ? (
        <LoaderWait />
      ) : (
        <div>
          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
            {sortedItems.map((item) => (
              <CourseCard
                key={item.id}
                id={item.id}
                title={item.title}
                imageUrl={item.imageUrl!}
                chaptersLength={item.chapters.length}
                price={item.price!}
                progress={item.progress}
                category={item?.category?.name!}
                isPublished={item.isPublished}
                setLoading={setLoading}
              />
            ))}
          </div>
          {items.length === 0 && (
            <div className="text-center text-sm text-muted-foreground mt-10">
              No se encontraron cursos.
            </div>
          )}
        </div>
      )}
    </>
  );
};
