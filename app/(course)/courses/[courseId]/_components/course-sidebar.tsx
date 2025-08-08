"use client";

import { Chapter, Course, UserProgress } from "@prisma/client";
import { CourseProgress } from "@/components/course-progress";
import { CourseSidebarItem } from "./course-sidebar-item";
import WhatsAppStudentButton from "@/app/components/WhatsAppStudentButton";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock,
  Trophy,
  GraduationCap,
  PlayCircle,
  Award,
  Target,
  TrendingUp,
  Star,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Menu,
} from "lucide-react";
import { isHexColor, getPrimaryColor, generateColorVariants } from "@/lib/colors";
import { useSidebar } from "./course-layout-wrapper";

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
  purchase: any;
  user: any;
}

export const CourseSidebar = ({
  course,
  progressCount,
  purchase,
  user,
}: CourseSidebarProps) => {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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

  // Obtener estilos dinámicos
  const getDynamicStyles = () => {
    const primaryColor = getPrimaryColor();
    
    if (isHexColor(primaryColor)) {
      const variants = generateColorVariants(primaryColor);
      return {
        primary: variants[600],
        primaryLight: variants[100],
        primaryDark: variants[700],
        gradient: `linear-gradient(135deg, ${variants[600]}, ${variants[700]})`,
        lightGradient: `linear-gradient(135deg, ${variants[50]}, ${variants[100]})`,
        isCustom: true,
      };
    }
    
    const colorName = primaryColor.toLowerCase();
    return {
      primaryClass: `bg-${colorName}-600`,
      primaryLightClass: `bg-${colorName}-100`,
      textClass: `text-${colorName}-600`,
      isCustom: false,
    };
  };

  const styles = getDynamicStyles();

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white dark:bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
      >
        {isMobileOpen ? (
          <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        ) : (
          <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Desktop Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`fixed top-1/2 -translate-y-1/2 z-40 hidden lg:block transition-all duration-300 ${
          isCollapsed ? 'left-4' : 'left-[316px]'
        } bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-110`}
        style={styles.isCustom ? {
          borderColor: styles.primaryLight,
        } : undefined}
      >
        {isCollapsed ? (
          <ChevronRight 
            className="h-4 w-4 text-gray-600 dark:text-gray-400" 
            style={styles.isCustom ? { color: styles.primary } : undefined}
          />
        ) : (
          <ChevronLeft 
            className="h-4 w-4 text-gray-600 dark:text-gray-400"
            style={styles.isCustom ? { color: styles.primary } : undefined}
          />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        h-full flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 ease-in-out
        ${isMobileOpen ? 'fixed inset-y-0 left-0 z-40 w-80' : 'hidden'} 
        ${isCollapsed ? 'lg:flex lg:w-20' : 'lg:flex lg:w-80'}
        md:relative md:flex md:w-80
      `}>
      {/* Header Hero Section */}
      <div className={`relative overflow-hidden ${isCollapsed ? 'lg:hidden' : ''}`}>
        {/* Background Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }}
        />
        
        <div className="relative px-6 py-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
          {/* Course Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="p-3 rounded-2xl shadow-lg"
                style={styles.isCustom ? {
                  background: styles.lightGradient,
                } : undefined}
              >
                <BookOpen 
                  className="w-6 h-6"
                  style={styles.isCustom ? { color: styles.primary } : undefined}
                />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">
                  {course.title}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <PlayCircle className="w-4 h-4" />
                    <span>{totalChapters} lecciones</span>
                  </div>
                  {purchase && (
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Premium</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Navigation */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Explorar cursos</span>
            </Link>
          </div>

          {/* Progress Section */}
          {purchase ? (
            <div className="space-y-4">
           

           

              {/* Progress Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <span className="text-xs font-medium text-green-700 dark:text-green-300">Completado</span>
                  </div>
                  <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                    {Math.round(progressCount)}%
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Restantes</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    {totalChapters - completedChapters}
                  </div>
                </div>
              </div>

              {/* Completion Badge */}
              {isCompleted && (
                <div className="relative overflow-hidden">
                  <div 
                    className="flex items-center justify-center gap-3 p-4 rounded-xl text-white shadow-lg"
                    style={styles.isCustom ? {
                      background: styles.gradient,
                    } : undefined}
                  >
                    <Trophy className="w-5 h-5" />
                    <div className="text-center">
                      <div className="font-bold text-sm">¡Curso Completado!</div>
                      <div className="text-xs opacity-90">Felicidades por tu logro</div>
                    </div>
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Purchase Notice */
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3 mb-2">
                <GraduationCap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-amber-800 dark:text-amber-300">Acceso Premium</span>
              </div>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-3">
                Desbloquea todo el contenido del curso y obtén certificación oficial.
              </p>
              <button className="w-full bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                Obtener acceso
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Chapters List */}
      <div className="flex-1 overflow-y-auto">
        <div className={`px-4 py-4 ${isCollapsed ? 'lg:px-2' : ''}`}>
          {/* Chapters Header */}
          <div className={`sticky top-0 bg-white dark:bg-gray-900 z-10 pb-4 ${isCollapsed ? 'lg:hidden' : ''}`}>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={styles.isCustom ? {
                    backgroundColor: styles.primaryLight,
                  } : undefined}
                >
                  <BookOpen 
                    className="w-4 h-4"
                    style={styles.isCustom ? { color: styles.primary } : undefined}
                  />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                    Contenido del curso
                  </h2>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {totalChapters} lecciones disponibles
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-900 dark:text-white">
                  {completedChapters}/{totalChapters}
                </div>
              </div>
            </div>
          </div>

          {/* Collapsed Header - Only visible when collapsed */}
          <div className={`sticky top-0 bg-white dark:bg-gray-900 z-10 pb-2 ${isCollapsed ? 'lg:block' : 'lg:hidden'} hidden`}>
            <div className="flex items-center justify-center p-2">
              <div 
                className="p-2 rounded-lg"
                style={styles.isCustom ? {
                  backgroundColor: styles.primaryLight,
                } : undefined}
              >
                <BookOpen 
                  className="w-4 h-4"
                  style={styles.isCustom ? { color: styles.primary } : undefined}
                />
              </div>
            </div>
          </div>

          {/* Chapters Navigation */}
          <nav className="space-y-2 mt-4">
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

      {/* Footer Actions */}
      <div className={`border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-4 space-y-3 ${isCollapsed ? 'lg:hidden' : ''}`}>
        {/* Support Button */}
        {purchase && (
          <div className="space-y-2">
            <WhatsAppStudentButton
              courseTitle={course.title}
              userName={user.fullName || user.username}
              userEmail={user.email}
              variant="outline"
              size="sm"
              className="w-full"
            />
          </div>
        )}
        
        {/* Learning Tip */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <Clock className="w-4 h-4" />
          <span>Aprende a tu propio ritmo</span>
          <Award className="w-4 h-4" />
        </div>
        
        {/* Progress Indicator */}
        <div className="text-center">
          <div className="text-xs text-gray-400 dark:text-gray-500">
            Progreso del curso: {Math.round(progressCount)}%
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
            <div 
              className="h-1 rounded-full transition-all duration-300"
              style={styles.isCustom ? {
                backgroundColor: styles.primary,
                width: `${progressCount}%`,
              } : {
                width: `${progressCount}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};