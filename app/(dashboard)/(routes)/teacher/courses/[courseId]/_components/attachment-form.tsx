"use client";

import * as z from "zod";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Attachment, Course } from "@prisma/client";
import { Pencil, PlusCircle, File, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { fetchData } from "../../custom/fetchData";
import { formmatedFile } from "@/tools/formmatedFile";

// Textos en español e inglés
const texts = {
  es: {
    title: "Anexos del curso",
    addButton: "Agregar archivo",
    cancelButton: "Cancelar",
    noAttachments: "Aún no hay archivos adjuntos",
    deleteSuccess: "Anexo eliminado",
    deleteError: "Ocurrió un error",
    uploadInstructions: "Agregue todo lo que sus estudiantes puedan necesitar para completar el curso.",
    successMessage: "Curso actualizado",
  },
  en: {
    title: "Course Attachments",
    addButton: "Add file",
    cancelButton: "Cancel",
    noAttachments: "No attachments yet",
    deleteSuccess: "Attachment deleted",
    deleteError: "An error occurred",
    uploadInstructions: "Add everything students may need to complete the course.",
    successMessage: "Course updated",
  },
};

interface AttachmentFormProps {
  initialData: Course & { attachments: Attachment[] };
  courseId: string;
  lang?: "es" | "en"; // idioma opcional, español por defecto
}

const formSchema = z.object({
  url: z.string().min(1),
  res: z.record(z.any()), // Permite cualquier clave-valor en `res`
});


export const AttachmentForm = ({ initialData, courseId, lang = "es" }: AttachmentFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const path = `/api/courses/${courseId}/attachments`;
    const method = "POST";

    fetchData({
      values,
      courseId,
      path,
      callback: () => {
        toast.success(texts[lang].successMessage);
        toggleEdit();
        router.refresh();
      },
      method,
    });
  };

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id);
      await fetchData({ path: `/api/courses/${courseId}/attachments/${id}`, method: "DELETE" });
      toast.success(texts[lang].deleteSuccess);
      router.refresh();
    } catch {
      toast.error(texts[lang].deleteError);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 dark:bg-gray-800 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        {texts[lang].title}
        <Button onClick={toggleEdit} className="mb-3">
          {isEditing ? texts[lang].cancelButton : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              {texts[lang].addButton}
            </>
          )}
        </Button>
      </div>

      {!isEditing ? (
        <>
          {initialData.attachments.length === 0 ? (
            <p className="text-sm mt-2 text-slate-500 italic">
              {texts[lang].noAttachments}
            </p>
          ) : (
            <div className="space-y-2">
              {initialData.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center p-3 w-full bg-sky-100 border-sky-200 border text-sky-700 rounded-md"
                >
                  <File className="h-4 w-4 mr-2 flex-shrink-0" />
                  <p className="text-xs line-clamp-1">
                    {formmatedFile(attachment.name)}
                  </p>
                  {deletingId === attachment.id ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-auto" />
                  ) : (
                    <button
                      onClick={() => onDelete(attachment.id)}
                      className="ml-auto hover:opacity-75 transition"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div>
          <FileUpload
            endpoint="courseAttachment"
            onChange={(res) => {
              if (res) {
                onSubmit({ url: res?.url, res });
              }
            }}
          />
          <div className="text-xs text-muted-foreground mt-4">
            {texts[lang].uploadInstructions}
          </div>
        </div>
      )}
    </div>
  );
};
