"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Check, X } from "lucide-react"; // Importa los íconos Check y X
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

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

// Textos en español e inglés
const texts = {
  es: {
    title: "Título de capítulo",
    editButton: "Editar título",
    cancelButton: "Cancelar",
    successMessage: "Capítulo actualizado",
    errorMessage: "Ocurrió un error en el título del capítulo",
    placeholder: "e.g. 'Introducción al curso'",
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
  lang?: "es" | "en"; // Idioma opcional, español por defecto
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
  const [isEditing, setIsEditing] = useState(false);
  const [previewTitle, setPreviewTitle] = useState(initialData.title);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const path = `/api/courses/${courseId}/chapters/${chapterId}`;

    const callback = () => {
      toast.success(texts[lang].successMessage);
      toggleEdit();
      router.refresh();
    };

    await fetchData({ values, courseId, path, callback, method: "PUT" });
  };

  return (
    <div className="mt-6 border bg-slate-100 dark:bg-gray-800">
      <div className="font-medium flex items-center justify-between bg-gray-900 pl-3">
        {/* Condicional para mostrar el ícono de check o X antes del título */}
        {form.watch("title") ? (
          <Check className="h-5 w-5 text-green-500 mr-2" />
        ) : (
          <X className="h-5 w-5 text-red-500 mr-2" />
        )}
        
        <label className="text-gray-100 font-bold mr-3">{texts[lang].title}</label>
        <Button onClick={toggleEdit} variant="ghost" className="text-gray-100 ">
          {isEditing ? (
            <>{texts[lang].cancelButton}</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              {texts[lang].editButton}
            </>
          )}
        </Button>
      </div>

      {!isEditing ? (
        <p className="text-sm  p-4">{previewTitle}</p>
      ) : (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      className="rounded-none text-black"
                      disabled={isSubmitting}
                      placeholder={texts[lang].placeholder}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setPreviewTitle(e.target.value); // Actualiza la vista previa en tiempo real
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-x-2 p-2">
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
