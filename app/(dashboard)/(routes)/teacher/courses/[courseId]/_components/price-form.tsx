"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Pencil } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course } from "@prisma/client";

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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Precio del curso
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            // 4) Resetea el formulario al precio actual si cancelas edición
            form.reset({ price: currentPrice });
            setIsEditing((v) => !v);
          }}
        >
          <Pencil className="h-4 w-4 mr-1" />
          {isEditing ? "Cancelar" : "Editar"}
        </Button>
      </div>

      {!isEditing ? (
        <p
          className={cn(
            "mt-4 text-base",
            currentPrice === 0
              ? "text-gray-500 italic"
              : "text-gray-800 dark:text-gray-200"
          )}
        >
          {currentPrice > 0 ? formatPrice(currentPrice) : "Sin precio asignado"}
        </p>
      ) : (
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
                      className="w-32"
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
      )}
    </div>
  );
};
