import { Chapter, Course, UserProgress } from "@prisma/client";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { CourseProgress } from "@/components/course-progress";
import { CourseSidebarItem } from "./course-sidebar-item";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
  const user = await getCurrentUserFromDBServer();

  if (!user?.id) {
    return redirect("/app/(auth)");
  }

  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
  });

  const sortedChapters = [...course.chapters].sort((a, b) => {
    const normalizedTitleA = a.title.toLowerCase().trim();
    const normalizedTitleB = b.title.toLowerCase().trim();
    const startsWithIntroA = normalizedTitleA.startsWith("introducción");
    const startsWithIntroB = normalizedTitleB.startsWith("introducción");

    if (startsWithIntroA && !startsWithIntroB) return -1;
    if (!startsWithIntroA && startsWithIntroB) return 1;

    return normalizedTitleA.localeCompare(normalizedTitleB);
  });

  return (
    <aside className="h-full w-full md:w-80 border-r bg-gradient-to-b from-muted to-background shadow-sm flex flex-col overflow-y-auto">
      {/* Header con botón de regreso */}
      <div className="p-6 border-b space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-foreground">
            📘 {course.title}
          </h1>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-primary-foreground hover:text-primary font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al menú principal
        </Link>

        {purchase && (
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Progreso del curso
            </p>
            <CourseProgress variant="success" value={progressCount} />
          </div>
        )}
      </div>

      {/* Lista de capítulos */}
      <nav className="flex flex-col divide-y divide-border">
        {sortedChapters.map((chapter, index) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={!!chapter.userProgress?.[0]?.isCompleted}
            courseId={course.id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}
      </nav>
    </aside>
  );
};
