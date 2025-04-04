"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { Pencil, Check, X, Lock, Unlock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Chapter } from "@prisma/client";

import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { fetchData } from "../../../../custom/fetchData";

const texts = {
  es: {
    title: "3 - Acceso al capítulo",
    editButton: "Editar",
    cancelButton: "Cancelar",
    saveButton: "Guardar",
    publicDescription: "Este capítulo es público para vista previa.",
    privateDescription: "Este capítulo es privado y no está disponible en vista previa.",
    checkboxLabel: "Marcar si este capítulo debe ser público para vista previa.",
    successMessage: "Acceso actualizado",
    errorMessage: "Ocurrió un error al actualizar el acceso",
    hintMessage: "Permitir acceso gratuito para mostrar parte del contenido antes de comprar",
  },
  en: {
    title: "3 - Chapter Access",
    editButton: "Edit",
    cancelButton: "Cancel",
    saveButton: "Save",
    publicDescription: "This chapter is public for preview.",
    privateDescription: "This chapter is private and not available for preview.",
    checkboxLabel: "Mark if this chapter should be public for preview.",
    successMessage: "Access updated",
    errorMessage: "An error occurred updating access",
    hintMessage: "Enable free preview to show part of the content before purchase",
  },
};

interface ChapterAccessFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
  lang?: "es" | "en";
}

const formSchema = z.object({
  isFree: z.boolean().default(false),
});

export const ChapterAccessForm = ({
  initialData,
  courseId,
  chapterId,
  lang = "es",
}: ChapterAccessFormProps) => {
  const t = texts[lang];
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [accessStatus, setAccessStatus] = useState(!!initialData.isFree);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { isFree: accessStatus },
  });

  const { isSubmitting, isValid, isDirty } = form.formState;

  const toggleEdit = () => {
    form.reset({ isFree: accessStatus });
    setIsEditing((prev) => !prev);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSaving(true);

    try {
      await fetchData({
        method: "PUT",
        values,
        courseId,
        path: `/api/courses/${courseId}/chapters/${chapterId}`,
        callback: (res: any) => {
          if (typeof res?.data?.isFree !== "undefined") {
            setAccessStatus(res.data.isFree);
            form.reset({ isFree: res.data.isFree });
          }

          toast.success(t.successMessage, { duration: 2000, position: "bottom-right" });
          toggleEdit();
          router.refresh();
        },
      });
    } catch {
      toast.error(t.errorMessage);
    } finally {
      setIsSaving(false);
    }
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
        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex items-center gap-2">
          {accessStatus ? (
            <Unlock className="h-4 w-4 text-green-500" />
          ) : (
            <Lock className="h-4 w-4 text-red-500" />
          )}
          <span>{accessStatus ? t.publicDescription : t.privateDescription}</span>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="isFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 rounded-md border p-4 bg-slate-50 dark:bg-slate-800">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1">
                    <FormDescription>{t.checkboxLabel}</FormDescription>
                    <FormMessage className="text-xs" />
                  </div>
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2">
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
          </form>
        </Form>
      )}

      {!isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>{accessStatus ? "Público" : "Privado"}</span>
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
