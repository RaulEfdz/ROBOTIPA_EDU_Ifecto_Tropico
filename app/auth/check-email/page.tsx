"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CheckEmailPage() {
  const router = useRouter();

  useEffect(() => {
    // Optionally, you can add a timer to redirect or refresh
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">
        Confirma tu correo electrónico
      </h1>
      <p className="text-center max-w-md">
        Hemos enviado un correo electrónico a tu dirección. Por favor, revisa tu
        bandeja de entrada y sigue el enlace para confirmar tu cuenta y
        completar el registro.
      </p>
      <p className="text-center max-w-md mt-4">
        Si no recibiste el correo, revisa tu carpeta de spam o solicita que te
        enviemos otro correo.
      </p>
    </div>
  );
}
