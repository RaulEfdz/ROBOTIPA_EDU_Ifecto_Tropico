// ConfirmActionClient.tsx
'use client';

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

const ConfirmActionClient = () => {
  const searchParams = useSearchParams();
  const confirmationUrl = searchParams.get("confirmation_url");

  useEffect(() => {
    if (confirmationUrl) {
      window.location.href = confirmationUrl;
    }
  }, [confirmationUrl]);

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-TextCustom p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">Redirigiendo...</h2>
        <p className="text-gray-600">Estamos verificando tu solicitud, por favor espera un momento.</p>
      </div>
    </div>
  );
};

export default ConfirmActionClient;
