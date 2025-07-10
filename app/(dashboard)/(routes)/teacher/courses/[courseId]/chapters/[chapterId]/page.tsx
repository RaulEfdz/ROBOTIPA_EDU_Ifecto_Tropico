"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  LayoutDashboard,
  Save,
  Globe,
  Lock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  RotateCcw,
  VideoIcon,
} from "lucide-react";

import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";
import { ChapterTitleForm } from "./_components/chapter-title-form";
import { ChapterAccessForm } from "./_components/chapter-access-form";
import { EnhancedChapterDescription } from "./_components/EnhancedChapterDescription/EnhancedChapterDescription";
import { ChapterVideoForm } from "./_components/videos/components/ChapterVideoForm";
import { Chapter as PrismaChapter } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Video } from "@/prisma/types";
import { ChapterExamSelector } from "./exams/ChapterExamSelector";

export type ChapterWithVideo = PrismaChapter & {
  video?: Video | null;
};

export type HandlerChecksItem = {
  id: string;
  name: string;
  url: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  checked?: boolean;
};

interface ChapterDetailsResponse {
  chapter: ChapterWithVideo;
  attachments: HandlerChecksItem[];
}

const texts = {
  es: {
    unpublishedWarning:
      "Este capítulo no está publicado. No será visible en el curso",
    publishedSuccess:
      "Capítulo publicado. Visible para los estudiantes del curso",
    backToCourseConfig: "Volver a la configuración del curso",
    saveAndExit: "Guardar y salir",
    chapterCreation: "Creación de capítulos",
    completeAllFields: "Completa todos los campos",
    customizeChapter: "Personaliza tu capítulo",
    accessSettings: "Configuración de acceso",
    addVideo: "Agregar vídeo",
    resourcesForChapter: "Recursos para este capítulo",
    chapterDetails: "Detalles del capítulo",
    completionStatus: "Estado de completitud",
    chapterContent: "Contenido del capítulo",
    ready: "Listo",
    pending: "Pendiente",
    viewPreview: "Ver vista previa",
    publish: "Publicar capítulo",
    unpublish: "Despublicar",
    freeAccess: "Acceso gratuito",
    premiumAccess: "Acceso De Pago",
    editChapter: "Editando capítulo",
  },
  en: {
    unpublishedWarning:
      "This chapter is not published. It will not be visible in the course",
    publishedSuccess: "Chapter published. Visible to course students",
    backToCourseConfig: "Back to course configuration",
    saveAndExit: "Save and exit",
    chapterCreation: "Chapter creation",
    completeAllFields: "Complete all fields",
    customizeChapter: "Customize your chapter",
    accessSettings: "Access settings",
    addVideo: "Add video",
    resourcesForChapter: "Resources for this chapter",
    chapterDetails: "Chapter details",
    completionStatus: "Completion status",
    chapterContent: "Chapter content",
    ready: "Ready",
    pending: "Pending",
    viewPreview: "Preview",
    publish: "Publish chapter",
    unpublish: "Unpublish",
    freeAccess: "Free access",
    premiumAccess: "De Pago access",
    editChapter: "Editing chapter",
  },
};

const language = "es";

export default function ChapterIdPage() {
  const params = useParams<{ courseId: string; chapterId: string }>();
  const router = useRouter();

  const [chapter, setChapter] = useState<ChapterWithVideo | null>(null);
  const [attachments, setAttachments] = useState<HandlerChecksItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [publishingStatus, setPublishingStatus] = useState<boolean>(false);
  const [completionProgress, setCompletionProgress] = useState<number>(0);

  useEffect(() => {
    const fetchChapterData = async () => {
      if (!params || !params.courseId || !params.chapterId) return;

      try {
        const res = await fetch(
          `/api/courses/${params.courseId}/chapters/${params.chapterId}/chapter-details`,
          {
            method: "POST",
            cache: "no-store",
          }
        );

        if (!res.ok) {
          router.push("/");
          return;
        }

        const data: ChapterDetailsResponse = await res.json();
        setChapter(data.chapter);
        setAttachments(data.attachments ?? []);

        // Calcular progreso de completitud
        if (data.chapter) {
          let progress = 0;
          if (data.chapter.title) progress += 25;
          if (data.chapter.description) progress += 25;
          if (data.chapter.video) progress += 25;
          if (data.chapter.isPublished) progress += 25;
          setCompletionProgress(progress);
        }
      } catch (error) {
        console.error("Error al cargar el capítulo:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchChapterData();
  }, [params, router]);

  const togglePublishStatus = async () => {
    if (!chapter || !params || !params.courseId || !params.chapterId) return;

    setPublishingStatus(true);
    try {
      const response = await fetch(
        `/api/courses/${params.courseId}/chapters/${params.chapterId}/publish`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: !chapter.isPublished }),
        }
      );

      if (response.ok) {
        // Actualizamos el estado local y el progreso
        setChapter({ ...chapter, isPublished: !chapter.isPublished });
        let progress = completionProgress;
        if (!chapter.isPublished) progress += 25;
        else progress -= 25;
        setCompletionProgress(progress);
      }
    } catch (error) {
      console.error("Error al cambiar estado de publicación:", error);
    } finally {
      setPublishingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-t-primary-500 border-b-primary-500 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Cargando capítulo...</p>
        </div>
      </div>
    );
  }

  if (!chapter) return null;

  // Color de fondo según el estado de publicación
  const bgColorClass = chapter.isPublished
    ? "bg-gradient-to-b from-green-50 to-TextCustom dark:from-green-900/20 dark:to-gray-900"
    : "bg-gradient-to-b from-amber-50 to-TextCustom dark:from-amber-900/20 dark:to-gray-900";

  return (
    <div
      className={`min-h-screen ${bgColorClass} transition-colors duration-300 mb-24`}
    >
      {/* Banner según publicación */}
      {!chapter.isPublished ? (
        <Banner variant="warning" label={texts[language].unpublishedWarning} />
      ) : (
        <Banner variant="success" label={texts[language].publishedSuccess} />
      )}

      <div className="px-4 py-4 sm:p-6 max-w-7xl mx-auto">
        {/* Cabecera con botón de regreso y acciones */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <Link
            href={
              params && params.courseId
                ? `/teacher/courses/${params.courseId}`
                : "/teacher/courses"
            }
            className="flex items-center text-sm hover:opacity-75 transition bg-TextCustom dark:bg-gray-800 px-3 py-2 rounded-md shadow-sm mb-4 sm:mb-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {texts[language].backToCourseConfig}
          </Link>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex"
              onClick={() =>
                params &&
                params.courseId &&
                params.chapterId &&
                router.push(
                  `/courses/${params.courseId}/chapters/${params.chapterId}`
                )
              }
            >
              <Eye className="h-4 w-4 mr-2" />
              {texts[language].viewPreview}
            </Button>

            <Button
              onClick={togglePublishStatus}
              disabled={publishingStatus || completionProgress < 75}
              className={`${
                chapter.isPublished
                  ? "bg-amber-600 hover:bg-amber-700"
                  : "bg-primary-600 hover:bg-primary-700"
              } text-TextCustom`}
              size="sm"
            >
              {publishingStatus ? (
                <div className="h-4 w-4 border-2 border-TextCustom border-t-transparent rounded-full animate-spin mr-2" />
              ) : chapter.isPublished ? (
                <Lock className="h-4 w-4 mr-2" />
              ) : (
                <Globe className="h-4 w-4 mr-2" />
              )}
              {chapter.isPublished
                ? texts[language].unpublish
                : texts[language].publish}
            </Button>
          </div>
        </div>

        {/* Panel de acceso */}
        <div className="mb-6">
          <ChapterAccessForm
            initialData={chapter}
            courseId={params ? params.courseId : ""}
            chapterId={params ? params.chapterId : ""}
          />
        </div>

        {/* Tarjeta de estado del capítulo */}
        <Card className="mb-6 bg-TextCustom dark:bg-gray-800 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold mb-1">
                  {texts[language].editChapter}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                  {chapter.title || "Sin título"}
                </p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-3">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                    chapter.isFree
                      ? "bg-primary-100 text-green-800 dark:bg-primary-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {chapter.isFree ? (
                    <>
                      <Globe className="h-3 w-3" />
                      {texts[language].freeAccess}
                    </>
                  ) : (
                    <>
                      <Lock className="h-3 w-3" />
                      {texts[language].premiumAccess}
                    </>
                  )}
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                    chapter.isPublished
                      ? "bg-primary-100 text-green-800 dark:bg-primary-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                  }`}
                >
                  {chapter.isPublished ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      {texts[language].ready}
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-3 w-3" />
                      {texts[language].pending}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {texts[language].completionStatus}
                </h3>
                <span className="text-sm font-medium">
                  {completionProgress}%
                </span>
              </div>
              <Progress
                value={completionProgress}
                className="h-2 bg-gray-200 dark:bg-gray-700"
              />

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      chapter.title
                        ? "bg-primary-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  ></div>
                  <span>Título</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      chapter.description
                        ? "bg-primary-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  ></div>
                  <span>Descripción</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      chapter.video
                        ? "bg-primary-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  ></div>
                  <span>Video</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      chapter.isPublished
                        ? "bg-primary-500"
                        : "bg-gray-300 dark:bg-gray-600"
                    }`}
                  ></div>
                  <span>Publicado</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección: Personaliza tu capítulo */}
        <section className="mb-6 space-y-6">
          <div className="bg-TextCustom dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-x-2 mb-6">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-lg sm:text-xl font-medium">
                {texts[language].customizeChapter}
              </h2>
            </div>
            <ChapterTitleForm
              initialData={chapter}
              courseId={params ? params.courseId : ""}
              chapterId={params ? params.chapterId : ""}
            />
            {/* Se puede incluir aquí más contenido relacionado con la configuración de acceso,
                en este ejemplo solo se muestra el título y se deja el formulario en ChapterAccessForm */}
          </div>
        </section>

        {/* Sección: Agregar vídeo */}
        <section className="mb-6 space-y-6">
          <div className="bg-TextCustom dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex items-center gap-x-2 mb-6">
              <IconBadge icon={VideoIcon} />
              <h2 className="text-lg sm:text-xl font-medium">
                {texts[language].addVideo}
              </h2>
            </div>
            <ChapterVideoForm
              initialData={chapter}
              chapterId={params ? params.chapterId : ""}
              courseId={params ? params.courseId : ""}
            />
          </div>
        </section>

        {/* Sección: Descripción del capítulo */}
        <section className="mb-6 space-y-6">
          <EnhancedChapterDescription
            initialData={chapter}
            courseId={params ? params.courseId : ""}
            chapterId={params ? params.chapterId : ""}
            lang="es"
          />
        </section>

        <section className="mb-6 space-y-6">
          <ChapterExamSelector
            courseId={params ? params.courseId : ""}
            chapterId={params ? params.chapterId : ""}
          />
        </section>

        {/* Botón Guardar y Salir */}
        <div className="flex mt-6 sm:mt-8">
          <Link
            href={
              params && params.courseId && params.chapterId
                ? `/teacher/courses/${params.courseId}/chapters/${params.chapterId}`
                : "/teacher/courses"
            }
            className="w-full sm:w-auto ml-auto flex items-center justify-center text-sm bg-primary-600 hover:bg-primary-700 text-TextCustom px-6 py-3 rounded-md transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            {texts[language].saveAndExit}
          </Link>
        </div>
      </div>
    </div>
  );
}
