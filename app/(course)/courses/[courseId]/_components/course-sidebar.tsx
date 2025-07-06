import { Chapter, Course, UserProgress } from "@prisma/client";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { CourseProgress } from "@/components/course-progress";
import { CourseSidebarItem } from "./course-sidebar-item";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import WhatsAppStudentButton from "@/app/components/WhatsAppStudentButton";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Users,
  Star,
  Trophy,
  GraduationCap,
} from "lucide-react";

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

  const chaptersInOrder = course.chapters;

  const chapterCompletionStatus = new Map<string, boolean>();
  chaptersInOrder.forEach((chapter) => {
    chapterCompletionStatus.set(
      chapter.id,
      !!chapter.userProgress?.[0]?.isCompleted
    );
  });

  const completedChapters = Array.from(chapterCompletionStatus.values()).filter(
    Boolean
  ).length;
  const totalChapters = chaptersInOrder.length;
  const isCompleted = completedChapters === totalChapters && totalChapters > 0;

  return (
    <aside className="h-full w-full md:w-80 border-r bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 shadow-lg flex flex-col overflow-hidden">
      {/* Header Section */}
      <div className="px-4 md:px-6 py-6 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        {/* Course Title */}
        <div className="mb-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
              <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {course.title}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {totalChapters} {totalChapters === 1 ? "capítulo" : "capítulos"}
              </p>
            </div>
          </div>

          {/* Navigation Link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Volver al catálogo
          </Link>
        </div>

        {/* Progress Section */}
        {purchase && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tu progreso
              </span>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-3 h-3" />
                {completedChapters}/{totalChapters}
              </div>
            </div>

            <CourseProgress variant="success" value={progressCount} />

            {/* Progress Stats */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="text-center p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <div className="text-lg font-bold text-slate-700 dark:text-slate-200">
                  {Math.round(progressCount)}%
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Completado
                </div>
              </div>
              <div className="text-center p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <div className="text-lg font-bold text-slate-700 dark:text-slate-300">
                  {totalChapters - completedChapters}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Restantes
                </div>
              </div>
            </div>

            {/* Completion Badge */}
            {isCompleted && (
              <div
  className="flex items-center justify-center gap-2 p-3 text-white rounded-lg shadow-md"
  style={{
    background: 'linear-gradient(to right, var(--primary), green)'
  }}
>
                <Trophy className="w-5 h-5" />
                <span className="font-semibold text-sm">
                  ¡Curso Completado!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Purchase Required Notice */}
        {!purchase && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400">
              <GraduationCap className="w-4 h-4" />
              <span className="text-sm font-medium">Acceso limitado</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-500 mt-1">
              Compra el curso para acceder a todo el contenido
            </p>
          </div>
        )}
      </div>

      {/* Chapters Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 py-2">
          <div className="mb-3 px-4 py-2">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
              Contenido del curso
            </h2>
          </div>

          <nav className="space-y-1">
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

              // Limpiar el título del capítulo removiendo caracteres extraños
              const cleanTitle = chapter.title.replace(/[•·]/g, "").trim();

              return (
                <CourseSidebarItem
                  key={chapter.id}
                  id={chapter.id}
                  label={cleanTitle}
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
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 space-y-3">
        {/* WhatsApp Button for Students */}
        {purchase && (
          <WhatsAppStudentButton
            courseTitle={course.title}
            userName={user.fullName || user.username}
            userEmail={user.email}
            variant="outline"
            size="sm"
            className="w-full"
          />
        )}
        
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Clock className="w-3 h-3" />
          <span>Aprende a tu ritmo</span>
        </div>
      </div>
    </aside>
  );
};
