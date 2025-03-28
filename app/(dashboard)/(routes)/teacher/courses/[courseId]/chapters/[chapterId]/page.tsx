import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, LayoutDashboard, Video, Save } from "lucide-react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";

import { ChapterTitleForm } from "./_components/chapter-title-form";
import { ChapterAccessForm } from "./_components/chapter-access-form";
import { ChapterVideoForm } from "./_components/chapter-video-form";
import { EnhancedChapterDescription } from "./_components/EnhancedChapterDescription/EnhancedChapterDescription";

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

const ChapterIdPage = async ({ params }: any) => {
  const chapter = await db.chapter.findUnique({
    where: { id: params.chapterId, courseId: params.courseId, delete: false },
  });

  if (!chapter) {
     return redirect("/app/(auth)");;
  }

  const courseAttachments = await db.course.findUnique({
    where: { id: params.courseId, delete: false },
    select: {
      attachments: { orderBy: { createdAt: "desc" } },
    },
  });

  const listItemHandlerChecks: HandlerChecksItem[] = courseAttachments
    ? courseAttachments.attachments
    : [];

  return (
    <div className="h-full w-full bg-Sky833">
      {!chapter.isPublished && (
        <Banner variant="warning" label={texts[language].unpublishedWarning} />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/teacher/courses/${params.courseId}`}
            className="flex items-center text-sm hover:opacity-75 transition mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {texts[language].backToCourseConfig}
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">{texts[language].customizeChapter}</h2>
              </div>
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
                lang="es" // Puedes cambiar el idioma si es necesario
              />
            </div>

            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Eye} />
                <h2 className="text-xl">{texts[language].accessSettings}</h2>
              </div>
              <ChapterAccessForm
                initialData={chapter}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Video} />
              <h2 className="text-xl">{texts[language].addVideo}</h2>
            </div>
            <ChapterVideoForm
              initialData={chapter}
              chapterId={params.chapterId}
              courseId={params.courseId}
            />

            <div className="flex items-center justify-end w-auto h-10 mt-20">
              <Link
                href={`/teacher/courses/${params.courseId}`}
                className="flex items-center text-sm hover:opacity-75 mb-6 bg-[green] p-2 rounded"
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
