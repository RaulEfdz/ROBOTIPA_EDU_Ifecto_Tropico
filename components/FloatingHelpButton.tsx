"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
const FloatingHelpButton: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const appName = process.env.NEXT_PUBLIC_NAME_APP || "la aplicación";
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER || "";

  const handleSend = () => {
    if (!message.trim()) {
      toast.error("El mensaje no puede estar vacío.");
      return;
    }
    if (!whatsappNumber) {
      toast.error("Número de soporte de WhatsApp no configurado.");
      return;
    }

    setIsSending(true);

    const text = `Hola equipo de ${appName}, necesito ayuda con lo siguiente:%0A${encodeURIComponent(
      message.trim()
    )}`;

    const url = `https://wa.me/${whatsappNumber}?text=${text}`;

    toast("Mensaje preparado. Redirigiendo a WhatsApp...");

    // Redirect to WhatsApp after a short delay to allow toast to show
    setTimeout(() => {
      window.open(url, "_blank");
      setIsSending(false);
    }, 500);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          aria-label="Botón de asistencia"
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          title="¿Necesitas ayuda?"
          type="button"
        >
          💬
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Necesitas ayuda?</DialogTitle>
        </DialogHeader>
        <div className="mt-2">
          <textarea
            className="w-full min-h-[120px] rounded-md border border-gray-300 p-2 text-sm resize-y focus:border-green-600 focus:ring-1 focus:ring-green-600"
            placeholder="Escribe tu mensaje aquí..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            aria-label="Mensaje de ayuda"
            rows={5}
          />
        </div>
        <DialogFooter className="mt-4 space-x-2">
          <Button
            variant="secondary"
            type="button"
            onClick={() => setMessage("")}
            disabled={isSending}
          >
            Limpiar
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={isSending || !message.trim()}
          >
            Enviar a WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FloatingHelpButton;
