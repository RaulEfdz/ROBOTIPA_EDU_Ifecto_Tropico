"use client";

import Link from "next/link";
import { LayoutDashboard, ListChecks, ArrowLeft } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";
import { TitleForm } from "./inputs/title/title-form";
import { ImageForm } from "./inputs/images/image-form";
import { CategoryForm } from "./inputs/category-form";
import { ChaptersForm } from "./inputs/chapters-form";
import { Actions } from "./actions";
import { DescriptionForm } from "./inputs/description-form";

interface Props {
  course: any;
  categories: any[];
  lang: "es" | "en";
}

const texts = {
  es: {
    notPublished: "Este curso no está publicado. No será visible para los estudiantes.",
    courseSettings: "Configuración del curso",
    completeFields: "Completa todos los campos",
    customizeCourse: "Personaliza tu curso",
    courseChapters: "Capítulos del curso",
    back: "Volver a mis cursos",
  },
  en: {
    notPublished: "This course is not published. It won't be visible to students.",
    courseSettings: "Course Settings",
    completeFields: "Complete all fields",
    customizeCourse: "Customize your course",
    courseChapters: "Course Chapters",
    back: "Back to my courses",
  },
};

export default function CourseIdContent({ course, categories, lang }: Props) {
  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.categoryId,
    course.chapters?.some((chapter: any) => chapter.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `${completedFields}/${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  // Color de fondo según estado de publicación
  const bgColorClass = course.isPublished
  ? "bg-gradient-to-b from-green-50 to-TextCustom dark:from-green-900/20 dark:to-gray-900"
  : "bg-gradient-to-b from-sky-50 to-TextCustom dark:from-sky-900/20 dark:to-gray-900";

  return (
    <div className={`min-h-screen ${bgColorClass} transition-colors duration-300 mb-24`}>
      {/* Banner */}
      {!course.isPublished && <Banner variant="warning" label={texts[lang].notPublished} />}

      <div className="px-4 py-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <Link
            href="/teacher/courses"
            className="flex items-center text-sm hover:opacity-75 transition bg-TextCustom dark:bg-gray-800 px-3 py-2 rounded-md shadow-sm mb-4 sm:mb-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {texts[lang].back}
          </Link>

          <Actions
            disabled={isComplete}
            courseId={course.id}
            isPublished={course.isPublished}
          />
        </div>

        {/* Customization section */}
        <section className="mb-6 space-y-6">
          <div className="bg-TextCustom dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-x-2 mb-6">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-lg sm:text-xl font-medium">{texts[lang].customizeCourse}</h2>
            </div>
            <div className="space-y-6">
              <TitleForm initialData={course} courseId={course.id} />
              <DescriptionForm initialData={course} courseId={course.id} />
              <div className="max-w-md">
                <ImageForm initialData={course} courseId={course.id} />
              </div>
              <CategoryForm initialData={course} courseId={course.id} />
            </div>
          </div>
        </section>

        {/* Chapters section */}
        <section className="mb-6 space-y-6">
          <div className="bg-TextCustom dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-x-2 mb-6">
              <IconBadge icon={ListChecks} />
              <h2 className="text-lg sm:text-xl font-medium">{texts[lang].courseChapters}</h2>
            </div>
            <ChaptersForm initialData={course} courseId={course.id} />
          </div>
        </section>

        {/* Completion status */}
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-right">
          {texts[lang].completeFields}: <strong>{completionText}</strong>
        </div>
      </div>
    </div>
  );
}
