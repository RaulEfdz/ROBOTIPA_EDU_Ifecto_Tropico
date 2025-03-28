"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchData } from "../../custom/fetchData";

// Textos en español e inglés
const texts = {
  es: {
    titleLabel: "Título del curso",
    editButton: "Editar título",
    cancelButton: "Cancelar",
    saveButton: "Guardar",
    placeholder: "por ejemplo, 'Desarrollo web avanzado'",
    successMessage: "Curso actualizado",
    validationMessage: "Se requiere el título...",
  },
  en: {
    titleLabel: "Course Title",
    editButton: "Edit Title",
    cancelButton: "Cancel",
    saveButton: "Save",
    placeholder: "e.g., 'Advanced Web Development'",
    successMessage: "Course updated",
    validationMessage: "Title is required...",
  },
};

interface TitleFormProps {
  initialData: { title: string };
  courseId: string;
  lang?: "es" | "en"; // idioma opcional, español por defecto
}

const formSchema = z.object({
  title: z.string().min(1, { message: texts.es.validationMessage }),
});

export const TitleForm = ({ initialData, courseId, lang = "es" }: TitleFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  const { isSubmitting, isValid } = form.formState;

  const toggleEdit = () => setIsEditing((prev) => !prev);

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

  return (
    <div className="mt-6 border dark:bg-gray-800 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        {texts[lang].titleLabel}
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing ? texts[lang].cancelButton : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              {texts[lang].editButton}
            </>
          )}
        </Button>
      </div>

      {!isEditing ? (
        <p className="text-sm mt-2 text-gray-300">{initialData.title}</p>
      ) : (
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
                      placeholder={texts[lang].placeholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button
                disabled={!isValid || isSubmitting}
                type="submit"
                className="bg-green-600 text-white"
              >
                {texts[lang].saveButton}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
