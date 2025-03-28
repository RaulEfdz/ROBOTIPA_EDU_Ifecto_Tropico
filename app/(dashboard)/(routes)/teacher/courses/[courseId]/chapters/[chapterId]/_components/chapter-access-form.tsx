"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Lock, Unlock } from "lucide-react"; // Importa los íconos Lock y Unlock
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Chapter } from "@prisma/client";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchData } from "../../../../custom/fetchData";

// Textos en español e inglés
const texts = {
  es: {
    title: "Acceso al capítulo",
    editButton: "Editar acceso",
    cancelButton: "Cancelar",
    saveButton: "Guardar",
    publicDescription: "Este capítulo es público para su vista previa.",
    privateDescription: "Este capítulo es privado y no está disponible para vista previa.",
    checkboxLabel: "Marque esta casilla si desea que este capítulo sea público para vista previa.",
    successMessage: "Capítulo actualizado",
    errorMessage: "Ocurrió un error",
  },
  en: {
    title: "Chapter Access",
    editButton: "Edit Access",
    cancelButton: "Cancel",
    saveButton: "Save",
    publicDescription: "This chapter is public for preview.",
    privateDescription: "This chapter is private and not available for preview.",
    checkboxLabel: "Check this box if you want this chapter to be public for preview.",
    successMessage: "Chapter updated",
    errorMessage: "An error occurred",
  },
};

interface ChapterAccessFormProps {
  initialData: Chapter;
  courseId: string;
  chapterId: string;
  lang?: "es" | "en"; // idioma opcional, español por defecto
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
  const [isEditing, setIsEditing] = useState(false);

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFree: !!initialData.isFree,
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const path = `/api/courses/${courseId}/chapters/${chapterId}`;

    const callback = () => {
      toast.success(texts[lang].successMessage);
      toggleEdit();
      router.refresh();
    };

    try {
      await fetchData({ values, courseId, path, callback, method: "PUT" });
    } catch (error) {
      toast.error(texts[lang].errorMessage);
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 dark:bg-gray-800">
      <div className="font-medium flex items-center justify-between bg-gray-900 pl-3">
        {/* Condicional para mostrar el ícono de candado abierto (público) o cerrado (privado) */}
        {form.watch("isFree") ? (
          <Unlock className="h-5 w-5 text-green-500 mr-2" /> // Candado abierto para capítulo público
        ) : (
          <Lock className="h-5 w-5 text-red-500 mr-2" /> // Candado cerrado para capítulo privado
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
      {!isEditing && (
        <p
          className={cn(
            "text-sm mt-2  p-4",
            !initialData.isFree && "text-slate-500 italic"
          )}
        >
          {initialData.isFree
            ? texts[lang].publicDescription
            : texts[lang].privateDescription}
        </p>
      )}
      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="isFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormDescription>
                      {texts[lang].checkboxLabel}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit">
                {texts[lang].saveButton}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
