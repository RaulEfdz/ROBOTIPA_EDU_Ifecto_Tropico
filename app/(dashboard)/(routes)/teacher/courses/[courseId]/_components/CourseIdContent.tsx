import { LayoutDashboard, ListChecks } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";
import { TitleForm } from "./inputs/title/title-form";
import { ImageForm } from "./inputs/images/image-form";
import { CategoryForm } from "./inputs/category-form";
import { ChaptersForm } from "./inputs/chapters-form";
import { Actions } from "./actions";
import BackButton from "@/app/(dashboard)/_components/backButton";
import ResourceSection from "./ResourceSection";
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
  },
  en: {
    notPublished: "This course is not published. It won't be visible to students.",
    courseSettings: "Course Settings",
    completeFields: "Complete all fields",
    customizeCourse: "Customize your course",
    courseChapters: "Course Chapters",
  },
};

export default function CourseIdContent({ course, categories, lang }: Props) {
  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.categoryId,
    course.chapters.some((chapter: any) => chapter.isPublished),
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `${completedFields}/${totalFields}`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!course.isPublished && <Banner label={texts[lang].notPublished} />}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <BackButton route="/teacher/courses" />
            <h1 className="text-2xl font-medium">{texts[lang].courseSettings}</h1>
            <span className="text-sm text-slate-700">
              {texts[lang].completeFields} {completionText}
            </span>
          </div>
          <Actions
            disabled={!isComplete}
            courseId={course.id}
            isPublished={course.isPublished}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">{texts[lang].customizeCourse}</h2>
            </div>
            <TitleForm initialData={course} courseId={course.id} />
            <ImageForm initialData={course} courseId={course.id} />
            <DescriptionForm initialData={course} courseId={course.id} />
            <CategoryForm
              initialData={course}
              courseId={course.id}
              // options={categories.map((category) => ({
              //   label: category.name,
              //   value: category.id,
              // }))}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-xl">{texts[lang].courseChapters}</h2>
              </div>
              <ChaptersForm initialData={course} courseId={course.id} />
            </div>
            <ResourceSection course={course} lang={lang} />
          </div>
        </div>
      </div>
    </>
  );
}
