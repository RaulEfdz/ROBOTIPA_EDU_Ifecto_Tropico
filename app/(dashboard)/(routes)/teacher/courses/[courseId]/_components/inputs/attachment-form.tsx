"use client";

import * as z from "zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Attachment, Course } from "@prisma/client";
import { PlusCircle, File, Loader2, X, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/file-upload";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { formmatedFile } from "@/tools/formmatedFile";
import { fetchData } from "../../../custom/fetchData";
import Image from "next/image";

const ENDPOINTS = {
  api: {
    uploadAttachment: (courseId: string) =>
      `/api/courses/${courseId}/attachments/create`,
    deleteAttachment: (courseId: string, attachmentId: string) =>
      `/api/courses/${courseId}/attachments/trash/${attachmentId}`,
  },
};

const texts = {
  es: {
    title: "6 - Archivos adjuntos",
    addButton: "Agregar",
    cancelButton: "Cancelar",
    noAttachments: "Aún no hay archivos adjuntos",
    deleteSuccess: "Archivo eliminado",
    deleteError: "Ocurrió un error",
    uploadInstructions: "Agrega documentos, plantillas o recursos para el curso.",
    successMessage: "Archivo subido",
    preview: "Vista previa",
  },
  en: {
    title: "6 - Attachments",
    addButton: "Add",
    cancelButton: "Cancel",
    noAttachments: "No attachments yet",
    deleteSuccess: "Attachment deleted",
    deleteError: "An error occurred",
    uploadInstructions: "Add documents, templates or resources for the course.",
    successMessage: "File uploaded",
    preview: "Preview",
  },
};

interface AttachmentFormProps {
  initialData: Course & { attachments: Attachment[] };
  courseId: string;
  lang?: "es" | "en";
}

const formSchema = z.object({
  url: z.string().min(1),
  res: z.record(z.any()),
});

export const AttachmentForm = ({
  initialData,
  courseId,
  lang = "es",
}: AttachmentFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();
  const t = texts[lang];

  const toggleEdit = () => setIsEditing((prev) => !prev);

  const isPreviewable = (url: string) => {
    const previewExtensions = ["pdf", "png", "jpg", "jpeg", "gif", "webp"];
    return previewExtensions.some((ext) => url.toLowerCase().endsWith(ext));
  };

  const handlePreview = (url: string) => {
    if (isPreviewable(url)) {
      setPreviewUrl(url);
    } else {
      window.open(url, "_blank");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const path = ENDPOINTS.api.uploadAttachment(courseId);
    try {
      await fetchData({
        values,
        courseId,
        path,
        method: "POST",
        callback: () => {
          toast.success(t.successMessage);
          toggleEdit();
          router.refresh();
        },
      });
    } catch {
      toast.error(t.deleteError);
    }
  };

  const onDelete = async (id: string) => {
    const path = ENDPOINTS.api.deleteAttachment(courseId, id);
    try {
      setDeletingId(id);
      await fetchData({ path, method: "DELETE" });
      toast.success(t.deleteSuccess);
      router.refresh();
    } catch {
      toast.error(t.deleteError);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="mb-6 bg-TextCustom dark:bg-gray-850 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t.title}
          </h3>

          <Button
            onClick={toggleEdit}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg h-8"
          >
            {isEditing ? <X className="h-4 w-4" /> : (
              <>
                <PlusCircle className="h-4 w-4 mr-1" />
                {t.addButton}
              </>
            )}
          </Button>
        </div>

        {!isEditing ? (
          <>
            {initialData.attachments.length === 0 ? (
              <p className="text-sm text-gray-500 italic">{t.noAttachments}</p>
            ) : (
              <div className="space-y-2">
                {initialData.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center p-3 w-full bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-md"
                  >
                    <File className="h-4 w-4 mr-2 flex-shrink-0" />
                    <p className="text-xs truncate flex-1">{formmatedFile(attachment.name)}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePreview(attachment.url)}
                      className="text-blue-500"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {deletingId === attachment.id ? (
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    ) : (
                      <button
                        onClick={() => onDelete(attachment.id)}
                        className="ml-2 hover:opacity-75 transition"
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
                  onSubmit({ url: res.url, res });
                }
              }}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
              {t.uploadInstructions}
            </div>
          </div>
        )}
      </div>

      {/* Dialog para previsualizar archivos */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-3xl">
          {previewUrl?.endsWith("pdf") ? (
            <iframe
              src={previewUrl}
              className="w-full h-[70vh] rounded-md"
              title="Vista previa del archivo"
            />
          ) : (
            <Image
            height={1000}
            width={1000}
              src={previewUrl!}
              alt="Vista previa"
              className="w-full max-h-[70vh] object-contain rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
