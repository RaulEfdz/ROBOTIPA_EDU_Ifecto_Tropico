"use client";

import { Category, Course } from "@prisma/client";
import { CourseCard } from "@/components/course-card";
import LoaderWait from "./ui/Loader";
import { useState } from "react";
import { motion } from "framer-motion";

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

  const sortedItems = items.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <>
      {isLoading ? (
        <LoaderWait />
      ) : (
        <section className="px-4 py-6">
        

          {items.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center text-muted-foreground">
                <p className="text-lg font-medium">No se encontraron cursos.</p>
                <p className="text-sm mt-2">Vuelve más tarde para descubrir nuevos contenidos.</p>
              </div>
            </div>
          ) : (
            <motion.div
              className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
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
            </motion.div>
          )}
        </section>
      )}
    </>
  );
};
