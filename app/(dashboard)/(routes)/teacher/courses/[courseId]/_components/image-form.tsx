"use client";

import * as z from "zod";
import { Pencil, PlusCircle, ImageIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { fetchData } from "../../custom/fetchData";

// Textos en español e inglés
const texts = {
  es: {
    title: "Imagen de curso",
    addButton: "Agregar imagen",
    editButton: "Editar imagen",
    cancelButton: "Cancelar",
    successMessage: "Curso actualizado",
    errorMessage: "Ocurrió un error",
    placeholder: "Se recomienda una relación de aspecto de 16:9",
    validationMessage: "Se requiere una imagen",
  },
  en: {
    title: "Course Image",
    addButton: "Add Image",
    editButton: "Edit Image",
    cancelButton: "Cancel",
    successMessage: "Course updated",
    errorMessage: "An error occurred",
    placeholder: "A 16:9 aspect ratio is recommended",
    validationMessage: "Image is required",
  },
};

interface ImageFormProps {
  initialData: Course;
  courseId: string;
  lang?: "es" | "en"; // idioma opcional, español por defecto
}

const formSchema = z.object({
  imageUrl: z.string().min(1, { message: texts.es.validationMessage }),
});

export const ImageForm = ({ initialData, courseId, lang = "es" }: ImageFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const path = `/api/courses/${courseId}`;
    const method = "PUT";

    fetchData({
      values,
      courseId,
      path,
      method,
      callback: () => {
        toast.success(texts[lang].successMessage);
        toggleEdit();
        router.refresh();
      },
    });
  };

  return (
    <div className="mt-6 border bg-slate-100 dark:bg-gray-800 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        {texts[lang].title}
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            texts[lang].cancelButton
          ) : (
            <>
              {initialData.imageUrl ? (
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
            </>
          )}
        </Button>
      </div>

      {!isEditing ? (
        !initialData.imageUrl ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <ImageIcon className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
            <Image
              alt="Upload"
              fill
              className="object-cover rounded-md"
              src={initialData.imageUrl}
            />
          </div>
        )
      ) : (
        <div>
          <FileUpload
            endpoint="courseImage"
            onChange={(url) => {
              if (url) {
                onSubmit({ imageUrl: url });
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            {texts[lang].placeholder}
          </div>
        </div>
      )}
    </div>
  );
};
