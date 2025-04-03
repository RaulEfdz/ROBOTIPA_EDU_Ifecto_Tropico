"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, X, Check, Loader2, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Chapter, Course } from "@prisma/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChaptersList } from "../chapters-list";
import { fetchData } from "../../../custom/fetchData";

// 🔵 Constantes de endpoints
const ENDPOINTS = {
  api: {
    createChapter: (courseId: string) =>
      `/api/courses/${courseId}/chapters/create`,
    reorderChapters: (courseId: string) =>
      `/api/courses/${courseId}/chapters/reorder`,
    updateChapter: (courseId: string, chapterId: string) =>
      `/api/courses/${courseId}/chapters/update/${chapterId}/edit`,
    deleteChapter: (courseId: string, chapterId: string) =>
      `/api/courses/${courseId}/chapters/update/${chapterId}/delete`,
  },
  ui: {
    editChapterPage: (courseId: string, chapterId: string) =>
      `/teacher/courses/${courseId}/chapters/${chapterId}`,
  },
};

const texts = {
  es: {
    title: "5 - Capítulos del curso",
    addButton: "Agregar",
    cancelButton: "Cancelar",
    saveButton: "Guardar",
    reorderInfo: "Arrastra y suelta para reordenar los capítulos",
    noChapters: "Sin capítulos",
    successCreate: "Capítulo creado",
    successReorder: "Capítulos reordenados",
    error: "Ocurrió un error",
    validationMessage: "Se requiere un título",
  },
  en: {
    title: "5 - Course chapters",
    addButton: "Add",
    cancelButton: "Cancel",
    saveButton: "Save",
    reorderInfo: "Drag and drop to reorder the chapters",
    noChapters: "No chapters",
    successCreate: "Chapter created",
    successReorder: "Chapters reordered",
    error: "Something went wrong",
    validationMessage: "Title is required",
  },
};

interface ChaptersFormProps {
  initialData: Course & { chapters: Chapter[] };
  courseId: string;
  lang?: "es" | "en";
}

const formSchema = z.object({
  title: z.string().min(1, { message: texts.es.validationMessage }),
});

export const ChaptersForm = ({
  initialData,
  courseId,
  lang = "es",
}: ChaptersFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [chapters, setChapters] = useState(initialData.chapters);

  const router = useRouter();
  const t = texts[lang];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  const { isSubmitting, isValid, isDirty } = form.formState;

  const toggleCreating = () => {
    if (isCreating) form.reset();
    setIsCreating((current) => !current);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);
    const path = ENDPOINTS.api.createChapter(courseId);

    try {
      const newChapter = await fetchData<Chapter>({
        values,
        path,
        method: "POST",
      });

      if (!newChapter || !newChapter.id) {
        throw new Error("Capítulo inválido");
      }

      toast.success(t.successCreate, {
        duration: 2000,
        position: "bottom-right",
      });

      toggleCreating();
      setChapters((prev) => [...prev, newChapter]);
    } catch (error) {
      toast.error(t.error);
    } finally {
      setIsSaving(false);
    }
  };

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    setIsUpdating(true);

    const path = ENDPOINTS.api.reorderChapters(courseId);
    const values = { list: updateData, courseId };

    try {
      await fetchData({
        values,
        path,
        method: "PUT",
        callback: () => {
          toast.success(t.successReorder, {
            duration: 2000,
            position: "bottom-right",
          });
          router.refresh();
        },
        finallyFunction: () => {
          setIsUpdating(false);
        },
      });
    } catch {
      toast.error(t.error);
    }
  };

  const onEdit = (id: string) => {
    router.push(ENDPOINTS.ui.editChapterPage(courseId, id));
  };

  return (
    <div className="mb-6 relative bg-white dark:bg-gray-850 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      {isUpdating && (
        <div className="absolute inset-0 bg-white/60 dark:bg-black/50 flex items-center justify-center z-10 rounded-xl">
          <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {t.title}
        </h3>

        {!isCreating && (
          <Button
            onClick={toggleCreating}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg h-8"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            {t.addButton}
          </Button>
        )}
      </div>

      {isCreating ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g., 'Introduction to the course'"
                      className="text-sm border-gray-200 dark:border-gray-700"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                onClick={toggleCreating}
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-lg border-gray-200 dark:border-gray-700"
              >
                <X className="h-4 w-4 text-gray-500" />
              </Button>

              <Button
                disabled={!isValid || isSubmitting || !isDirty}
                type="submit"
                size="icon"
                className="h-10 w-10 rounded-lg bg-blue-600 hover:bg-blue-700"
              >
                {isSaving ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="h-4 w-4 text-white" />
                )}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <>
          {chapters.length ? (
            <ChaptersList
              onEdit={onEdit}
              onReorder={onReorder}
              items={chapters}
            />
          ) : (
            <div className="text-sm text-gray-500 italic">{t.noChapters}</div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
            {t.reorderInfo}
          </p>
        </>
      )}

      {!isCreating && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-500">
            <div className="flex items-center mr-4">
              <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
              <span>{chapters.length} capítulos</span>
            </div>
            <div className="flex items-center">
              <ArrowRight className="h-3 w-3 mr-2" />
              <span>ID: {courseId.substring(0, 8)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
