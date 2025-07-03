"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FaWhatsapp } from "react-icons/fa";
import { MessageSquare, User, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface WhatsAppStudentButtonProps {
  courseTitle?: string;
  userName?: string;
  userEmail?: string;
  variant?: "default" | "outline" | "ghost" | "floating";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export default function WhatsAppStudentButton({
  courseTitle,
  userName,
  userEmail,
  variant = "outline",
  size = "sm",
  className = "",
}: WhatsAppStudentButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER;
  const appName = process.env.NEXT_PUBLIC_NAME_APP || "INFECTOTRÓPICO";

  const handleWhatsAppClick = () => {
    if (!whatsappNumber) {
      toast.error("El soporte de WhatsApp no está disponible.");
      return;
    }

    setIsLoading(true);

    // Construir el mensaje personalizado
    const coursePart = courseTitle ? `\n\n📚 Curso: ${courseTitle}` : "";
    const userPart = userName ? `\n👤 Estudiante: ${userName}` : "";
    const emailPart = userEmail ? `\n📧 Email: ${userEmail}` : "";

    const message = `Hola equipo de ${appName}, 

Soy estudiante y necesito ayuda con mi curso.${coursePart}${userPart}${emailPart}

Mi consulta es: `;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    // Abrir WhatsApp
    window.open(whatsappUrl, "_blank");
    
    toast.success("¡Mensaje preparado! Te hemos redirigido a WhatsApp.");
    
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  // Variante flotante (para usar como botón independiente)
  if (variant === "floating") {
    return (
      <Button
        onClick={handleWhatsAppClick}
        disabled={isLoading}
        className={`fixed bottom-20 right-6 z-40 h-12 w-12 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 ${className}`}
        size="default"
      >
        <FaWhatsapp className="h-5 w-5" />
      </Button>
    );
  }

  // Variantes normales (para usar en sidebars, etc.)
  return (
    <Button
      onClick={handleWhatsAppClick}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 border-green-600 text-green-600 hover:bg-green-50 dark:border-green-500 dark:text-green-500 dark:hover:bg-green-900/20 transition-colors ${className}`}
    >
      {isLoading ? (
        <MessageSquare className="h-4 w-4 animate-pulse" />
      ) : (
        <FaWhatsapp className="h-4 w-4" />
      )}
      <span className="font-medium">
        {isLoading ? "Abriendo..." : "Ayuda por WhatsApp"}
      </span>
    </Button>
  );
}