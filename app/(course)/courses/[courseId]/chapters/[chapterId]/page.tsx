"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

import { Banner } from "@/components/banner";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

import { getChapterU } from "./handler/getChapter";
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { formatPrice } from "@/lib/format";
import EditorTextPreview from "@/components/preview";
import ChapterHeader from "./_components/ChapterHeader";
import ChapterVideoSection from "./_components/ChapterVideoSection";
import CustomProgressButton from "./_components/CustomProgressButton";
import { CourseEnrollButton } from "./_components/course-enroll-button";
import ExamViewer from "./_components/exam/ExamViewer";
import ChapterHeaderBar from "./_components/customs/ChapterHeaderBar";

const ChapterIdPage: React.FC = () => {
  const params = useParams() as { courseId: string; chapterId: string };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [hasExam, setHasExam] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUserFromDB();
        if (!user?.id) {
          toast.error("No hay sesión activa.");
          router.push("/login");
          return;
        }

        const { courseId, chapterId } = params;
        if (!courseId || !chapterId) {
          toast.error("Curso o capítulo no especificado.");
          return;
        }

        const chapterData = await getChapterU({
          userId: user.id,
          courseId,
          chapterId,
        });

        const examCheck = await fetch(
          `/api/courses/${courseId}/chapters/${chapterId}/exam/current`
        );
        const examResult = await examCheck.json();
        setHasExam(!!examResult.exam);

        setData(chapterData);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        toast.error("Error inesperado al obtener los datos.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params, router]);

  useEffect(() => {
    if (!loading && data) {
      data.purchase
        ? toast.success("✅ Estás suscrito a este curso.")
        : toast.error("🔒 No estás suscrito a este curso.");
    }
  }, [loading, data]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-[450px] w-full rounded-xl mb-6" />
        <Skeleton className="h-10 w-48 mb-2" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-5xl mx-auto p-6 text-center mt-12">
        <div className="rounded-lg p-6 flex flex-col items-center bg-red-50 border border-red-200 shadow-md">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            No se pudo cargar el capítulo
          </h2>
          <p className="text-red-600 mb-4">
            Ha ocurrido un error al intentar cargar el contenido.
          </p>
          <Banner
            variant="warning"
            label="Intenta recargar la página o vuelve más tarde."
          />
        </div>
      </div>
    );
  }

  const { chapter, course, muxData, nextChapter, userProgress, purchase } =
    data;

  const isFreeChapter = Boolean(chapter.isFree);
  const isPaidChapter = !isFreeChapter;
  const isSubscribed = Boolean(purchase);
  const isLocked = isPaidChapter && !isSubscribed;
  const isCompleted = Boolean(userProgress?.isCompleted);
  const completeOnEnd = isSubscribed && !isCompleted;

  const chapters = Array.isArray(course?.chapters) ? course.chapters : [];
  const currentIndex = chapters.findIndex((ch: any) => ch.id === chapter.id);
  const chapterIndex = currentIndex >= 0 ? currentIndex + 1 : 1;
  const totalChapters = chapters.length;
  const prevChapterId =
    currentIndex > 0 ? chapters[currentIndex - 1].id : undefined;
  const nextChapterId = nextChapter?.id;

  return (
    <>
      <ChapterHeaderBar />
      <Toaster position="top-right" />
      <div
        className={`min-h-screen pb-16 ${
          isCompleted
            ? "bg-sky-50/50"
            : "bg-gradient-to-b from-slate-50 to-TextCustom"
        }`}
      >
        {isCompleted && (
          <Banner variant="success" label="✅ Ya completaste este capítulo." />
        )}
        {isLocked && (
          <Banner
            variant="warning"
            label="🔒 Debes inscribirte en este curso para ver este capítulo."
          />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <ChapterHeader
            courseTitle={course.title}
            courseId={course.id}
            chapterIndex={chapterIndex}
            totalChapters={totalChapters}
            chapterTitle={chapter.title}
            isFree={isFreeChapter}
            isCompleted={isCompleted}
            prevChapterId={prevChapterId}
            nextChapterId={nextChapterId}
          />

          <div className={isLocked ? "filter blur-sm pointer-events-none" : ""}>
            <ChapterVideoSection
              videoUrl={chapter.video?.url ?? ""}
              courseImageUrl={course.imageUrl}
              altText={chapter.title}
              isLocked={isLocked}
              playbackId={muxData?.playbackId}
              chapterId={chapter.id}
              courseId={course.id}
              nextChapterId={nextChapterId}
              completeOnEnd={completeOnEnd}
            />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 px-2">
            <div className="flex items-center gap-4">
              {chapter.estimatedTime && (
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md shadow-sm">
                  <span>{chapter.estimatedTime} min</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isSubscribed && !hasExam && (
                <CustomProgressButton
                  chapterId={chapter.id}
                  courseId={course.id}
                  nextChapterId={nextChapterId}
                  isCompleted={isCompleted}
                />
              )}
            </div>
          </div>

          <div className={isLocked ? "filter blur-sm pointer-events-none" : ""}>
            <Card className="p-6 mx-auto shadow-md border-slate-200">
              <EditorTextPreview htmlContent={chapter.description} />
            </Card>
          </div>

          {!isLocked && hasExam && (
            <div className="mt-12 max-h-[70vh] overflow-y-auto rounded-lg border">
              <ExamViewer
                isCompleted={isCompleted}
                nextChapterId={nextChapterId}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChapterIdPage;
