import { redirect } from "next/navigation";
import { LayoutDashboard, ListChecks } from "lucide-react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";
import { TitleForm } from "./_components/title-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";
import { ChaptersForm } from "./_components/chapters-form";
import { Actions } from "./_components/actions";
import BackButton from "@/app/(dashboard)/_components/backButton";
import ResourceSection from "./_components/ResourceSection";
import DescriptionForm from "./_components/description-form";

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

interface CourseIdPageProps {
  params: { courseId: string };
  searchParams?: Record<string, string | string[]>;
}

const CourseIdPage = async ({ params }: any) => {
  const lang = "es"; 


  const course = await db.course.findUnique({
    where: { id: params.courseId,
      //  userId
      delete: false,

       },
    include: {
      chapters: { orderBy: { position: "asc" } },
      attachments: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!course) {
     return redirect("/app/(auth)");;
  }

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
  });

  const requiredFields = [
    course.title,
    course.description,
    course.imageUrl,
    course.categoryId,
    course.chapters.some((chapter) => chapter.isPublished),
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
          <Actions disabled={!isComplete} courseId={params.courseId} isPublished={course.isPublished} />
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
              options={categories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
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
            <ResourceSection course={course} lang={"es"}/>

          </div>
        </div>
      </div>
    </>
  );
};

export default CourseIdPage;
