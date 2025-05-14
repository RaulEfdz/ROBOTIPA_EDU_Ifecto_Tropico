"use client";

import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa"; // Usando react-icons
import { useRouter } from "next/navigation";
import {
  getCurrentUserFromDB,
  UserDB,
} from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";

interface ManualRegistrationButtonProps {
  courseId: string;
  courseTitle: string;
}

const ManualRegistrationButton: React.FC<ManualRegistrationButtonProps> = ({
  courseId,
  courseTitle,
}) => {
  const [currentUser, setCurrentUser] = useState<UserDB | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const router = useRouter();

  const separator = process.env.NEXT_PUBLIC_MANUAL_ACCESS_ID_SEPARATOR || "|";
  const salesWhatsAppNumber = process.env.NEXT_PUBLIC_WHATSAPP_SALES_NUMBER;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUserFromDB();
        setCurrentUser(user);
      } catch (error) {
        console.warn(
          "Error fetching current user for manual registration button:",
          error
        );
        setCurrentUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  const handleRequestManualRegistration = () => {
    if (isLoadingUser) {
      toast.info("Verificando información de usuario...");
      return;
    }

    if (!currentUser || !currentUser.id) {
      toast.error("Debes iniciar sesión para solicitar un registro manual.", {
        action: {
          label: "Iniciar Sesión",
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
      toast.error(
        "La opción de solicitud por WhatsApp no está disponible actualmente.",
        {
          description: "Por favor, contacta a soporte.",
        }
      );
      console.error(
        "MANUAL REG: NEXT_PUBLIC_WHATSAPP_SALES_NUMBER no está definido."
      );
      return;
    }

    const today = format(new Date(), "yyyyMMdd");
    const requestId = `${courseId}${separator}${currentUser.id}${separator}${today}`;
    const appName = process.env.NEXT_PUBLIC_NAME_APP || "nuestra plataforma";
    const message = `Hola equipo de ${appName},\n\nSolicito el registro manual al curso \"${courseTitle}\".\n\nID de solicitud: ${requestId}\n\nGracias.`;
    const whatsappUrl = `https://wa.me/${salesWhatsAppNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
    toast.success(
      "Se ha generado tu mensaje para WhatsApp. Por favor, envíalo para procesar tu solicitud.",
      {
        duration: 7000, // Más tiempo para que el usuario lo vea bien
      }
    );
  };

  if (!salesWhatsAppNumber && !isLoadingUser) {
    return null;
  }

  return (
    <Button
      variant="outline"
      onClick={handleRequestManualRegistration}
      disabled={isLoadingUser}
      className="w-full sm:w-auto border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 flex items-center gap-2"
    >
      <FaWhatsapp className="h-5 w-5" />
      Solicitar por WhatsApp
    </Button>
  );
};

export default ManualRegistrationButton;
