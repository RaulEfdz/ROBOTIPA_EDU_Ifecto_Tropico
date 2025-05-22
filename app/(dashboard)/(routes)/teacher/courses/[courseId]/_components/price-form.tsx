"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";
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
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";

interface PriceFormProps {
  initialData: Course;
  courseId: string;
}

const formSchema = z.object({
  price: z.coerce
    .number()
    .min(0, { message: "El precio debe ser mayor o igual a 0" }),
});

export const PriceForm = ({ initialData, courseId }: PriceFormProps) => {
  const router = useRouter();

  // 1) Estado local para reflejar inmediatamente el precio en UI
  const [currentPrice, setCurrentPrice] = useState<number>(
    initialData.price ?? 0
  );
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { price: currentPrice },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const path = `/api/courses/${courseId}/updates/price`;
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error actualizando precio");
      }

      // 2) Actualizo el estado local
      setCurrentPrice(values.price);

      toast.success("Precio actualizado");
      setIsEditing(false);

      // 3) Opcional: refresca datos en servidor si tienes lógica server-side
      router.refresh();
    } catch (error: any) {
      console.error("[PRICE_UPDATE]", error);
      toast.error(error.message || "No se pudo actualizar el precio");
    }
  };

  return (
    <div className="mt-6 border border-gray-200 dark:border-gray-700 bg-stone-50 dark:bg-stone-900 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>Precio del curso</span>
            <span title="El precio será visible para los estudiantes en la página pública del curso.">
              <Info className="w-4 h-4 text-emerald-500" />
            </span>
          </h3>
          {currentPrice > 0 ? (
            <Badge className="bg-emerald-100 text-emerald-700 text-base px-3 py-1 ml-2 animate-pulse">
              {formatPrice(currentPrice)}
            </Badge>
          ) : (
            <Badge className="bg-gray-200 text-gray-600 text-base px-3 py-1 ml-2 animate-pulse">
              Gratis
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            form.reset({ price: currentPrice });
            setIsEditing((v) => !v);
          }}
        >
          <Pencil className="h-4 w-4 mr-1" />
          {isEditing ? "Cancelar" : "Editar"}
        </Button>
      </div>
      <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
        El precio debe ser mayor o igual a 0. Si el curso es gratis, escribe 0.
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
              {currentPrice > 0 ? (
                <span className="text-2xl font-bold text-emerald-700 flex items-center gap-1">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="inline-block text-emerald-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"
                    />
                  </svg>
                  {formatPrice(currentPrice)}
                </span>
              ) : (
                <span className="text-xl font-semibold text-gray-500 italic flex items-center gap-1">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="inline-block text-gray-400"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 10c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"
                    />
                  </svg>
                  Gratis
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
                className="mt-4 space-y-4"
              >
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min={0}
                          disabled={isSubmitting}
                          placeholder="0.00"
                          {...field}
                          className="w-32 border-2 border-emerald-400 focus:ring-2 focus:ring-emerald-500 text-lg"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Guardar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      form.reset({ price: currentPrice });
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
    </div>
  );
};
