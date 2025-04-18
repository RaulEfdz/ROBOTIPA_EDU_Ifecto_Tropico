"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Unlock, Eye } from "lucide-react";

import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { fetchData } from "../../../../custom/fetchData";

const texts = {
  es: {
    title: "Configuración de acceso",
    subtitle: "Acceso al capítulo",
    publicLabel: "Capítulo Gratis",
    privateLabel: "Capítulo De Pago",
    publicDescription: "Los usuarios pueden ver este capítulo sin comprar el curso",
    privateDescription: "Los usuarios necesitan comprar el curso para ver este capítulo",
    saveButton: "Guardar cambios",
    cancelButton: "Cancelar",
    successMessage: "Configuración de acceso actualizada",
    errorMessage: "Error al actualizar la configuración de acceso",
    hint: "Permitir acceso gratuito para mostrar parte del contenido antes de comprar"
  },
  en: {
    title: "Access Configuration",
    subtitle: "Chapter Access",
    publicLabel: "Public Chapter",
    privateLabel: "Private Chapter",
    publicDescription: "Users can view this chapter without purchasing the course",
    privateDescription: "Users need to purchase the course to view this chapter",
    saveButton: "Save Changes",
    cancelButton: "Cancel",
    successMessage: "Access configuration updated",
    errorMessage: "Error updating access configuration",
    hint: "Enable free preview to show part of the content before purchase"
  }
};

const formSchema = z.object({
  isFree: z.boolean().default(false),
});

interface ChapterAccessFormProps {
  initialData: {
    isFree: boolean;
  };
  courseId: string;
  chapterId: string;
  // userId: string; // Ahora incluimos el userId para usar en el endpoint
  lang?: "es" | "en";
}

export const ChapterAccessForm = ({
  initialData,
  courseId,
  chapterId,
  // userId,
  lang = "es",
}: ChapterAccessFormProps) => {
  const t = texts[lang];
  const router = useRouter();
  // Estado local para manejar el valor actual de isFree obtenido desde el endpoint
  const [accessState, setAccessState] = useState(initialData.isFree);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFree: initialData.isFree,
    },
  });

  const { isSubmitting, isDirty } = form.formState;

  // Función para revalidar el estado de acceso
  const fetchAccessState = async () => {
    try {
      const response = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}/access`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId, chapterId }),
        }
      );
      const data = await response.json();
      if (data.chapter) {
        setAccessState(data.chapter.isFree);
        form.reset({ isFree: data.chapter.isFree });
      }
    } catch (error) {
      console.error("Error fetching access state:", error);
    }
  };

  // Al salir del modo edición se reinicia el form con el estado actual
  const toggleEdit = () => {
    form.reset({ isFree: accessState });
    setIsEditing((prev) => !prev);
  };

  interface OnSubmitValues {
    isFree: boolean;
  }

  const onSubmit = async (values: OnSubmitValues): Promise<void> => {
    setIsSaving(true);

    try {
      await fetchData({
        method: "POST",
        values,
        courseId,
        path: `/api/courses/${courseId}/chapters/${chapterId}/edit`,
        callback: (res: unknown) => {
          toast.success(t.successMessage, {
            duration: 2000,
            position: "bottom-right",
          });
          // Llamamos al endpoint para obtener el último estado
          fetchAccessState();
          setIsEditing(false);
        },
      });
    } catch (error: unknown) {
      toast.error(t.errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mb-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-medium">{t.title}</h3>
        </div>
        <p className="text-sm text-gray-500">{t.subtitle}</p>
      </CardHeader>

      <CardContent
        className={`p-0 ${
          !isEditing &&
          (accessState
            ? "bg-green-50 dark:bg-green-900/10 border-l-4 border-green-500 dark:border-green-500"
            : "bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500 dark:border-red-500")
        }`}
      >
        {!isEditing ? (
          <div className="flex items-center gap-4 p-4">
            {accessState ? (
              <>
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <Unlock className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-medium text-green-600 dark:text-green-400">
                    {t.publicLabel}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t.publicDescription}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                  <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-medium text-red-700 dark:text-red-300">
                    {t.privateLabel}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {t.privateDescription}
                  </p>
                </div>
              </>
            )}
            <Button variant="outline" size="sm" className="ml-auto" onClick={toggleEdit}>
              Editar
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-4">
              <FormField
                control={form.control}
                name="isFree"
                render={({ field }) => (
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-lg transition-all ${
                        field.value
                          ? "bg-green-50 dark:bg-green-900/20 border-2 border-green-100 dark:border-green-800"
                          : "bg-red-50 dark:bg-red-900/20 border-2 border-red-100 dark:border-red-800"
                      }`}
                    >
                      <FormItem className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {field.value ? (
                            <Unlock className="w-5 h-5 text-green-600 dark:text-green-400" />
                          ) : (
                            <Lock className="w-5 h-5 text-red-400 dark:text-red-400" />
                          )}
                          <div className="font-medium">
                            {field.value ? t.publicLabel : t.privateLabel}
                          </div>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-green-500"
                          />
                        </FormControl>
                      </FormItem>
                      <p className="text-sm ml-7 text-gray-600 dark:text-gray-300">
                        {field.value ? t.publicDescription : t.privateDescription}
                      </p>
                    </div>

                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <p>{t.hint}</p>
                    </div>
                  </div>
                )}
              />

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={toggleEdit}>
                  {t.cancelButton}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="bg-blue-600 hover:bg-blue-700 text-TextCustom"
                >
                  {isSaving ? (
                    <div className="h-4 w-4 border-2 border-TextCustom border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  {t.saveButton}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>

      {!isEditing && (
        <CardFooter className="text-xs text-gray-500 border-t pt-3">
          <div className="flex items-center gap-1">
            <div
              className={`w-2 h-2 rounded-full ${
                accessState ? "bg-green-500" : "bg-red-500"
              }`}
            />
            <span>ID: {chapterId.slice(0, 8)}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
