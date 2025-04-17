"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  CheckCircle,
  Lock,
  AlertCircle,
  Award,
  Play,
  ArrowLeft
} from "lucide-react";

import { Banner } from "@/components/banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

import { CourseEnrollButton } from "./_components/course-enroll-button";
import { CourseProgressButton } from "./_components/course-progress-button";
import { VideoPlayer } from "./_components/video-player";
import { validateURLVideo } from "./_components/customs/validateURLVideo";
import { getChapterU } from "./handler/getChapter";
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { formatPrice } from "@/lib/format";
import EditorTextPreview from "@/components/preview";

// Esquema de colores mejorado
const courseColors = {
  free: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100",
    label: "bg-emerald-50 text-emerald-700",
  },
  premium: {
    badge: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
    label: "bg-amber-50 text-amber-700",
  },
  completed: {
    badge: "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100",
    background: "bg-sky-50/50",
    icon: "text-sky-600",
    button: "bg-emerald-600 hover:bg-emerald-700",
  },
  progress: {
    button: "bg-blue-600 hover:bg-blue-700",
  },
  error: {
    bg: "bg-red-50",
    border: "border border-red-200",
    text: "text-red-700",
    button: "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200",
  },
  lockedOverlay: "bg-slate-900/75 backdrop-blur-sm",
  navigation: {
    back: "text-slate-600 hover:text-sky-700 transition-colors",
    next: "bg-sky-600 hover:bg-sky-700 text-white transition-colors",
  },
};

// Componente personalizado para el botón de progreso
const CustomProgressButton: React.FC<{
  chapterId: string;
  courseId: string;
  nextChapterId?: string;
  isCompleted: boolean;
}> = ({ 
  chapterId, 
  courseId, 
  nextChapterId, 
  isCompleted 
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      
      // Aquí iría la lógica para marcar como completado
      // Este es solo un ejemplo, deberías adaptar esto a tu implementación real
      
      if (isCompleted) {
        // Si ya está completado, no necesitamos hacer nada más que navegar
        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
        } else {
          router.push(`/courses/${courseId}`);
        }
      } else {
        // Aquí iría la llamada a la API para marcar como completado
        // await axios.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
        //   isCompleted: true
        // });

        if (nextChapterId) {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
        } else {
          router.push(`/courses/${courseId}`);
        }
      }
    } catch (error) {
      toast.error("Ocurrió un error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      size="sm"
      className={`shadow-sm hover:shadow ${
        isCompleted 
          ? courseColors.completed.button 
          : courseColors.progress.button
      }`}
    >
      {isLoading ? "Cargando..." : isCompleted ? "Continuar" : "Marcar como completado"}
    </Button>
  );
};

const ChapterIdPage = () => {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const user = await getCurrentUserFromDB();

        if (!user?.id) {
          toast.error("No hay sesión activa.");
          return;
        }

        if (!params?.courseId || !params?.chapterId) {
          toast.error("Curso o capítulo no especificado.");
          return;
        }

        const config = {
          userId: user.id,
          chapterId: String(params.chapterId),
          courseId: String(params.courseId),
        };

        const chapterData = await getChapterU(config);
        setData(chapterData);
      } catch (error) {
        console.error("Error al cargar los datos:", error);
        toast.error("Error inesperado al obtener los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-[450px] w-full rounded-xl mb-6" />
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-4 w-full mt-8 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
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
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Volver atrás
          </Button>
        </div>
      </div>
    );
  }

  const { chapter, course, muxData, nextChapter, userProgress, purchase } = data;
  const isLocked = !chapter.isFree && !purchase;
  const completeOnEnd = !!purchase && !userProgress?.isCompleted;
  const isCompleted = !!userProgress?.isCompleted;

  // Encuentra el índice del capítulo actual
  const chapterIndex = course.chapters?.findIndex(
    (ch: any) => ch.id === chapter.id
  );
  
  // Convierte a número y valida para evitar NaN
  const displayIndex = typeof chapterIndex === 'number' && !isNaN(chapterIndex) ? chapterIndex + 1 : '?';
  
  const prevChapter =
    chapterIndex > 0 ? course.chapters[chapterIndex - 1] : null;

  return (
    <div className={`min-h-screen pb-16 ${isCompleted ? courseColors.completed.background : "bg-gradient-to-b from-slate-50 to-white"}`}>
      {isCompleted && (
        <Banner 
          variant="success" 
          label="✅ Ya has completado este capítulo." 
        />
      )}
      {isLocked && (
        <Banner
          variant="warning"
          label="🔒 Debes inscribirte en este curso para ver este capítulo."
        />
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Navegación y título */}
        <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center text-sm text-slate-500 mb-2">
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto hover:bg-transparent text-slate-600 hover:text-sky-700 transition-colors flex items-center gap-1"
                onClick={() => router.push(`/courses/${params.courseId}`)}
              >
                <ArrowLeft className="h-4 w-4" /> {course.title}
              </Button>
              <ChevronRight className="h-4 w-4 mx-2" />
              <span className="font-medium text-slate-700">
                Capítulo {displayIndex}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {chapter.title}
            </h1>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className={chapter.isFree ? courseColors.free.badge : courseColors.premium.badge}
              >
                {chapter.isFree ? (
                  <>🆓 Gratuito</>
                ) : (
                  <>💎 Premium</>
                )}
              </Badge>
              {isCompleted && (
                <Badge
                  variant="outline"
                  className={courseColors.completed.badge}
                >
                  <CheckCircle className="h-3 w-3 mr-1" /> Completado
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4 md:mt-0">
            {prevChapter && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  router.push(
                    `/courses/${params.courseId}/chapters/${prevChapter.id}`
                  )
                }
                className="text-sm flex items-center gap-1 shadow-sm hover:shadow"
              >
                <ChevronLeft className="h-4 w-4" /> Anterior
              </Button>
            )}
            {nextChapter && (
              <Button
                size="sm"
                onClick={() =>
                  router.push(
                    `/courses/${params.courseId}/chapters/${nextChapter.id}`
                  )
                }
                className={`text-sm flex items-center gap-1 shadow-sm hover:shadow ${courseColors.navigation.next}`}
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Reproductor de video */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-slate-200">
          {validateURLVideo(chapter.video?.url) ? (
            <VideoPlayer
              chapterId={String(params.chapterId)}
              title={chapter.title}
              courseId={String(params.courseId)}
              nextChapterId={nextChapter?.id}
              playbackId={muxData?.playbackId || ""}
              isLocked={isLocked}
              completeOnEnd={completeOnEnd}
              videoUrl={String(chapter.video?.url)}
            />
          ) : (
            <div className="w-full aspect-video relative bg-slate-100">
              {isLocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/75 backdrop-blur-sm">
                  <Lock className="h-14 w-14 mb-3 text-white opacity-80" />
                  <h3 className="text-xl font-medium mb-2 text-white">
                    Contenido bloqueado
                  </h3>
                  <p className="text-slate-200 max-w-xs text-center mb-4">
                    Inscríbete en este curso para acceder a todo el contenido
                  </p>
                </div>
              )}
              <Image
                src={course.imageUrl || "/placeholder.jpg"}
                alt={chapter.title}
                fill
                className={`object-cover ${
                  isLocked ? "opacity-40 blur-sm" : ""
                }`}
              />
              {!isLocked && !validateURLVideo(chapter.video?.url) && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-full shadow-lg">
                    <Play className="h-16 w-16 text-sky-600" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Información y botones */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 px-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md shadow-sm">
              <BookOpen className="h-4 w-4 text-sky-600" />
              <span>
                Capítulo {displayIndex} de {course.chapters?.length || '?'}
              </span>
            </div>
            {chapter.estimatedTime && (
              <div className="flex items-center gap-1 text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md shadow-sm">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>{chapter.estimatedTime} min</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm font-medium">
              {course.price && course.price > 0 ? (
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium bg-amber-50 text-amber-700 shadow-sm">
                  <Award className="h-4 w-4 mr-1" /> {formatPrice(course.price)}
                </div>
              ) : (
                <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium bg-emerald-50 text-emerald-700 shadow-sm">
                  <CheckCircle className="h-4 w-4 mr-1" /> Curso gratuito
                </div>
              )}
            </div>

            {purchase ? (
              <CustomProgressButton
                chapterId={String(params.chapterId)}
                courseId={String(params.courseId)}
                nextChapterId={nextChapter?.id}
                isCompleted={isCompleted}
              />
            ) : (
              <CourseEnrollButton
                courseId={String(params.courseId)}
                price={course.price || 0}
              />
            )}
          </div>
        </div>

        {/* Descripción */}
        <Card className={`p-6 mx-auto shadow-md ${isCompleted ? "border-sky-200 bg-white" : "border-slate-200"}`}>
          <div className="max-w-none">
            <EditorTextPreview htmlContent={chapter.description} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChapterIdPage;