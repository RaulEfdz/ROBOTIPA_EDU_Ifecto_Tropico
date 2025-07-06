"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { trackClick, initializeAnonymousTrackingId } from "@/lib/tracking";

const FloatingHelpButton: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize anonymous tracking ID on component mount
  React.useEffect(() => {
    initializeAnonymousTrackingId();
  }, []);

  const appName = process.env.NEXT_PUBLIC_NAME_APP || "la aplicación";
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_SUPPORT_NUMBER || "";

  // Auto-focus textarea when dialog opens
  useEffect(() => {
    const dialog = textareaRef.current?.closest("[role='dialog']");
    if (dialog) textareaRef.current?.focus();
  }, []);

  const handleSend = () => {
    if (!message.trim()) return toast.error("El mensaje no puede estar vacío.");
    if (!whatsappNumber)
      return toast.error("Soporte de WhatsApp no configurado.");

    // Track the send button click event
    trackClick("BotonDeAyuda_MensajeAyuda_Enviado", {
      messageLength: message.length,
    });

    setIsSending(true);
    const text = `Hola equipo de ${appName}, necesito ayuda con lo siguiente:%0A${encodeURIComponent(
      message.trim()
    )}`;
    const url = `https://wa.me/${whatsappNumber}?text=${text}`;

    toast.success("Mensaje listo. Abriendo WhatsApp...");
    setTimeout(() => {
      window.open(url, "_blank");
      setIsSending(false);
      setMessage("");
    }, 600);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.button
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Botón de asistencia"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 w-14 rounded-full bg-primary-600 text-white shadow-xl hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300"
          type="button"
          onClick={() => {
            trackClick("BotonAyuda_AbrirDialogo");
          }}
        >
          <MessageCircle className="h-6 w-6" />
        </motion.button>
      </DialogTrigger>

      <DialogContent className="max-w-sm p-6">
        <DialogHeader>
          <DialogTitle>¿Necesitas ayuda?</DialogTitle>
        </DialogHeader>

        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe tu consulta..."
          disabled={isSending}
          className="w-full h-32 resize-none border border-gray-300 focus:border-primary-600 focus:ring-1 focus:ring-primary-600"
          aria-label="Mensaje de ayuda"
        />

        <DialogFooter className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              trackClick("BotonDeAyuda_MensajeAyuda_Limpiar");
              setMessage("");
            }}
            disabled={isSending}
          >
            Limpiar
          </Button>
          <Button onClick={handleSend} disabled={isSending || !message.trim()}>
            {isSending ? "Enviando..." : "Enviar a WhatsApp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FloatingHelpButton;
