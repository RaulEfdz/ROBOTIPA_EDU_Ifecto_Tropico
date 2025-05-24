// app/auth/SignUp/confirm-action/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { Logo } from "@/utils/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function ConfirmActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [message, setMessage] = useState("Confirmando tu cuenta...");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const nextUrl = searchParams.get("next");

    const handleAuthConfirmation = async () => {
      // El SDK de Supabase maneja el token de la URL automáticamente al cargar.
      // Solo necesitamos verificar el estado de la sesión después.
      // Damos un pequeño tiempo para que el SDK procese el token.
      await new Promise((resolve) => setTimeout(resolve, 500));

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error(
          "Error al obtener sesión post-confirmación:",
          sessionError
        );
        setMessage(
          "Hubo un problema al verificar tu sesión. Por favor, intenta iniciar sesión manualmente."
        );
        setIsError(true);
        toast.error("Error al verificar sesión.");
        return;
      }

      if (session) {
        setMessage("¡Correo confirmado exitosamente! Redirigiendo...");
        toast.success("¡Correo confirmado!");

        // Sincronizar con la base de datos local después de la confirmación
        try {
          await fetch("/api/auth/insertUser", { method: "POST" });
        } catch (syncError) {
          console.error(
            "Error sincronizando usuario con DB local tras confirmación:",
            syncError
          );
          toast.warning(
            "No se pudo sincronizar tu cuenta localmente, pero tu correo está confirmado.",
            { duration: 6000 }
          );
        }

        const finalRedirectUrl =
          nextUrl && nextUrl.startsWith("/") ? nextUrl : "/catalog";

        router.push(finalRedirectUrl);
        setTimeout(() => router.refresh(), 100);
      } else {
        // Esto podría pasar si el token es inválido, expiró, o el usuario ya estaba logueado con otra cuenta.
        setMessage(
          "No se pudo confirmar tu correo. El enlace podría haber expirado o ya fue utilizado. Por favor, intenta iniciar sesión o registrarte de nuevo si es necesario."
        );
        setIsError(true);
        toast.error("El enlace de confirmación no es válido o ha expirado.");
      }
    };

    // Comprobar si hay un error explícito en los parámetros de la URL (Supabase a veces lo añade)
    const errorDescription = searchParams.get("error_description");
    if (errorDescription) {
      setMessage(decodeURIComponent(errorDescription));
      setIsError(true);
      toast.error(decodeURIComponent(errorDescription));
    } else {
      handleAuthConfirmation();
    }
  }, [router, searchParams, supabase]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primaryCustom2/80 via-primaryCustom2 to-primaryCustom2/90 p-4 text-center">
      <div className="bg-PanelCustom p-8 sm:p-12 rounded-xl shadow-2xl max-w-lg w-full">
        <div className="mx-auto mb-8">
          <Logo version="light" width={120} height={60} />
        </div>
        <h1
          className={`text-2xl sm:text-3xl font-bold mb-6 ${
            isError ? "text-red-500" : "text-primaryCustom2"
          }`}
        >
          {isError ? "Error en la Confirmación" : "Procesando Confirmación"}
        </h1>
        <p className="text-primaryCustom mb-8 text-base sm:text-lg">
          {message}
        </p>
        {!isError && (
          <div className="mt-6 animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primaryCustom2 mx-auto"></div>
        )}
        {isError && (
          <Button asChild className="mt-8 w-full sm:w-auto">
            <Link href="/auth">Ir a Iniciar Sesión</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primaryCustom2"></div>
        </div>
      }
    >
      <ConfirmActionContent />
    </Suspense>
  );
}
