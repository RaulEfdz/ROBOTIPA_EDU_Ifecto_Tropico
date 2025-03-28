"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Chapter, Course } from "@prisma/client";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { ChaptersList } from "./chapters-list";
import { fetchData } from "../../custom/fetchData";

// Textos en español e inglés
const texts = {
  es: {
    title: "Capítulos del curso",
    addButton: "Agregar capítulo",
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
    title: "Course Chapters",
    addButton: "Add Chapter",
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
  lang?: "es" | "en"; // idioma opcional, español por defecto
}

const formSchema = z.object({
  title: z.string().min(1, { message: texts.es.validationMessage }),
});

export const ChaptersForm = ({ initialData, courseId, lang = "es" }: ChaptersFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const toggleCreating = () => setIsCreating((current) => !current);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const path = `/api/courses/${courseId}/chapters`;

    fetchData({
      values,
      path,
      callback: () => {
        toast.success(texts[lang].successCreate);
        toggleCreating();
        router.refresh();
      },
      method: "POST",
    });
  };

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    setIsUpdating(true);

    const path = `/api/courses/${courseId}/chapters/reorder`;
    const values = { list: updateData, courseId };

    fetchData({
      values,
      path,
      callback: () => {
        toast.success(texts[lang].successReorder);
        router.refresh();
      },
      method: "PUT",
      finallyFunction: () => setIsUpdating(false),
    });
  };

  const onEdit = (id: string) => {
    router.push(`/teacher/courses/${courseId}/chapters/${id}`);
  };

  return (
    <div className="relative mt-6 border bg-slate-100 dark:bg-gray-800 rounded-md p-4">
      {isUpdating && (
        <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-m flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}
      <div className="font-medium flex items-center justify-between">
        {texts[lang].title}
        <Button onClick={toggleCreating} variant="ghost">
          {isCreating ? texts[lang].cancelButton : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              {texts[lang].addButton}
            </>
          )}
        </Button>
      </div>

      {isCreating && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.g., 'Introduction to the course'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button disabled={!isValid || isSubmitting} type="submit" className="bg-green-600 text-white">
              {texts[lang].saveButton}
            </Button>
          </form>
        </Form>
      )}

      {!isCreating && (
        <div className={cn("text-sm mt-2", !initialData.chapters.length && "text-slate-500 italic")}>
          {initialData.chapters.length ? (
            <ChaptersList onEdit={onEdit} onReorder={onReorder} items={initialData.chapters} />
          ) : (
            texts[lang].noChapters
          )}
        </div>
      )}

      {!isCreating && (
        <p className="text-xs text-muted-foreground mt-4">
          {texts[lang].reorderInfo}
        </p>
      )}
    </div>
  );
};
