"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { X } from "lucide-react";
import {
  getCurrentUserFromDB,
  UserDB,
} from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import Image from "next/image";
import YappyOfficialButton from "@/app/components/payments/YappyOfficialButton";

interface ManualRegistrationButtonProps {
  courseId: string;
  courseTitle: string;
  coursePrice?: number;
}

export default function ManualRegistrationCard({
  courseId,
  courseTitle,
  coursePrice,
}: ManualRegistrationButtonProps) {
  const [currentUser, setCurrentUser] = useState<UserDB | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [manualUserId, setManualUserId] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const isAdmin = currentUser?.customRole === "admin";

  const router = useRouter();
  const separator = process.env.NEXT_PUBLIC_MANUAL_ACCESS_ID_SEPARATOR || "|";
  const salesWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_SALES_NUMBER;
  const appName = process.env.NEXT_PUBLIC_NAME_APP || "nuestra plataforma";

  useEffect(() => {
    getCurrentUserFromDB()
      .then((user) => setCurrentUser(user))
      .catch(() => setCurrentUser(null))
      .finally(() => setIsLoadingUser(false));
  }, []);

  const handleOpenModal = () => {
    if (!currentUser && !isLoadingUser) {
      toast.error("Debes iniciar sesión para continuar.", {
        action: {
          label: "Iniciar sesión",
          onClick: () =>
            router.push(
              "/auth?redirectUrl=" +
                encodeURIComponent(window.location.pathname)
            ),
        },
      });
      return;
    }

    if (!salesWhatsAppNumber) {
      toast.error("El canal de WhatsApp no está disponible.");
      return;
    }

    setModalOpen(true);
  };

  const handleOpenWhatsApp = () => {
    if (!currentUser || !salesWhatsAppNumber) return;

    const today = format(new Date(), "dd/MM/yyyy");
    const rawId = `${courseTitle}${separator}${currentUser.fullName}${separator}${today}`;
    const requestId = rawId.replace(/\s+/g, "_");

    const rId = `${courseId}${separator}${currentUser.id}${separator}${today}`;

    const message = `
Hola equipo de ${appName},

Quisiera solicitar el acceso manual al curso:
*${courseTitle}*

Nombre: ${currentUser.fullName}
Fecha de solicitud: ${today}


Por favor, indíquenme los pasos a seguir para completar el pago por otro medio (Yappy, efectivo, etc.).

¡Muchas gracias!
`;

    const whatsappUrl = `https://wa.me/${salesWhatsAppNumber}?text=${encodeURIComponent(
      message
    )}`;

    window.open(whatsappUrl, "_blank");
    toast.success("Mensaje generado para WhatsApp.");
    setModalOpen(false);
  };

  const handleManualRegister = async () => {
    if (!manualUserId) {
      toast.error("Por favor, ingresa el ID del usuario a registrar.");
      return;
    }
    if (!currentUser) {
      toast.error("No se pudo obtener el usuario actual.");
      return;
    }
    setIsRegistering(true);
    try {
      const response = await fetch("/api/admin/manual-access/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          userId: manualUserId,
          date: new Date().toISOString(),
          processedByUserId: currentUser.id,
          processedByUserEmail: currentUser.email,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Usuario registrado manualmente y correo enviado.");
        setManualUserId("");
        setModalOpen(false);
      } else {
        toast.error(`Error: ${data.error || "Error desconocido"}`);
      }
    } catch (error) {
      toast.error("Error al registrar usuario manualmente.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleManualRevoke = async () => {
    if (!manualUserId) {
      toast.error("Por favor, ingresa el ID del usuario para quitar acceso.");
      return;
    }
    if (!currentUser) {
      toast.error("No se pudo obtener el usuario actual.");
      return;
    }
    setIsRegistering(true);
    try {
      const response = await fetch("/api/admin/manual-access/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          userId: manualUserId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Acceso manual eliminado correctamente.");
        setManualUserId("");
        setModalOpen(false);
      } else {
        toast.error(`Error: ${data.error || "Error desconocido"}`);
      }
    } catch (error) {
      toast.error("Error al eliminar acceso manual.");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">💳</span>
            Opciones de Pago
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
            Selecciona tu método de pago preferido para completar tu inscripción al curso.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Botón de Pagar con Tarjeta (Paguelo Facil) */}
          {coursePrice && coursePrice > 0 && (
            <div className="w-full">
              <Button
                onClick={async () => {
                  try {
                    const user = await getCurrentUserFromDB();
                    if (!user || user.isDeleted || user.isBanned) {
                      toast.error("No se pudo obtener información válida del usuario.");
                      return;
                    }

                    // Fetch first chapter ID
                    const courseRes = await fetch(`/api/courses/${courseId}/published-chapters`, {
                      method: "GET",
                      cache: "no-store",
                    });
                    if (!courseRes.ok) {
                      toast.error("No se pudo obtener información del curso.");
                      return;
                    }
                    const courseData = await courseRes.json();
                    const firstChapterId = courseData.chapters && courseData.chapters.length > 0
                      ? courseData.chapters[0].id
                      : null;

                    if (!firstChapterId) {
                      toast.error("No se encontró el primer capítulo del curso.");
                      return;
                    }

                    const returnUrl = `${window.location.origin}/courses/${courseId}/chapters/${firstChapterId}?status=SUCCESS&course=${courseId}`;

                    if (!user || !user.id) {
  toast.error("Usuario no autenticado o datos incompletos.");
  return;
}
const payload = {
  amount: coursePrice,
  description: `Curso: ${courseTitle}`,
  customParam1: user.id,
  returnUrl,
  pfCf: {
    email: user.email,
    phone: user.phone || "",
    fullName: user.fullName,
    courseId,
  },
  metadata: {
    courseId,
  },
  cardTypes: ["VISA", "MASTERCARD", "NEQUI"],
};

                    const res = await fetch("/api/payments/init", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });

                    const data = await res.json();
                 
                    if (res.ok && data.url) {
                   
                      window.open(data.url, '_blank');
                    } else {
                      toast.error(data.error || "No se pudo generar el enlace de pago.");
                    }
                  } catch (e) {
                    toast.error("Error inesperado al conectar con el servidor.");
                  }
                }}
                disabled={isLoadingUser || !currentUser}
                variant="outline"
                className="w-full bg-primary-600 border-primary-600 text-white font-semibold py-3 group"
              >
                <svg className="mr-2 h-5 w-5 text-white group-hover:text-yellow-300 transition-colors duration-200" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 7h20v2H2V7zm0 6h20v2H2v-2zm0-8h20c.6 0 1 .4 1 1v12c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V6c0-.6.4-1 1-1zm2 11h16V8H4v6z"/>
                </svg>
                <span className="transition-colors duration-200 group-hover:text-yellow-300">Pagar con Tarjeta ${coursePrice}</span>
              </Button>
            </div>
          )}

          {/* Botón de Yappy si hay precio definido y está disponible */}
          {coursePrice && coursePrice > 0 && process.env.NEXT_PUBLIC_YAPPY_AVAILABLE === 'true' && (
            <YappyOfficialButton
              courseId={courseId}
              amount={coursePrice}
              courseName={courseTitle}
              disabled={isLoadingUser || !currentUser}
              className="w-full"
              theme="blue"
              rounded={true}
            />
          )}

          {/* Botón de Pago Manual (WhatsApp) */}
          <Button
            onClick={() => setModalOpen(true)}
            disabled={isLoadingUser}
            variant="outline"
            className="w-full border-primary-600 text-primary-600 font-semibold py-3 transition-all duration-300 ease-out hover:bg-green-600 hover:text-white hover:shadow-md"
          >
            <FaWhatsapp className="mr-2 h-5 w-5" />
            Pago Manual (WhatsApp)
          </Button>
          
          <div className="text-center">
            <p className="text-xs text-gray-500">
              💳 Acepta VISA, MasterCard, American Express
            </p>
            <p className="text-xs text-gray-500">
              📱 Yappy con link directo (abre la app automáticamente)
            </p>
            <p className="text-xs text-gray-500">
              💬 Pago manual: transferencia, efectivo, otros métodos
            </p>
          </div>
        </CardContent>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            {/* Close button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">
              ¿Quieres pagar por otros medios?
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Puedes pagar por Yappy, efectivo u otro medio. Haz clic en el
              botón de abajo para generar un mensaje y contactarnos por
              WhatsApp.
            </p>

            <div className="flex justify-center gap-3">
              <Button
                onClick={() => setModalOpen(false)}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleOpenWhatsApp}
                className="bg-primary-600 text-white hover:bg-primary-700 flex items-center gap-2 whitespace-nowrap"
              >
                <FaWhatsapp className="w-4 h-4" />
                Contactar por WhatsApp
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
