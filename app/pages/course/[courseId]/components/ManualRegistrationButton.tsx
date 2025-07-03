"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";
import { useRouter } from "next/navigation";
import {
  getCurrentUserFromDB,
  UserDB,
} from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import Image from "next/image";
import YappyPaymentButton from "@/app/components/payments/YappyPaymentButton";

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
            Otros medios de pago
            <span className="text-xl">💵</span>
            <Image
              width={100}
              height={100}
              src="/yappy.webp"
              alt="Yappy"
              className="h-5 w-auto object-contain"
            />
          </CardTitle>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-300">
            Puedes pagar por Yappy, transferencia, efectivo u otros métodos.
            Toca el botón para ver instrucciones y completar tu solicitud
            manual.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Botón de Yappy si hay precio definido */}
          {coursePrice && coursePrice > 0 && (
            <YappyPaymentButton
              courseId={courseId}
              amount={coursePrice}
              courseName={courseTitle}
              disabled={isLoadingUser || !currentUser}
              className="w-full"
            />
          )}
          
          {/* Botón para otros métodos de pago */}
          <Button
            onClick={handleOpenModal}
            disabled={isLoadingUser}
            variant="outline"
            className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
          >
            <FaWhatsapp className="mr-2 h-4 w-4" />
            Otros métodos de pago
          </Button>
        </CardContent>
      </Card>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">
              ¿Quieres pagar por otros medios?
            </h2>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Puedes pagar por Yappy, efectivo u otro medio. Haz clic en el
              botón de abajo para generar un mensaje y contactarnos por
              WhatsApp.
            </p>

            <div className="flex justify-center">
              <Button
                onClick={handleOpenWhatsApp}
                className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2 whitespace-nowrap"
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
