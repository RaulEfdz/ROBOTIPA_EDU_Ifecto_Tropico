import { Chapter, Course, UserProgress } from "@prisma/client";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { CourseProgress } from "@/components/course-progress";

import { CourseSidebarItem } from "./course-sidebar-item";
import { currentUser } from "@clerk/nextjs/server";
import { getUserDataServer } from "@/app/(auth)/auth/userCurrentServer";

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
}

export const CourseSidebar = async ({
  course,
  progressCount,
}: CourseSidebarProps) => {
    const user = (await getUserDataServer())?.user;
  

  if (!user?.id) {
    return redirect("/app/(auth)");
  }

  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId: user?.id,
        courseId: course.id,
      },
    },
  });

  // Ordenar capítulos alfabéticamente, pero priorizando los que comienzan con "introducción"
  const sortedChapters = [...course.chapters].sort((a, b) => {
    const normalizedTitleA = a.title.toLowerCase().trim();
    const normalizedTitleB = b.title.toLowerCase().trim();

    const startsWithIntroA = normalizedTitleA.startsWith("introducción");
    const startsWithIntroB = normalizedTitleB.startsWith("introducción");

    // Priorizar capítulos que comienzan con "introducción"
    if (startsWithIntroA && !startsWithIntroB) return -1;
    if (!startsWithIntroA && startsWithIntroB) return 1;

    // Ordenar alfabéticamente para el resto
    return normalizedTitleA.localeCompare(normalizedTitleB);
  });

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">Titulo:</h1>
        <h2>{course.title}</h2>
        {purchase && (
          <div className="mt-10">
            <h1 className="font-semibold">Progreso:</h1>
            <CourseProgress variant="success" value={progressCount} />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full">
        {sortedChapters.map((chapter) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}
      </div>
    </div>
  );
};