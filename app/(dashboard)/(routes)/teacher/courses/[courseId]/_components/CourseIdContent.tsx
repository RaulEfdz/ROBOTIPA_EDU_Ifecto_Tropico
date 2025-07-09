"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  ListChecks,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";
import { TitleForm } from "./inputs/title/title-form";
import { DescriptionForm } from "./inputs/description-form";
import { ImageForm } from "./inputs/images/image-form";
import { CategoryForm } from "./inputs/category-form";
import { PriceForm } from "./price-form";
import { ChaptersForm } from "./inputs/chapters-form";
import { Actions } from "./actions";
import { ExamSelector } from "./Exams/ExamSelector";
import { LearningObjectivesForm } from "./inputs/learning-objectives/learning-objectives-form";

interface Props {
  course: any;
  categories: any[];
  lang: "es" | "en";
}

const texts = {
  es: {
    notPublished:
      "Este curso no está publicado. No será visible para los estudiantes.",
    courseSettings: "Configuración del curso",
    completeFields: "Completa todos los campos",
    customizeCourse: "Personaliza tu curso",
    courseChapters: "Capítulos del curso",
    back: "Volver a mis cursos",
    learningObjectives: "Objetivos de aprendizaje",
    title: "Título del curso",
    description: "Descripción del curso",
    image: "Imagen del curso",
    category: "Categoría del curso",
    price: "Precio del curso",
    exams: "Exámenes",
  },
  en: {
    notPublished:
      "This course is not published. It won't be visible to students.",
    courseSettings: "Course Settings",
    completeFields: "Complete all fields",
    customizeCourse: "Customize your course",
    courseChapters: "Course Chapters",
    back: "Back to my courses",
    learningObjectives: "Learning objectives",
    title: "Course title",
    description: "Course description",
    image: "Course image",
    category: "Course category",
    price: "Course price",
    exams: "Exams",
  },
};

export default function CourseIdContent({ course, categories, lang }: Props) {
  const requiredFieldsWithLabels = [
    {
      label: texts[lang].title,
      isCompleted: !!course.title,
    },
    {
      label: texts[lang].description,
      isCompleted: !!course.description,
    },
    {
      label: texts[lang].image,
      isCompleted: !!course.imageUrl,
    },
    {
      label: texts[lang].category,
      isCompleted: !!course.categoryId,
    },
    {
      label: texts[lang].price,
      isCompleted: course.price !== null,
    },
  ];

  const totalFields = requiredFieldsWithLabels.length;
  const completedFields = requiredFieldsWithLabels.filter(
    (field) => field.isCompleted
  ).length;
  const completionText = `${completedFields}/${totalFields}`;
  const isComplete = completedFields === totalFields;

  // Improved background color contrast with a lighter background
  const bgColorClass = course.isPublished
    ? "bg-slate-100 dark:bg-slate-900"
    : "bg-slate-100 dark:bg-slate-900";

  return (
    <div
      className={`min-h-screen ${bgColorClass} transition-colors duration-300 mb-24`}
    >
      {/* Banner if not published */}
      {!course.isPublished && (
        <Banner variant="warning" label={texts[lang].notPublished} />
      )}

      <div className="px-4 py-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <Link
            href="/teacher/courses"
            className="flex items-center text-sm hover:opacity-75 transition bg-white dark:bg-gray-800 px-3 py-2 rounded-md shadow-md mb-4 sm:mb-0"
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

        {/* Section: Basic course settings */}
        <section className="mb-8 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-x-2 mb-6 border-b pb-4 dark:border-gray-700">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-lg sm:text-xl font-medium">
                {texts[lang].customizeCourse}
              </h2>
            </div>

            <div className="space-y-8">
              {/* Title form with visual divider */}
              <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <TitleForm initialData={course} courseId={course.id} />
              </div>

              {/* Description form with visual divider */}
              <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <DescriptionForm initialData={course} courseId={course.id} />
              </div>

              {/* Image form */}
              <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 max-w-md">
                <ImageForm initialData={course} courseId={course.id} />
              </div>

              {/* Category form */}
              <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <CategoryForm initialData={course} courseId={course.id} />
              </div>

              {/* Price form */}
              <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <PriceForm initialData={course} courseId={course.id} />
              </div>

              {/* Learning objectives */}
              <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-medium mb-4">
                  {texts[lang].learningObjectives}
                </h3>
                <LearningObjectivesForm
                  initialData={course}
                  courseId={course.id}
                />
              </div>

              {/* Exam selector */}
              <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <h3 className="text-md font-medium mb-4">Exams</h3>
                <ExamSelector
                  courseId={course.id}
                  initialExamIds={course.exams?.map((ex: any) => ex.id) || []}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Section: Chapters */}
        <section className="mb-6 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-x-2 mb-6 border-b pb-4 dark:border-gray-700">
              <IconBadge icon={ListChecks} />
              <h2 className="text-lg sm:text-xl font-medium">
                {texts[lang].courseChapters}
              </h2>
            </div>
            <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
              <ChaptersForm initialData={course} courseId={course.id} />
            </div>
          </div>
        </section>

        {/* Completion status */}
        <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-md shadow-md border border-gray-200 dark:border-gray-700 text-sm">
          <div className="flex justify-between items-center">
            <span className="font-medium">{texts[lang].completeFields}:</span>
            <span className="bg-primary-100 dark:bg-primary-900 px-3 py-1 rounded-full font-bold">
              {completionText}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
            <div
              className="bg-primary-500 h-2 rounded-full"
              style={{ width: `${(completedFields / totalFields) * 100}%` }}
            ></div>
          </div>

          {/* Detailed status */}
          <div className="mt-4 space-y-2">
            {requiredFieldsWithLabels.map((field, index) => (
              <div key={index} className="flex items-center">
                {field.isCompleted ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mr-2" />
                )}
                <span
                  className={`text-sm ${field.isCompleted ? "text-gray-700 dark:text-gray-300" : "text-red-500"}`}
                >
                  {field.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
