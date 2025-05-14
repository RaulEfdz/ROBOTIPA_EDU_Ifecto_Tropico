"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";

import { Banner } from "@/components/banner";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Lock, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { getChapterU } from "./handler/getChapter";
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import EditorTextPreview from "@/components/preview";
import ChapterHeader from "./_components/ChapterHeader";
import ChapterVideoSection from "./_components/ChapterVideoSection";
import CustomProgressButton from "./_components/CustomProgressButton";
import { CourseEnrollButton } from "./_components/course-enroll-button";
import ExamViewer from "./_components/exam/examViewer/ExamViewer"; // Asegúrate que el nombre del componente sea correcto
import ChapterHeaderBar from "./_components/customs/ChapterHeaderBar";

// Para el toast de bienvenida "una sola vez por curso"
const WELCOME_TOAST_SHOWN_KEY_PREFIX = "welcomeToastShown_course_";

const ChapterIdPage: React.FC = () => {
  const params = useParams() as { courseId: string; chapterId: string };
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null); // Considera tipar esto mejor si la estructura de getChapterU es fija
  const [hasExam, setHasExam] = useState(false);
  const [isSequentiallyLocked, setIsSequentiallyLocked] = useState(false);
  // subscriptionToastShown ya no es necesario para el toast de bienvenida, usaremos localStorage

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setIsSequentiallyLocked(false);

      try {
        const user = await getCurrentUserFromDB();
        if (!user?.id) {
          router.push(
            "/auth?redirectUrl=" +
              encodeURIComponent(
                window.location.pathname + window.location.search
              )
          );
          return;
        }

        const { courseId, chapterId } = params;
        if (!courseId || !chapterId) {
          toast.error("Curso o capítulo no especificado.");
          setLoading(false);
          return;
        }

        const chapterData = await getChapterU({
          userId: user.id,
          courseId,
          chapterId,
        });

        setData(chapterData); // Guardar datos tan pronto como se obtienen

        // Lógica de bloqueo secuencial
        if (
          !chapterData.isFirstChapter &&
          !chapterData.isPreviousChapterCompleted
        ) {
          // Solo bloquear si el capítulo actual no es gratuito Y no hay compra
          // O si es gratuito pero el anterior no está completado.
          if (
            (!chapterData.chapter.isFree && !chapterData.purchase) ||
            chapterData.chapter.isFree
          ) {
            setIsSequentiallyLocked(true);
            if (chapterData.chapter.isFree && !chapterData.purchase) {
              // No mostrar toast de error si es gratuito y solo está bloqueado secuencialmente
            } else if (!chapterData.chapter.isFree && !chapterData.purchase) {
              // Sigue bloqueado por pago, el banner de inscripción se encargará
            } else {
              toast.error(
                "Debes completar el capítulo anterior para acceder a este."
              );
            }
            // No retornamos aquí todavía para permitir que el resto de la UI se renderice con el estado de bloqueo
          }
        }

        const examCheck = await fetch(
          `/api/courses/${courseId}/chapters/${chapterId}/exam/current`
        );
        if (!examCheck.ok) {
          console.warn(`Error fetching exam status: ${examCheck.status}`);
          setHasExam(false);
        } else {
          const examResult = await examCheck.json();
          setHasExam(!!examResult.exam);
        }
      } catch (error: any) {
        console.error("Error al cargar los datos:", error);
        toast.error(error.message || "Error inesperado al obtener los datos.");
        setData(null); // Asegurar que data es null en caso de error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params, router]);

  useEffect(() => {
    if (loading || !data || isSequentiallyLocked) {
      return; // No hacer nada si está cargando, no hay datos, o está bloqueado secuencialmente
    }

    const { purchase, chapter, isFirstChapter, course, userProgress } = data;
    const isFreeChapter = chapter.isFree;
    const welcomeToastKey = `${WELCOME_TOAST_SHOWN_KEY_PREFIX}${course.id}`;
    const hasShownWelcomeToast =
      localStorage.getItem(welcomeToastKey) === "true";

    // 1. Toast de bienvenida "Inscripción activa"
    if (
      purchase &&
      isFirstChapter &&
      !userProgress?.isCompleted &&
      !hasShownWelcomeToast
    ) {
      // Considerar también si hay algún progreso en CUALQUIER capítulo de este curso.
      // Por ahora, `!userProgress?.isCompleted` verifica solo el progreso del capítulo actual.
      // Si `getChapterU` pudiera devolver `hasAnyCourseProgress: boolean`, sería más preciso.
      // Asumiendo que si `userProgress` es nulo para el primer capítulo, es su primera vez en el curso.
      let isTrulyFirstTimeInCourse = true; // Esta lógica podría necesitar mejorar
      if (course?.chapters?.length > 0) {
        // Una forma simple de verificar si hay progreso en cualquier capítulo del curso
        // Esto asume que `data.course.chapters` incluye `userProgress` para cada capítulo.
        // Si no, necesitarías una llamada API separada o que `getChapterU` lo provea.
        const anyProgress = course.chapters.some(
          (ch: any) =>
            ch.userProgress &&
            ch.userProgress.length > 0 &&
            ch.userProgress[0].isCompleted
        );
        if (anyProgress) {
          isTrulyFirstTimeInCourse = false;
        }
      }

      if (isTrulyFirstTimeInCourse) {
        toast.success("Inscripción activa. ¡Disfruta el contenido!", {
          duration: 4000,
        });
        localStorage.setItem(welcomeToastKey, "true");
      }
    }
    // 2. Otros toasts (capítulo gratuito o requiere inscripción)
    else if (!purchase) {
      // Solo mostrar estos si no hay compra
      if (isFreeChapter) {
        toast.info("✨ ¡Estás viendo un capítulo gratuito!", {
          duration: 3500,
        });
      } else {
        // El banner "🔒 Debes inscribirte..." ya maneja esto visualmente.
        // Podrías añadir un toast aquí si el banner no es suficiente,
        // pero podría ser redundante.
        // toast.warning("🔒 Este capítulo requiere inscripción.", {
        //   duration: 5000,
        // });
      }
    }

    // El estado `subscriptionToastShown` ya no es necesario para controlar estos toasts
    // porque la lógica de `hasShownWelcomeToast` y las condiciones `if/else if` lo manejan.
  }, [loading, data, isSequentiallyLocked, params.courseId]); // params.courseId para la key del localStorage

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
            Ha ocurrido un error al intentar cargar el contenido. Intenta
            recargar la página o vuelve más tarde.
          </p>
        </div>
      </div>
    );
  }

  // Mover la renderización del bloqueo secuencial aquí, después de que 'data' esté disponible.
  if (isSequentiallyLocked) {
    // Solo mostrar bloqueo si el capítulo actual no es gratuito y el usuario no está suscrito,
    // O si el capítulo es gratuito pero está bloqueado secuencialmente.
    const showSequentialLock =
      (data.chapter.isFree && !data.purchase) ||
      (!data.chapter.isFree &&
        !data.purchase &&
        !data.isPreviousChapterCompleted &&
        !data.isFirstChapter);
    // Corrección: El bloqueo secuencial debe aplicar incluso si es gratuito, si el anterior no está completo.
    // La condición original era `(data.chapter.isFree && !data.purchase)`. Esto es para el toast.
    // El bloqueo real es si `isSequentiallyLocked` es true.

    if (
      data.chapter.isFree &&
      data.isPreviousChapterCompleted === false &&
      data.isFirstChapter === false
    ) {
      // no hacer nada
    } else if (!data.chapter.isFree && !data.purchase) {
      // No mostrar el modal de bloqueo secuencial si el problema principal es la falta de compra
      // El banner de "requiere inscripción" se mostrará en su lugar.
    } else {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-6">
          <Lock className="w-16 h-16 text-yellow-500 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Capítulo Bloqueado</h2>
          <p className="text-slate-600 mb-6 max-w-md">
            Necesitas completar el capítulo anterior antes de poder acceder a
            este contenido.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Volver al capítulo anterior
          </Button>
        </div>
      );
    }
  }

  const { chapter, course, muxData, nextChapter, userProgress, purchase } =
    data;

  const isFreeChapter = Boolean(chapter.isFree);
  const isPaidChapter = !isFreeChapter;
  const isSubscribed = Boolean(purchase);
  const isLockedForPayment = isPaidChapter && !isSubscribed; // Renombrado para claridad
  const isCompleted = Boolean(userProgress?.isCompleted);
  const completeOnEnd = isSubscribed && !isCompleted;

  const chapters = Array.isArray(course?.chapters) ? course.chapters : [];
  const currentIndex = chapters.findIndex((ch: any) => ch.id === chapter.id);
  const chapterIndex = currentIndex >= 0 ? currentIndex + 1 : 1; // 1-based index
  const totalChapters = chapters.length;
  const prevChapterId =
    currentIndex > 0 ? chapters[currentIndex - 1].id : undefined;
  // const nextChapterId = nextChapter?.id; // Ya está desestructurado

  return (
    <>
      <ChapterHeaderBar />
      <Toaster position="top-right" richColors />
      <div
        className={`min-h-screen pb-16 ${
          isCompleted
            ? "bg-sky-50/50 dark:bg-sky-900/10"
            : "bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
        }`}
      >
        {isCompleted &&
          !isLockedForPayment && ( // No mostrar si está bloqueado por pago, incluso si se completó antes
            <Banner
              variant="success"
              label="✅ Ya completaste este capítulo."
            />
          )}
        {isLockedForPayment && (
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
            isCompleted={isCompleted && isSubscribed} // Considerar completado solo si está suscrito
            prevChapterId={prevChapterId}
            nextChapterId={nextChapter?.id}
          />

          <div
            className={
              isLockedForPayment ? "filter blur-sm pointer-events-none" : ""
            }
          >
            <ChapterVideoSection
              videoUrl={chapter.video?.url ?? ""}
              courseImageUrl={course.imageUrl}
              altText={chapter.title}
              isLocked={isLockedForPayment}
              playbackId={muxData?.playbackId}
              chapterId={chapter.id}
              courseId={course.id}
              nextChapterId={nextChapter?.id}
              completeOnEnd={completeOnEnd}
            />
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 px-2">
            <div className="flex items-center gap-4">
              {chapter.estimatedTime && (
                <div className="flex items-center gap-1 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md shadow-sm">
                  <span>{chapter.estimatedTime} min</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {isSubscribed && !hasExam && !isLockedForPayment && (
                <CustomProgressButton
                  chapterId={chapter.id}
                  courseId={course.id}
                  nextChapterId={nextChapter?.id}
                  isCompleted={isCompleted}
                />
              )}
            </div>
          </div>

          {!isLockedForPayment && hasExam && (
            <div className="mt-12 max-h-[70vh] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
              <ExamViewer
                isCompleted={isCompleted}
                nextChapterId={nextChapter?.id}
              />
            </div>
          )}

          <div
            className={
              isLockedForPayment ? "filter blur-sm pointer-events-none" : ""
            }
          >
            <Card className="p-6 mx-auto shadow-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <EditorTextPreview htmlContent={chapter.description} />
            </Card>
          </div>

          {isLockedForPayment && course.price != null && (
            <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-800 rounded-lg text-center shadow">
              <p className="font-semibold mb-3 text-slate-700 dark:text-slate-200">
                Este capítulo requiere inscripción.
              </p>
              <CourseEnrollButton price={course.price} />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChapterIdPage;
