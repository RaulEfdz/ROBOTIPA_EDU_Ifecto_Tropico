"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";
import { fetchData } from "../../custom/fetchData";

// Textos en español e inglés
const texts = {
  es: {
    title: "Categorías del curso",
    editButton: "Editar categoría",
    cancelButton: "Cancelar",
    saveButton: "Guardar",
    noCategory: "Sin categoría",
    successMessage: "Curso actualizado",
    errorMessage: "Ocurrió un error",
    validationMessage: "Se requiere una categoría",
  },
  en: {
    title: "Course Categories",
    editButton: "Edit Category",
    cancelButton: "Cancel",
    saveButton: "Save",
    noCategory: "No category",
    successMessage: "Course updated",
    errorMessage: "An error occurred",
    validationMessage: "Category is required",
  },
};

interface CategoryFormProps {
  initialData: Course;
  courseId: string;
  options: { label: string; value: string }[];
  lang?: "es" | "en"; // idioma opcional, español por defecto
}

const formSchema = z.object({
  categoryId: z.string().min(1, { message: texts.es.validationMessage }),
});

export const CategoryForm = ({ initialData, courseId, options, lang = "es" }: CategoryFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      categoryId: initialData?.categoryId || "",
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const toggleEdit = () => setIsEditing((current) => !current);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const path = `/api/courses/${courseId}`;

    fetchData({
      values,
      courseId,
      path,
      callback: () => {
        toast.success(texts[lang].successMessage);
        toggleEdit();
        router.refresh();
      },
    });
  };

  const selectedOption = options.find((option) => option.value === initialData.categoryId);

  return (
    <div className="mt-6 border bg-slate-100 dark:bg-gray-800 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        {texts[lang].title}
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? (
            texts[lang].cancelButton
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              {texts[lang].editButton}
            </>
          )}
        </Button>
      </div>

      {!isEditing && (
        <p className={cn("text-sm mt-2", !initialData.categoryId && "text-slate-500 italic")}>
          {selectedOption?.label || texts[lang].noCategory}
        </p>
      )}

      {isEditing && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Combobox options={options} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} type="submit" className="bg-green-600 text-white">
                {texts[lang].saveButton}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
