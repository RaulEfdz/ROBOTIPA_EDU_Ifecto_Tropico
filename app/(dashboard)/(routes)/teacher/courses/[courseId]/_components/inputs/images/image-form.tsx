"use client";

import * as z from "zod";
import {
  Pencil,
  PlusCircle,
  ImageIcon,
  X,
  ArrowRight,
  Camera,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { fetchData } from "../../../../custom/fetchData";
import FileUploader from "./FileUploader";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const texts = {
  es: {
    title: "2 - Imagen del curso",
    addButton: "Añadir imagen",
    editButton: "Cambiar",
    cancelButton: "Cancelar",
    successMessage: "Imagen actualizada",
    errorMessage: "Error al subir la imagen",
    placeholder: "Formato recomendado: 16:9 (1280x720 px)",
    validationMessage: "Se requiere una imagen",
    noImage: "Sin imagen",
    imageInfo:
      "La imagen del curso aparecerá en la página principal y listados",
    dragDropText: "Arrastra una imagen o haz clic para seleccionar",
  },
  en: {
    title: "2 - Course image",
    addButton: "Add image",
    editButton: "Change",
    cancelButton: "Cancel",
    successMessage: "Image updated",
    errorMessage: "Error uploading image",
    placeholder: "Recommended format: 16:9 (1280x720 px)",
    validationMessage: "Image is required",
    noImage: "No image",
    imageInfo: "Course image will appear on the main page and listings",
    dragDropText: "Drag an image or click to select",
  },
};

interface ImageFormProps {
  initialData: Course;
  courseId: string;
  lang?: "es" | "en";
}

const formSchema = z.object({
  imageUrl: z.string().min(1),
});

export const ImageForm = ({
  initialData,
  courseId,
  lang = "es",
}: ImageFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialData.imageUrl || "");
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const t = texts[lang];

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsUploading(true);
    const path = `/api/courses/${courseId}/updates/images/`;

    try {
      await fetchData({
        values,
        path,
        method: "POST",
        callback: (res: any) => {
          if (res?.data?.imageUrl) {
            setImageUrl(res.data.imageUrl);
            toast.success(t.successMessage, {
              duration: 2000,
              position: "bottom-right",
            });
            toggleEdit();
            router.refresh();
          } else {
            console.warn("⚠️ No se recibió imageUrl en la respuesta.");
          }
        },
      });
    } catch (error) {
      console.error("🔴 Error al actualizar la imagen:", error);
      toast.error(t.errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mb-6 bg-TextCustom dark:bg-gray-850 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>{t.title}</span>
            <span title={t.imageInfo}>
              <Info className="w-4 h-4 text-primary-500" />
            </span>
          </h3>
          {imageUrl ? (
            <Badge className="bg-primary-100 text-primary-700 text-base px-3 py-1 ml-2 animate-pulse">
              Completado
            </Badge>
          ) : (
            <Badge className="bg-gray-200 text-gray-600 text-base px-3 py-1 ml-2 animate-pulse">
              Pendiente
            </Badge>
          )}
        </div>
        {!isEditing && (
          <Button
            onClick={toggleEdit}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-primary-600"
          >
            {imageUrl ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
        {t.placeholder}
      </p>
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-4">
                <FileUploader
                  value={imageUrl}
                  folder={`courses/${courseId}`}
                  onChange={(url) => {
                    if (url) {
                      onSubmit({ imageUrl: url });
                    }
                  }}
                  onSuccess={() => {}}
                />
                <p className="text-sm text-center text-gray-500 mt-4">
                  {t.placeholder}
                </p>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={toggleEdit}
                  variant="outline"
                  size="sm"
                  className="text-gray-500"
                >
                  <X className="h-4 w-4 mr-1" />
                  {t.cancelButton}
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {!imageUrl ? (
              <div className="flex flex-col items-center justify-center h-48 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed">
                <ImageIcon className="h-12 w-12 text-gray-300 mb-2 z-0" />
                <p className="text-sm text-gray-500">{t.noImage}</p>
                <Button
                  onClick={toggleEdit}
                  variant="outline"
                  size="sm"
                  className="mt-4"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  {t.addButton}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden border shadow-sm">
                  <Image
                    alt="Course image"
                    fill
                    className="object-cover"
                    src={imageUrl}
                  />
                  <div className="absolute bottom-0 right-0 p-2">
                    <Button
                      onClick={toggleEdit}
                      variant="secondary"
                      size="sm"
                      className="bg-TextCustom/80 backdrop-blur-sm"
                    >
                      <Camera className="h-4 w-4 mr-1" />
                      {t.editButton}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{t.imageInfo}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {imageUrl && !isEditing && (
        <div className="mt-4 pt-4 border-t text-sm text-gray-500">
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <div className="w-2 h-2 rounded-full bg-primary-400 mr-2"></div>
              <span>16:9</span>
            </div>
            <div className="flex items-center">
              <ArrowRight className="h-3 w-3 mr-2" />
              <span>ID: {courseId.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
