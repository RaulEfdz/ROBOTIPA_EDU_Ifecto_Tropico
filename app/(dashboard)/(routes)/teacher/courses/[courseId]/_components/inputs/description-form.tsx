"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Check, X, ArrowRight } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import EditorText from "@/components/EditorText/EditorText";
import { fetchData } from "../../../custom/fetchData";

const texts = {
  es: {
    title: "Descripción del curso",
    editButton: "Editar",
    cancelButton: "Cancelar",
    saveButton: "Guardar",
    placeholder: "por ejemplo, 'Este curso trata sobre...'",
    noDescription: "Sin descripción",
    successMessage: "Descripción actualizada",
    errorMessage: "Ocurrió un error",
    validationMessage: "Se requiere una descripción",
    hintMessage: "Resume de forma clara los objetivos del curso",
  },
  en: {
    title: "Course description",
    editButton: "Edit",
    cancelButton: "Cancel",
    saveButton: "Save",
    placeholder: "e.g., 'This course is about...'",
    noDescription: "No description",
    successMessage: "Description updated",
    errorMessage: "An error occurred",
    validationMessage: "Description is required",
    hintMessage: "Clearly summarize the course goals",
  },
};

interface DescriptionFormProps {
  initialData: { description: string };
  courseId: string;
  lang?: "es" | "en";
}

const formSchema = z.object({
  description: z.string().min(1, { message: texts.es.validationMessage }),
});

export const DescriptionForm = ({
  initialData,
  courseId,
  lang = "es",
}: DescriptionFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [description, setDescription] = useState(initialData.description || "");
  const router = useRouter();
  const t = texts[lang];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { description },
  });

  const { isSubmitting, isValid, isDirty } = form.formState;

  const toggleEdit = useCallback(() => {
    if (isEditing) {
      form.reset({ description });
    }
    setIsEditing((prev) => !prev);
  }, [isEditing, form, description]);

  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") toggleEdit();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing, toggleEdit]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.description === description) {
      toggleEdit();
      return;
    }

    setIsSaving(true);
    const path = `/api/courses/${courseId}/updates/description/`;

    try {
      await fetchData({
        values,
        courseId,
        path,
        method: "POST",
        callback: (res: any) => {
          if (res?.data?.description) {
            setDescription(res.data.description); // ✅ actualiza visualmente
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
      toast.error(t.errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-6 bg-TextCustom dark:bg-gray-850 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>{t.title}</span>
            <span title={t.hintMessage}>
              <Info className="w-4 h-4 text-primary-500" />
            </span>
          </h3>
          {description ? (
            <Badge className="bg-primary-100 text-primary-700 text-base px-3 py-1 ml-2 animate-pulse">
              Completado
            </Badge>
          ) : (
            <Badge className="bg-gray-200 text-gray-600 text-base px-3 py-1 ml-2 animate-pulse">
              Pendiente
            </Badge>
          )}
        </div>
        {!isEditing && (
          <Button
            onClick={toggleEdit}
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg h-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
        {t.hintMessage}
      </p>
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <EditorText
                          initialText={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <div className="flex items-center space-x-2">
                  <Button
                    disabled={!isValid || isSubmitting || !isDirty}
                    type="submit"
                    size="sm"
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    Guardar
                  </Button>
                  <Button
                    type="button"
                    onClick={toggleEdit}
                    variant="outline"
                    size="sm"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              {description ? (
                <div
                  className="prose dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : (
                <em className="text-gray-400">{t.noDescription}</em>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-500">
            <div className="flex items-center mr-4">
              <div className="w-2 h-2 rounded-full bg-primary-400 mr-2" />
              <span>Visible en presentación del curso</span>
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
