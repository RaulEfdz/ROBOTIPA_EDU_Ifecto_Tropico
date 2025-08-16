"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil, Award, Info, Clock } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface CreditsFormProps {
  initialData: Course & {
    creditEnabled?: boolean;
    creditsPerHour?: number | null;
    totalCredits?: number | null;
  };
  courseId: string;
}

const formSchema = z.object({
  creditEnabled: z.boolean(),
  creditsPerHour: z.coerce
    .number()
    .min(0, { message: "Los créditos por hora deben ser mayor o igual a 0" })
    .optional()
    .nullable(),
  totalCredits: z.coerce
    .number()
    .min(0, { message: "Los créditos totales deben ser mayor o igual a 0" })
    .optional()
    .nullable(),
});

export const CreditsForm = ({ initialData, courseId }: CreditsFormProps) => {
  const router = useRouter();

  const [currentData, setCurrentData] = useState({
    creditEnabled: initialData.creditEnabled ?? false,
    creditsPerHour: initialData.creditsPerHour ?? null,
    totalCredits: initialData.totalCredits ?? null,
  });
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: currentData,
  });

  const { isSubmitting, isValid } = form.formState;
  const watchCreditEnabled = form.watch("creditEnabled");

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const path = `/api/courses/${courseId}/updates/credits`;
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error actualizando créditos");
      }

      setCurrentData(values);
      toast.success("Configuración de créditos actualizada");
      setIsEditing(false);
      router.refresh();
    } catch (error: any) {
      console.error("[CREDITS_UPDATE]", error);
      toast.error(error.message || "No se pudo actualizar la configuración de créditos");
    }
  };

  const displayCredits = () => {
    if (!currentData.creditEnabled) {
      return "Deshabilitado";
    }
    
    if (currentData.totalCredits) {
      return `${currentData.totalCredits} créditos`;
    }
    
    if (currentData.creditsPerHour) {
      return `${currentData.creditsPerHour} créditos/hora`;
    }
    
    return "Configurar créditos";
  };

  return (
    <div className="mt-6 border border-gray-200 dark:border-gray-700 bg-stone-50 dark:bg-stone-900 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Sistema de Créditos</span>
            <span title="Configura el sistema de créditos académicos para tu curso.">
              <Info className="w-4 h-4 text-primary-500" />
            </span>
          </h3>
          <Badge 
            className={`text-base px-3 py-1 ml-2 ${
              currentData.creditEnabled
                ? "bg-amber-100 text-amber-700 animate-pulse"
                : "bg-gray-200 text-gray-600"
            }`}
          >
            {displayCredits()}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            form.reset(currentData);
            setIsEditing((v) => !v);
          }}
        >
          <Pencil className="h-4 w-4 mr-1" />
          {isEditing ? "Cancelar" : "Editar"}
        </Button>
      </div>

      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
        El sistema de créditos permite mostrar créditos académicos en lugar de horas aproximadas.
      </p>

      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div
            key="display"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2 mt-4">
              {currentData.creditEnabled ? (
                <div className="flex flex-col gap-2">
                  <span className="text-2xl font-bold text-amber-700 flex items-center gap-2">
                    <Award className="w-6 h-6 text-amber-500" />
                    {currentData.totalCredits ? (
                      `${currentData.totalCredits} créditos totales`
                    ) : currentData.creditsPerHour ? (
                      `${currentData.creditsPerHour} créditos por hora`
                    ) : (
                      "Configuración pendiente"
                    )}
                  </span>
                  {currentData.creditsPerHour && currentData.totalCredits && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({currentData.creditsPerHour} créditos/hora = {currentData.totalCredits} créditos totales)
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xl font-semibold text-gray-500 italic flex items-center gap-2">
                  <Clock className="w-5 h-5 text-gray-400" />
                  Sistema de horas tradicional
                </span>
              )}
            </div>
          </motion.div>
        ) : (
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
                className="mt-4 space-y-6"
              >
                {/* Enable/Disable Credits Toggle */}
                <FormField
                  control={form.control}
                  name="creditEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-medium">
                          Habilitar Sistema de Créditos
                        </FormLabel>
                        <div className="text-sm text-gray-500">
                          Muestra créditos académicos en lugar de duración en horas
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-amber-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Credits Configuration - Only shown when enabled */}
                {watchCreditEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4"
                  >
                    <Separator />
                    
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-amber-800 dark:text-amber-200 mb-3">
                        Configuración de Créditos
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="creditsPerHour"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Créditos por Hora</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min={0}
                                  disabled={isSubmitting}
                                  placeholder="1.0"
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                  className="border-2 border-amber-300 focus:ring-2 focus:ring-amber-500"
                                />
                              </FormControl>
                              <div className="text-xs text-amber-700 dark:text-amber-300">
                                Opcional: créditos que el curso otorga por hora de estudio
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="totalCredits"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Créditos Totales</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  min={0}
                                  disabled={isSubmitting}
                                  placeholder="40.0"
                                  {...field}
                                  value={field.value ?? ""}
                                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                                  className="border-2 border-amber-300 focus:ring-2 focus:ring-amber-500"
                                />
                              </FormControl>
                              <div className="text-xs text-amber-700 dark:text-amber-300">
                                Créditos totales que otorga el curso al completarlo
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-3 p-3 bg-amber-100 dark:bg-amber-900/40 rounded-md">
                        <p className="text-xs text-amber-800 dark:text-amber-200">
                          💡 <strong>Recomendación:</strong> Puedes definir solo "Créditos Totales" o solo "Créditos por Hora", 
                          o ambos para mayor flexibilidad. Si defines ambos, se mostrarán los créditos totales como principal.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    Guardar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      form.reset(currentData);
                      setIsEditing(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Information section when credits are enabled */}
      {currentData.creditEnabled && !isEditing && (
        <>
          <Separator className="my-6" />
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <Award className="h-4 w-4 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-amber-800 dark:text-amber-200 font-medium">
                  ✅ Sistema de créditos activo
                </p>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  Los estudiantes verán la información de créditos en lugar de la duración aproximada en horas. 
                  Esto es útil para cursos académicos que otorgan créditos oficiales.
                </p>
                <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                  💡 <strong>Tip:</strong> Puedes volver al sistema de horas tradicional desactivando esta función.
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};