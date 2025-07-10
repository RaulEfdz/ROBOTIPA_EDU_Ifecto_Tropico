"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface YappyOfficialButtonProps {
  courseId: string;
  amount: number;
  courseName: string;
  disabled?: boolean;
  className?: string;
  theme?: "blue" | "darkBlue" | "orange" | "dark" | "sky" | "light";
  rounded?: boolean;
}

declare global {
  interface Window {
    YappyButton?: any;
  }
}

export default function YappyOfficialButton({
  courseId,
  amount,
  courseName,
  disabled = false,
  className,
  theme = "blue",
  rounded = true,
}: YappyOfficialButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isYappyOnline, setIsYappyOnline] = useState(true);
  const [isYappyLoaded, setIsYappyLoaded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cargar el CDN de Yappy
    const loadYappyScript = () => {
      // Usar configuración de ambiente Yappy específica
      const yappyEnvironment =
        process.env.NEXT_PUBLIC_YAPPY_ENVIRONMENT || "test";
      const cdnUrl =
        yappyEnvironment === "prod"
          ? "https://bt-cdn.yappy.cloud/v1/cdn/web-component-btn-yappy.js"
          : "https://bt-cdn-uat.yappycloud.com/v1/cdn/web-component-btn-yappy.js";

      const script = document.createElement("script");
      script.type = "module";
      script.src = cdnUrl;
      script.onload = () => {
        console.log("Yappy script loaded successfully");
        setIsYappyLoaded(true);
        setupYappyButton();
      };
      script.onerror = () => {
        console.error("Error loading Yappy script");
        toast.error("Error cargando el botón de Yappy");
      };

      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    };

    const setupYappyButton = () => {
      if (!buttonRef.current) return;

      // Crear el elemento btn-yappy
      const yappyElement = document.createElement("btn-yappy");
      yappyElement.setAttribute("theme", theme);
      if (rounded) {
        yappyElement.setAttribute("rounded", "true");
      }

      // Limpiar contenedor y agregar botón
      buttonRef.current.innerHTML = "";
      buttonRef.current.appendChild(yappyElement);

      // Configurar event listeners
      const setupEventListeners = () => {
        yappyElement.addEventListener("eventSuccess", (event: any) => {
          console.log("Transacción ejecutada:", event.detail);
          toast.success("¡Pago completado exitosamente!");
          setIsLoading(false);

          // Redirigir al curso después de 2 segundos
          setTimeout(() => {
            window.location.href = `/courses/${courseId}`;
          }, 2000);
        });

        yappyElement.addEventListener("eventError", (event: any) => {
          console.log("Transacción fallida:", event.detail);
          toast.error("Error en el pago. Por favor, intenta nuevamente.");
          setIsLoading(false);
        });

        yappyElement.addEventListener("eventClick", async () => {
          console.log("Yappy button clicked");
          setIsLoading(true);

          try {
            const response = await fetch("/api/payments/yappy/create-order", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                courseId,
                amount,
                description: `Curso: ${courseName}`,
              }),
            });

            const result = await response.json();

            console.log("Create order response:", {
              status: response.status,
              ok: response.ok,
              result,
            });

            if (response.ok && result.success && result.body) {
              const params = {
                transactionId: result.body.transactionId,
                documentName: result.body.documentName,
                token: result.body.token,
              };

              console.log("Calling eventPayment with params:", params);
              (yappyElement as any).eventPayment(params);
            } else {
              const errorMsg =
                result.error ||
                `Error HTTP ${response.status}: Error creando la orden`;
              console.error("Order creation failed:", {
                response: response.status,
                result,
              });
              throw new Error(errorMsg);
            }
          } catch (error) {
            console.error("Error:", error);
            toast.error(
              error instanceof Error
                ? error.message
                : "Error procesando el pago"
            );
            setIsLoading(false);
          }
        });

        yappyElement.addEventListener("isYappyOnline", (event: any) => {
          const isOnline = event.detail === true;
          setIsYappyOnline(isOnline);
          console.log("Yappy online status:", isOnline);

          if (!isOnline) {
            toast.warning(
              "El servicio de Yappy no está disponible en este momento"
            );
          }
        });
      };

      // Configurar listeners después de un pequeño delay para asegurar que el elemento esté listo
      setTimeout(setupEventListeners, 100);
    };

    if (!isYappyLoaded) {
      loadYappyScript();
    } else {
      setupYappyButton();
    }
  }, [courseId, amount, courseName, theme, rounded, isYappyLoaded]);

  // Fallback button si Yappy no está disponible
  if (!isYappyLoaded || !isYappyOnline) {
    return (
      <Button
        disabled={true}
        variant="outline"
        className={`border-gray-400 text-gray-400 cursor-not-allowed ${className}`}
      >
        {!isYappyLoaded ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Cargando Yappy...
          </>
        ) : (
          "Yappy no disponible"
        )}
      </Button>
    );
  }

  return (
    <div className={`yappy-button-container ${className}`}>
      <div ref={buttonRef} className="w-full">
        {/* El botón de Yappy se insertará aquí */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        )}
      </div>
    </div>
  );
}
