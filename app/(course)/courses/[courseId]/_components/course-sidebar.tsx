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
    return redirect("/");
  }

  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId: user.id,
        courseId: course.id,
      },
    },
  });

  const chaptersInOrder = course.chapters; // Asume que ya vienen ordenados por `position`

  const chapterCompletionStatus = new Map<string, boolean>();
  chaptersInOrder.forEach((chapter) => {
    chapterCompletionStatus.set(
      chapter.id,
      !!chapter.userProgress?.[0]?.isCompleted
    );
  });

  return (
    <aside className="h-full w-full md:w-80 border-r bg-gradient-to-b from-muted to-background shadow-sm flex flex-col overflow-y-auto">
      <div className="px-4 md:px-6 lg:px-8 p-6 border-b space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
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

      <nav className="flex flex-col divide-y divide-border w-full">
        {chaptersInOrder.map((chapter, index) => {
          const isFirstChapter = index === 0;
          const previousChapterId = isFirstChapter
            ? null
            : chaptersInOrder[index - 1].id;
          const isPreviousCompleted =
            isFirstChapter ||
            (previousChapterId
              ? (chapterCompletionStatus.get(previousChapterId) ?? false)
              : false);

          return (
            <CourseSidebarItem
              key={chapter.id}
              id={chapter.id}
              label={chapter.title}
              isCompleted={chapterCompletionStatus.get(chapter.id) ?? false}
              courseId={course.id}
              isPreviousCompleted={isPreviousCompleted}
              isFirstChapter={isFirstChapter}
              hasPurchase={!!purchase}
              isFree={chapter.isFree}
            />
          );
        })}
      </nav>
    </aside>
  );
};
