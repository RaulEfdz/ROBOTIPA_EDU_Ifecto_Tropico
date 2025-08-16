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
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { isModuleActiveForRole, activateModuleForRole, RoleType } from "@/config/module-activation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { FaWhatsapp } from "react-icons/fa";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

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
  const { user } = useCurrentUser();

  // 1) Estado local para reflejar inmediatamente el precio en UI
  const [currentPrice, setCurrentPrice] = useState<number>(
    initialData.price ?? 0
  );
  const [isEditing, setIsEditing] = useState(false);
  
  // 2) Estado para el sistema de módulos WhatsApp
  const [whatsappPriceEnabled, setWhatsappPriceEnabled] = useState<boolean>(
    user?.customRole ? isModuleActiveForRole(user.customRole as RoleType, 'whatsapp_special_price') : false
  );

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

  // Función para activar/desactivar WhatsApp precio especial
  const toggleWhatsAppPrice = async () => {
    try {
      if (!user?.customRole) {
        toast.error("Usuario no identificado");
        return;
      }

      if (whatsappPriceEnabled) {
        // Desactivar - aquí podrías llamar a una API para persistir
        setWhatsappPriceEnabled(false);
        toast.success("Función de precio especial por WhatsApp desactivada");
      } else {
        // Activar el módulo
        activateModuleForRole(user.customRole as RoleType, 'whatsapp_special_price');
        setWhatsappPriceEnabled(true);
        toast.success("¡Función de precio especial por WhatsApp activada!");
      }
    } catch (error) {
      console.error("[WHATSAPP_TOGGLE]", error);
      toast.error("Error al cambiar configuración de WhatsApp");
    }
  };

  return (
    <div className="mt-6 border border-gray-200 dark:border-gray-700 bg-stone-50 dark:bg-stone-900 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <span>Precio del curso</span>
            <span title="El precio será visible para los estudiantes en la página pública del curso.">
              <Info className="w-4 h-4 text-primary-500" />
            </span>
          </h3>
          {currentPrice > 0 ? (
            <Badge className="bg-primary-100 text-primary-700 text-base px-3 py-1 ml-2 animate-pulse">
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
                <span className="text-2xl font-bold text-primary-700 flex items-center gap-1">
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="inline-block text-primary-500"
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
                          className="w-32 border-2 border-primary-400 focus:ring-2 focus:ring-primary-500 text-lg"
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
                    className="bg-primary-600 hover:bg-primary-700 text-white"
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

      {/* Separador */}
      <Separator className="my-6" />

      {/* Sección de WhatsApp Precio Especial */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FaWhatsapp className="h-5 w-5 text-green-500" />
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">
                Precio Especial por WhatsApp
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Permite que estudiantes contacten por WhatsApp para precio especial
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={whatsappPriceEnabled}
              onCheckedChange={toggleWhatsAppPrice}
              className="data-[state=checked]:bg-green-500"
            />
            <span className="text-sm font-medium">
              {whatsappPriceEnabled ? "Activo" : "Inactivo"}
            </span>
          </div>
        </div>

        {whatsappPriceEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
          >
            <div className="flex items-start gap-3">
              <FaWhatsapp className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm">
                <p className="text-green-800 dark:text-green-200 font-medium">
                  ✅ Función activada
                </p>
                <p className="text-green-700 dark:text-green-300 mt-1">
                  Los estudiantes verán un botón para contactarte por WhatsApp y negociar un precio especial. 
                  Esta función les permite obtener descuentos estudiantiles u ofertas personalizadas.
                </p>
                <div className="mt-2 text-xs text-green-600 dark:text-green-400">
                  💡 <strong>Tip:</strong> Puedes desactivar esta función en cualquier momento usando el switch de arriba.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!whatsappPriceEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>
                📱 <strong>Precio especial desactivado:</strong> Los estudiantes solo verán el precio regular del curso.
              </p>
              <p className="mt-1">
                Activa esta función para permitir que contacten por WhatsApp y negocien precios especiales.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
