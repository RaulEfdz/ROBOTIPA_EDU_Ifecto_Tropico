  "use client";

  import React, { useEffect, useState } from "react";
  import { useParams } from "next/navigation";

  import { Banner } from "@/components/banner";
  import { Separator } from "@/components/ui/separator";
  import { VideoPlayer } from "./_components/video-player";
  import { CourseEnrollButton } from "./_components/course-enroll-button";
  import { CourseProgressButton } from "./_components/course-progress-button";
  import { validateURLVideo } from "./_components/customs/validateURLVideo";
  import { Skeleton } from "@/components/ui/skeleton";
  import toast from "react-hot-toast";
  import { getChapterU } from "./handler/getChapter";
  import Preview from "@/components/preview";
  import Image from "next/image";
  import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";

  const ChapterIdPage = () => {
    const params = useParams();

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
        <div className="p-6">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
        </div>
      );
    }

    if (!data) {
      return (
        <div className="p-6 text-center">
          <p className="text-red-500">No se pudo cargar el capítulo. Intenta nuevamente.</p>
        </div>
      );
    }

    const { chapter, course, muxData, nextChapter, userProgress, purchase } = data;
    const isLocked = !chapter.isFree && !purchase;
    const completeOnEnd = !!purchase && !userProgress?.isCompleted;

    return (
      <div className="bg-lectureWhite">
        {userProgress?.isCompleted && (
          <Banner variant="success" label="Ya has completado este capítulo." />
        )}
        {isLocked && (
          <Banner
            variant="warning"
            label="Debes inscribirte en este curso para ver este capítulo."
          />
        )}

        <div className="flex flex-col pb-20">
          {validateURLVideo(chapter.videoUrl) ? (
            <div className="p-4">
              <VideoPlayer
                chapterId={String(params.chapterId)}
                title={chapter.title}
                courseId={String(params.courseId)}
                nextChapterId={nextChapter?.id}
                playbackId={muxData?.playbackId || ""}
                isLocked={isLocked}
                completeOnEnd={completeOnEnd}
                videoUrl={String(chapter.videoUrl)}
              />
            </div>
          ) : (
            <Image src={course.imageUrl} alt={chapter.title} width={1000} height={1000} />
          )}
          <div>
            <div className="p-4 flex flex-col md:flex-row items-center justify-between">
              {purchase ? (
                <CourseProgressButton
                  chapterId={String(params.chapterId)}
                  courseId={String(params.courseId)}
                  nextChapterId={nextChapter?.id}
                  isCompleted={!!userProgress?.isCompleted}
                />
              ) : (
                <CourseEnrollButton
                  courseId={String(params.courseId)}
                  price={course.price || 0}
                />
              )}
            </div>
            <Separator />
            <Preview value={chapter.description} />
          </div>
        </div>
      </div>
    );
  };

  export default ChapterIdPage;
