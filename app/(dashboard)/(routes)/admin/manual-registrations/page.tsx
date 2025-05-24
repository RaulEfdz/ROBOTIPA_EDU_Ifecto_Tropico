"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import {
  getCurrentUserFromDB,
  UserDB,
} from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { useRouter } from "next/navigation";

import { PermissionGuard } from "./components/PermissionGuard";
import { ParseRequestForm } from "./components/ParseRequestForm";
import { VerifiedDataCard } from "./components/VerifiedDataCard";
import { ConfirmRegistrationDialog } from "./components/ConfirmRegistrationDialog";
import { ParsedData } from "./components/export interface ParsedData {";

export default function ManualRegistrationsPage() {
  const [requestCode, setRequestCode] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [processingUser, setProcessingUser] = useState<UserDB | null>(null);
  const [errorModal, setErrorModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    details?: string;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const user = await getCurrentUserFromDB();
        if (!user) {
          toast.error(
            "No se pudo identificar al usuario procesador. Intenta recargar la página."
          );
          return;
        }
        setProcessingUser(user);
      } catch (e) {
        toast.error("Error obteniendo datos del usuario procesador.");
        console.error(e);
      }
    }
    fetchUser();
  }, []);

  const handleParsedData = useCallback((data: ParsedData) => {
    setParsedData(data);
  }, []);

  const handleProceed = useCallback(() => {
    if (parsedData) setShowDialog(true);
  }, [parsedData]);

  const handleConfirm = async () => {
    if (!parsedData || !processingUser) {
      setErrorModal({
        open: true,
        title: "Error de datos",
        message:
          "Faltan datos para la confirmación o el usuario procesador no está identificado.",
      });
      return;
    }
    setIsConfirming(true);
    try {
      const res = await fetch("/api/admin/manual-access/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: parsedData.courseId,
          userId: parsedData.userId,
          date: parsedData.date,
          processedByUserId: processingUser.id,
          processedByUserEmail: processingUser.email,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        // Mostrar modal para errores críticos, toast largo para otros
        const errorMsg = result.error || "Error al confirmar el registro.";
        const errorDetails = result.details || "";
        if ([403, 500].includes(res.status)) {
          setErrorModal({
            open: true,
            title: `Error ${res.status}`,
            message: errorMsg,
            details: errorDetails,
          });
        } else {
          toast.error(
            <>
              <div>
                <strong>{errorMsg}</strong>
                {errorDetails && (
                  <div style={{ marginTop: 8, fontSize: 13, color: "#888" }}>
                    {errorDetails}
                  </div>
                )}
              </div>
            </>,
            { duration: 10000 }
          );
        }
        throw new Error(errorMsg + (errorDetails ? ` - ${errorDetails}` : ""));
      }
      toast.success(
        result.message || "Registro manual completado exitosamente."
      );
      setShowDialog(false);
      setParsedData(null);
      setRequestCode("");
    } catch (error) {
      // Ya se maneja arriba, solo log
      console.error(error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <PermissionGuard>
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
              Registro Manual de Cursos
            </CardTitle>
            <CardDescription className="mt-2 text-slate-600 dark:text-slate-400">
              Ingresa el ID de solicitud proporcionado por el alumno o vendedor
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <ParseRequestForm
              requestCodeValue={requestCode}
              onRequestCodeChange={setRequestCode}
              onParsed={handleParsedData}
            />

            {parsedData && (
              <VerifiedDataCard data={parsedData} onProceed={handleProceed} />
            )}
          </CardContent>
        </Card>

        {parsedData && (
          <ConfirmRegistrationDialog
            open={showDialog}
            onClose={() => setShowDialog(false)}
            onConfirm={handleConfirm}
            loading={isConfirming}
            data={parsedData}
          />
        )}

        {/* Modal de error crítico */}
        {errorModal?.open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            style={{ backdropFilter: "blur(2px)" }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full">
              <h2 className="text-xl font-bold text-red-600 mb-2">
                {errorModal.title}
              </h2>
              <div className="mb-2">{errorModal.message}</div>
              {errorModal.details && (
                <div className="text-xs text-gray-500 border-t pt-2">
                  {errorModal.details}
                </div>
              )}
              <button
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={() => setErrorModal(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        )}
      </div>
    </PermissionGuard>
  );
}
