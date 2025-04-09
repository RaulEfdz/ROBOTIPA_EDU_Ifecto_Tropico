"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Check, X, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
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
import { TitleToolsNav } from "../../../_components/inputs/title/tools-nav";

const texts = {
  es: {
    titleLabel: "1 - Título del capítulo",
    placeholder: "Ej. Introducción al curso",
    successMessage: "Título actualizado",
    validationMessage: "El título es obligatorio",
    hintMessage: "Asegúrate de que el título sea claro y breve",
  },
  en: {
    titleLabel: "1 - Chapter Title",
    placeholder: "e.g. 'Introduction to the course'",
    successMessage: "Title updated",
    validationMessage: "Title is required",
    hintMessage: "Make sure the title is clear and concise",
  },
};

interface ChapterTitleFormProps {
  initialData: {
    title: string;
    updatedAt?: Date;
  };
  courseId: string;
  chapterId: string;
  lang?: "es" | "en";
}

const formSchema = z.object({
  title: z.string().min(1, { message: texts.es.validationMessage }),
});

export const ChapterTitleForm = ({
  initialData,
  courseId,
  chapterId,
  lang = "es",
}: ChapterTitleFormProps) => {
  const t = texts[lang];
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(initialData.title);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title },
  });

  const { isSubmitting, isValid, isDirty } = form.formState;

  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleEdit();
      if (e.key === "Enter" && isValid && isDirty) {
        form.handleSubmit(onSubmit)();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, isValid, isDirty]);

  const toggleEdit = () => {
    if (isEditing) {
      form.reset({ title });
    }
    setIsEditing((prev) => !prev);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.title === title) return toggleEdit();

    setIsSaving(true);
    const path = `/api/courses/${courseId}/chapters/${chapterId}/edit`;

    try {
      await fetchData({
        method: "POST",
        values,
        courseId,
        path,
        callback: (res: any) => {
          if (res?.data?.title) {
            setTitle(res.data.title);
            form.reset({ title: res.data.title });
          }

          toast.success(t.successMessage, {
            duration: 2000,
            position: "bottom-right",
          });

          toggleEdit();
          router.refresh();
        },
      });
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-6 bg-white dark:bg-gray-850 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {t.titleLabel}
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

      {isEditing ? (
        <Form {...form}>
          <TitleToolsNav />
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <div className="flex space-x-2">
                    <FormControl>
                      <Input
                        autoFocus
                        disabled={isSubmitting}
                        placeholder={t.placeholder}
                        className="h-10 text-lg font-medium border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500 rounded-lg"
                        {...field}
                      />
                    </FormControl>

                    <div className="flex items-center space-x-1">
                      <Button
                        type="button"
                        onClick={toggleEdit}
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
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <div className="w-1 h-1 rounded-full bg-gray-300 mr-2"></div>
                    {t.hintMessage}
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </form>
        </Form>
      ) : (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {title || <span className="text-gray-400 italic">Sin título</span>}
          </h2>
          <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 text-xs px-2 py-1 rounded-full">
            Activo
          </div>
        </div>
      )}

      {!isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-500">
            <div className="flex items-center mr-4">
              <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
              <span>
                Última actualización:{" "}
                {initialData.updatedAt
                  ? new Date(initialData.updatedAt).toLocaleDateString()
                  : "Reciente"}
              </span>
            </div>
            <div className="flex items-center">
              <ArrowRight className="h-3 w-3 mr-2" />
              <span>ID: {chapterId.substring(0, 8)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
