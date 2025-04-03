"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Check, X } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchData } from "../../../../custom/fetchData";

const texts = {
  es: {
    title: "Título de capítulo",
    editButton: "Editar título",
    cancelButton: "Cancelar",
    successMessage: "Capítulo actualizado",
    errorMessage: "Ocurrió un error en el título del capítulo",
    placeholder: "ej. 'Introducción al curso'",
    preview: "Vista previa",
  },
  en: {
    title: "Chapter Title",
    editButton: "Edit Title",
    cancelButton: "Cancel",
    successMessage: "Chapter updated",
    errorMessage: "An error occurred in the chapter title",
    placeholder: "e.g. 'Introduction to the course'",
    preview: "Preview",
  },
};

interface ChapterTitleFormProps {
  initialData: {
    title: string;
  };
  courseId: string;
  chapterId: string;
  lang?: "es" | "en";
}

const formSchema = z.object({
  title: z.string().min(1),
});

export const ChapterTitleForm = ({
  initialData,
  courseId,
  chapterId,
  lang = "es",
}: ChapterTitleFormProps) => {
  const t = texts[lang];
  const [isEditing, setIsEditing] = useState(false);
  const [previewTitle, setPreviewTitle] = useState(initialData.title);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const { isSubmitting, isValid } = form.formState;

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
    form.reset(initialData);
    setPreviewTitle(initialData.title);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const path = `/api/courses/${courseId}/chapters/${chapterId}`;

    await fetchData({
      values,
      path,
      method: "POST",
      callback: () => {
        toast.success(t.successMessage, {
          duration: 2000,
          position: "bottom-right",
        });
        toggleEdit();
        router.refresh();
      },
    });
  };

  return (
    <div className="mt-6 border bg-slate-100 dark:bg-gray-800 rounded-md">
      <div className="font-medium flex items-center justify-between bg-gray-900 px-4 py-3 rounded-t-md">
        {form.watch("title") ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : (
          <X className="h-5 w-5 text-red-500" />
        )}
        <label className="text-gray-100 font-bold ml-2 flex-1">{t.title}</label>
        <Button onClick={toggleEdit} variant="ghost" size="sm" className="text-gray-100">
          {isEditing ? t.cancelButton : (
            <>
              <Pencil className="h-4 w-4 mr-1" />
              {t.editButton}
            </>
          )}
        </Button>
      </div>

      {!isEditing ? (
        <p className="text-sm text-gray-800 dark:text-gray-100 px-4 py-3">{previewTitle}</p>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="text-black dark:text-white"
                      disabled={isSubmitting}
                      placeholder={t.placeholder}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setPreviewTitle(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-end gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit">
                Guardar
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
