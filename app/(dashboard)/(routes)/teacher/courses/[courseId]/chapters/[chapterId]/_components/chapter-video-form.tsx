"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Pencil, PlusCircle, Video, Check, X } from "lucide-react";
import { Chapter, MuxData } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { fetchData } from "../../../../custom/fetchData";

// Textos en español e inglés
const texts = {
  es: {
    title: "Video del capítulo",
    addButton: "Agregar video",
    editButton: "Editar video",
    cancelButton: "Cancelar",
    saveButton: "Guardar",
    noVideo: "Sin video disponible",
    placeholder: "Ingresa la URL del video de YouTube",
    successMessage: "Capítulo actualizado con éxito",
    errorMessage: "Ha ocurrido un error al actualizar el capítulo",
    processingMessage: "El video puede tardar unos minutos en procesarse. Si no aparece, revisa la URL ingresada.",
  },
  en: {
    title: "Chapter Video",
    addButton: "Add Video",
    editButton: "Edit Video",
    cancelButton: "Cancel",
    saveButton: "Save",
    noVideo: "No video available",
    placeholder: "Enter YouTube video URL",
    successMessage: "Chapter updated successfully",
    errorMessage: "An error occurred while updating the chapter",
    processingMessage: "The video may take a few minutes to process. Check the input if it doesn’t appear.",
  },
};

interface ChapterVideoFormProps {
  initialData: Chapter & { muxData?: MuxData | null };
  courseId: string;
  chapterId: string;
  lang?: "es" | "en";
}

// const formSchema = z.object({
//   videoUrl: z.string().url(),
// });

export const ChapterVideoForm = ({
  initialData,
  courseId,
  chapterId,
  lang = "es",
}: ChapterVideoFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [videoUrl, setVideoUrl] = useState(initialData.videoUrl || "");
  const router = useRouter();

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const onSubmit = async () => {
    const path = `/api/courses/${courseId}/chapters/${chapterId}`;
    const values = { videoUrl };

    const callback = () => {
      toast.success(texts[lang].successMessage);
      setIsEditing(false);
      router.refresh();
    };

    try {
      await fetchData({ values, courseId, path, callback });
    } catch (error) {
      toast.error(texts[lang].errorMessage);
    }
  };

  const videoId = getYouTubeVideoId(videoUrl);
  const toggleEdit = () => setIsEditing(!isEditing);

  return (
    <div className="mt-6 border bg-slate-100 dark:bg-gray-800">
      <div className="font-medium flex items-center justify-between bg-gray-900 pl-3">
        {videoUrl ? (
          <Check className="h-5 w-5 text-green-500 mr-2" />
        ) : (
          <X className="h-5 w-5 text-red-500 mr-2" />
        )}

        <label className="text-gray-100 font-bold mr-3">{texts[lang].title}</label>
        <Button onClick={toggleEdit} variant="ghost" className="text-gray-100">
          {isEditing ? texts[lang].cancelButton : initialData.videoUrl ? (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              {texts[lang].editButton}
            </>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              {texts[lang].addButton}
            </>
          )}
        </Button>
      </div>

      <div className="relative mt-2 p-1 h-[50vh]">
        {videoId ? (
          <iframe
            width={'100%'}
            height={'100%'}
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video preview"
            className="rounded-md"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          <div className="flex items-center justify-center bg-slate-200 rounded-md">
            <Video className="h-10 w-10 text-slate-500" />
          </div>
        )}
      </div>

      {isEditing && (
        <div className="p-4">
          <Input
            className="rounded-none bg-gray-900 border-sm"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={texts[lang].placeholder}
          />
          <Button onClick={onSubmit} variant="default" className="mt-4">
            {texts[lang].saveButton}
          </Button>
        </div>
      )}

      {initialData.videoUrl && !isEditing && (
        <div className="text-xs text-muted-foreground mx-2 mb-3">
          {texts[lang].processingMessage}
        </div>
      )}
    </div>
  );
};
