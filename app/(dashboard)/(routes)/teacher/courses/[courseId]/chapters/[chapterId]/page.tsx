import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, LayoutDashboard, Video, Save } from "lucide-react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";

import { ChapterTitleForm } from "./_components/chapter-title-form";
import { ChapterAccessForm } from "./_components/chapter-access-form";
import { EnhancedChapterDescription } from "./_components/EnhancedChapterDescription/EnhancedChapterDescription";
import { ChapterVideoForm } from "./_components/videos/components/ChapterVideoForm";

export type HandlerChecksItem = {
  id: string;
  name: string;
  url: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  checked?: boolean;
};

const texts = {
  es: {
    unpublishedWarning:
      "Este capítulo no está publicado. No será visible en el curso",
    backToCourseConfig: "Volver a la configuración del curso",
    saveAndExit: "Guardar y salir",
    chapterCreation: "Creación de capítulos",
    completeAllFields: "Completa todos los campos",
    customizeChapter: "Personaliza tu capítulo",
    accessSettings: "Configuración de acceso",
    addVideo: "Agregar vídeo",
    resourcesForChapter: "Recursos para este capítulo",
  },
};

const language = "es";

interface ChapterIdPageProps {
  params: {
    courseId: string;
    chapterId: string;
  };
}

const ChapterIdPage = async ({ params }: ChapterIdPageProps) => {
  const chapter = await db.chapter.findFirst({
    where: {
      id: params.chapterId,
      courseId: params.courseId,
      delete: false,
    },
    include: {
      video: true,
    },
  });

  if (!chapter) {
    return redirect("/app/(auth)");
  }

  const courseAttachments = await db.course.findUnique({
    where: {
      id: params.courseId,
      delete: false,
    },
    select: {
      attachments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const listItemHandlerChecks: HandlerChecksItem[] =
    courseAttachments?.attachments ?? [];

  return (
    <div className="h-full w-full bg-Sky833">
      {/* Warning banner - full width */}
      {!chapter.isPublished && (
        <Banner
          variant="warning"
          label={texts[language].unpublishedWarning}
        />
      )}

      {/* Main content container with responsive padding */}
      <div className="px-4 py-4 sm:p-6 max-w-7xl mx-auto">
        {/* Navigation header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Link
            href={`/teacher/courses/${params.courseId}`}
            className="flex items-center text-sm hover:opacity-75 transition"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {texts[language].backToCourseConfig}
          </Link>
        </div>

        {/* Main content grid - responsive from 1 to 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-10">
          {/* Left column */}
          <div className="space-y-6 sm:space-y-8">
            {/* Chapter customization section */}
            <section className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-x-2 mb-4">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-lg sm:text-xl font-medium">{texts[language].customizeChapter}</h2>
              </div>
              
              <div className="space-y-6">
                <ChapterTitleForm
                  initialData={chapter}
                  courseId={params.courseId}
                  chapterId={params.chapterId}
                />

                <EnhancedChapterDescription
                  initialData={chapter}
                  courseId={params.courseId}
                  chapterId={params.chapterId}
                  items={listItemHandlerChecks}
                  lang="es"
                />
              </div>
            </section>

            {/* Access settings section */}
            <section className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-x-2 mb-4">
                <IconBadge icon={Eye} />
                <h2 className="text-lg sm:text-xl font-medium">{texts[language].accessSettings}</h2>
              </div>
              
              <ChapterAccessForm
                initialData={chapter}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-6 sm:space-y-8">
            {/* Video section */}
            <section className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-center gap-x-2 mb-4">
                <IconBadge icon={Video} />
                <h2 className="text-lg sm:text-xl font-medium">{texts[language].addVideo}</h2>
              </div>
              
              <ChapterVideoForm
                initialData={chapter}
                chapterId={params.chapterId}
                courseId={params.courseId}
              />
            </section>

            {/* Save button - right aligned on larger screens, full width on mobile */}
            <div className="flex mt-4 sm:mt-6">
              <Link
                href={`/teacher/courses/${params.courseId}`}
                className="w-full sm:w-auto ml-auto flex items-center justify-center text-sm bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                {texts[language].saveAndExit}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterIdPage;