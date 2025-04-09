"use client";

import React, { useState } from "react";
import { Check, X, Pencil, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Chapter } from "@prisma/client";

import { Button } from "@/components/ui/button";
import EditorText from "@/components/EditorText/EditorText";
import NavBarSliderBar from "./NavBarSliderBar/NavBarSliderBar";
import { fetchData } from "../../../../../custom/fetchData";

const texts = {
  es: {
    title: "2 - Descripción del capítulo",
    editButton: "Editar",
    cancelButton: "Cancelar",
    saveButton: "Guardar",
    placeholder: "Sin descripción",
    successMessage: "Descripción actualizada",
    hintMessage: "Agrega una descripción clara y breve del contenido del capítulo",
  },
  en: {
    title: "2 - Chapter Description",
    editButton: "Edit",
    cancelButton: "Cancel",
    saveButton: "Save",
    placeholder: "No description",
    successMessage: "Description updated",
    hintMessage: "Add a clear and short description of this chapter",
  },
};

interface HandlerChecksItem {
  id: string;
  name: string;
  url: string;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
  checked?: boolean;
}

interface EnhancedChapterDescriptionProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
  items: HandlerChecksItem[];
  lang?: "es" | "en";
}

export const EnhancedChapterDescription: React.FC<EnhancedChapterDescriptionProps> = ({
  initialData,
  courseId,
  chapterId,
  items,
  lang = "es",
}) => {
  const t = texts[lang];
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [description, setDescription] = useState<string>(initialData.description || "");

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
    setDescription(initialData.description || "");
  };

  const handleSave = async () => {
    setIsSaving(true);

    const path = `/api/courses/${courseId}/chapters/${chapterId}/edit`;

    try {
      await fetchData({
        method: "POST",
        path,
        courseId,
        values: { description },
        callback: (res: any) => {
          if (res?.data?.description) {
            setDescription(res.data.description);
          }
          toast.success(t.successMessage);
          toggleEdit();
          router.refresh();
        },
      });
    } catch (err) {
      toast.error("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const insertReference = (ref: string) => {
    navigator.clipboard.writeText(ref);
    toast.success(`Referencia copiada: ${ref}`);
  };

  return (
    <div className="mb-6 bg-white dark:bg-gray-850 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {t.title}
        </h3>
        {!isEditing && (
          <Button
            onClick={toggleEdit}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg h-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>

      {!isEditing ? (
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed prose dark:prose-invert max-w-none">
          {description ? (
            <div dangerouslySetInnerHTML={{ __html: description }} />
          ) : (
            <em className="text-gray-400">{t.placeholder}</em>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <NavBarSliderBar items={items} insertReference={insertReference} lang={lang} />

          <EditorText initialText={description} onChange={setDescription} />

          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleEdit}
              type="button"
              variant="outline"
              size="icon"
              className="h-10 w-10 rounded-lg border-gray-200 dark:border-gray-700"
            >
              <X className="h-4 w-4 text-gray-500" />
            </Button>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="icon"
              className="h-10 w-10 bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="h-4 w-4 text-white" />
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            • {t.hintMessage}
          </p>
        </div>
      )}

      {!isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>{description ? "Visible" : "No definido"}</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-3 w-3" />
              <span>ID: {chapterId.slice(0, 8)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
