"use client";

import React, { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePrimaryColorStyle, isHexColor, getPrimaryColor } from "@/lib/colors";

// Hook personalizado para obtener estilos dinámicos del botón
const useButtonStyles = () => {
  const primaryColor = getPrimaryColor();
  
  const bgStyle = usePrimaryColorStyle('600');
  const hoverStyle = usePrimaryColorStyle('700');
  
  if (isHexColor(primaryColor)) {
    return {
      style: typeof bgStyle === 'object' ? bgStyle : undefined,
      hoverStyle: typeof hoverStyle === 'object' ? hoverStyle : undefined,
      isCustom: true,
    };
  }
  
  // Para colores Tailwind
  const colorName = primaryColor.toLowerCase();
  return {
    className: `bg-${colorName}-600 hover:bg-${colorName}-700`,
    isCustom: false,
  };
};

// Hook personalizado para obtener estilos del botón WhatsApp
const useWhatsAppButtonStyles = () => {
  const primaryColor = getPrimaryColor();
  
  const bgStyle = usePrimaryColorStyle('600');
  const hoverStyle = usePrimaryColorStyle('700');
  
  if (isHexColor(primaryColor)) {
    return {
      style: typeof bgStyle === 'object' ? bgStyle : undefined,
      hoverStyle: typeof hoverStyle === 'object' ? hoverStyle : undefined,
      isCustom: true,
    };
  }
  
  const colorName = primaryColor.toLowerCase();
  return {
    className: `bg-${colorName}-600 hover:bg-${colorName}-700`,
    isCustom: false,
  };
};

export interface CustomProgressButtonProps {
  chapterId: string;
  courseId: string;
  nextChapterId?: string;
  isCompleted: boolean;
}

// Tipo seguro para los datos de usuario
type UserSafe = {
  name?: string;
  full_name?: string;
  fullName?: string;
  email?: string;
  [key: string]: any;
};

const CustomProgressButton: React.FC<CustomProgressButtonProps> = ({
  chapterId,
  courseId,
  nextChapterId,
  isCompleted,
}) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  const { user, loading: userLoading } = useCurrentUser() as {
    user: UserSafe | null;
    loading: boolean;
  };

  // Fecha actual en formato DD/MM/YYYY
  const today = new Date();
  const fecha = `${today
    .getDate()
    .toString()
    .padStart(2, "0")}/${(today.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${today.getFullYear()}`;

  // Datos de usuario
  const nombre = user?.name || user?.full_name || user?.fullName || "";
  const correo = user?.email || "";

  // Mensaje para WhatsApp
  const mensajeWhatsapp = `Hola, he completado el curso con ID: ${courseId}.\nFecha: ${fecha}\nNombre: ${nombre}\nCorreo: ${correo}`;

  // Obtener estilos dinámicos usando hooks
  const buttonStyles = useButtonStyles();
  const whatsAppStyles = useWhatsAppButtonStyles();

  const handleClick = async () => {
    setIsLoading(true);
    try {
      if (!isCompleted) {
        const res = await fetch(
          `/api/courses/${courseId}/chapters/${chapterId}/progress`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isCompleted: true }),
          }
        );
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();

        // Si el curso terminó y hay certificado disponible…
        if (data.courseCompleted && (data.certificateGenerated || data.certificateId)) {
          setShowCertModal(true);
        } else {
          // Si no hay más capítulos, confetti; sino toast normal
          if (!nextChapterId) confetti.onOpen();
          toast.success("✅ Capítulo marcado como completado");
        }

        // Dejar ver confetti o modal (3 s)
        await new Promise((r) => setTimeout(r, 3000));
      }

      // Navegar
      if (nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
      } else {
        router.push(`/courses/${courseId}`);
      }
    } catch (error) {
      console.error("Error al actualizar progreso:", error);
      toast.error("Ocurrió un error al actualizar el progreso");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        disabled={isLoading}
        size="sm"
        className={buttonStyles.isCustom ? "shadow-sm hover:shadow" : `shadow-sm hover:shadow ${buttonStyles.className}`}
        style={buttonStyles.isCustom ? buttonStyles.style : undefined}
        onMouseEnter={(e) => {
          if (buttonStyles.isCustom && buttonStyles.hoverStyle) {
            Object.assign(e.currentTarget.style, buttonStyles.hoverStyle);
          }
        }}
        onMouseLeave={(e) => {
          if (buttonStyles.isCustom && buttonStyles.style) {
            Object.assign(e.currentTarget.style, buttonStyles.style);
          }
        }}
      >
        {isLoading
          ? "Cargando..."
          : isCompleted
          ? "Continuar"
          : "Marcar como completado"}
      </Button>

      {/* Modal para solicitar certificado por WhatsApp */}
      <Dialog open={showCertModal} onOpenChange={setShowCertModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Felicidades! Has completado el curso</DialogTitle>
            <DialogDescription>
              Nuestro sistema de certificados está en mantenimiento.
              <br />
              Para recibir tu certificado, toca el botón y envíanos un mensaje
              por WhatsApp. Te lo enviaremos manualmente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              asChild
              className={whatsAppStyles.isCustom ? "" : whatsAppStyles.className}
              style={whatsAppStyles.isCustom ? whatsAppStyles.style : undefined}
              disabled={userLoading}
              onMouseEnter={(e) => {
                if (whatsAppStyles.isCustom && whatsAppStyles.hoverStyle) {
                  Object.assign(e.currentTarget.style, whatsAppStyles.hoverStyle);
                }
              }}
              onMouseLeave={(e) => {
                if (whatsAppStyles.isCustom && whatsAppStyles.style) {
                  Object.assign(e.currentTarget.style, whatsAppStyles.style);
                }
              }}
            >
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  mensajeWhatsapp
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Solicitar certificado por WhatsApp
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomProgressButton;
