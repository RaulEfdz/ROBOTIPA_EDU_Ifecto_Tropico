"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Check, X, ArrowRight, Info } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
import { TitleToolsNav } from "./tools-nav";
import { Badge } from "@/components/ui/badge";

const texts = {
  es: {
    titleLabel: "Título del curso",
    placeholder: "Nombre del curso",
    successMessage: "Título actualizado",
    validationMessage: "El título es obligatorio",
    hintMessage: "El título debe ser claro, único y descriptivo",
    cancelButton: "Cancelar",
    editButton: "Editar",
  },
  en: {
    titleLabel: "Course Title",
    placeholder: "Course name",
    successMessage: "Title updated",
    validationMessage: "Title is required",
    hintMessage: "The title should be clear, unique and descriptive",
    cancelButton: "Cancel",
    editButton: "Edit",
  },
};

interface TitleFormProps {
  initialData: { title: string };
  courseId: string;
  lang?: "es" | "en";
}

const formSchema = z.object({
  title: z.string().min(1, { message: texts.es.validationMessage }),
});

export const TitleForm = ({
  initialData,
  courseId,
  lang = "es",
}: TitleFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState(initialData.title);
  const router = useRouter();
  const t = texts[lang];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title },
  });

  const { isSubmitting, isValid, isDirty } = form.formState;

  const toggleEdit = useCallback(() => {
    if (isEditing) form.reset({ title });
    setIsEditing((prev) => !prev);
  }, [isEditing, form, title]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.title === title) return toggleEdit();

    setIsSaving(true);
    const path = `/api/courses/${courseId}/updates/title/`;

    try {
      await fetchData({
        method: "POST",
        values,
        courseId,
        path,
        callback: (res: any) => {
          toast.success(t.successMessage, {
            duration: 2000,
            position: "bottom-right",
          });

          if (res?.data?.title) {
            setTitle(res.data.title);
            form.reset({ title: res.data.title });
          }

          toggleEdit();
        },
      });
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setIsSaving(false);
    }
  };

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
  }, [isEditing, isValid, isDirty, form, onSubmit, toggleEdit]);

  return (
    <div className="mb-6 bg-TextCustom dark:bg-gray-850 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>{t.titleLabel}</span>
            <span title={t.hintMessage}>
              <Info className="w-4 h-4 text-emerald-500" />
            </span>
          </h3>
          {title ? (
            <Badge className="bg-emerald-100 text-emerald-700 text-base px-3 py-1 ml-2 animate-pulse">
              Completado
            </Badge>
          ) : (
            <Badge className="bg-gray-200 text-gray-600 text-base px-3 py-1 ml-2 animate-pulse">
              Pendiente
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleEdit}
          className="text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg h-8"
        >
          <Pencil className="h-4 w-4 mr-1" />
          {isEditing ? t.cancelButton || "Cancelar" : t.editButton || "Editar"}
        </Button>
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
              <TitleToolsNav />
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder={t.placeholder}
                          {...field}
                          className="w-full border-2 border-emerald-400 focus:ring-2 focus:ring-emerald-500 text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Guardar
                  </Button>
                  <Button variant="outline" size="sm" onClick={toggleEdit}>
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
            <div className="flex items-center gap-2 mt-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                {title || (
                  <span className="text-gray-400 italic">Sin título</span>
                )}
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isEditing && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-500">
            <div className="flex items-center mr-4">
              <div className="w-2 h-2 rounded-full bg-green-400 mr-2"></div>
              <span>
                Última actualización: {new Date().toLocaleDateString()}
              </span>
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
