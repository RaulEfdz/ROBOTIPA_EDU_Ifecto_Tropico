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
import { ManualAssignmentTable } from "./components/ManualAssignmentTable";

export default function ManualRegistrationsPage() {
  const [requestCode, setRequestCode] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showIdModal, setShowIdModal] = useState(false);
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
          toast.error("No se pudo identificar al usuario procesador.");
          return;
        }
        setProcessingUser(user);
      } catch (e) {
        toast.error("Error obteniendo datos del usuario.");
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
        message: "Faltan datos para la confirmación.",
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
        const errorMsg = result.error || "Error al confirmar.";
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
              <strong>{errorMsg}</strong>
              {errorDetails && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {errorDetails}
                </div>
              )}
            </>,
            { duration: 10000 }
          );
        }
        throw new Error(errorMsg);
      }

      toast.success(result.message || "Registro completado exitosamente.");
      setShowDialog(false);
      setParsedData(null);
      setRequestCode("");
      setShowIdModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <PermissionGuard>
      <div className="flex flex-col w-full max-w-7xl mx-auto p-4 space-y-6">
        {/* Header con título y botón */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white">
              Asignación Manual de Acceso a Cursos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Selecciona un curso para asignarlo manualmente a un usuario
            </p>
          </div>
          <button
            onClick={() => setShowIdModal(true)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded text-sm"
          >
            Registrar por ID manualmente
          </button>
        </div>

        {/* Tabla principal */}
        <ManualAssignmentTable />

        {/* Modal por ID */}
        {showIdModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-lg p-6 relative">
              <button
                onClick={() => {
                  setShowIdModal(false);
                  setParsedData(null);
                  setRequestCode("");
                }}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>

              <CardHeader className="text-center mb-4">
                <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                  Registro por ID de Curso
                </CardTitle>
                <CardDescription>
                  Ingresa el ID proporcionado por el alumno o vendedor
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ParseRequestForm
                  requestCodeValue={requestCode}
                  onRequestCodeChange={setRequestCode}
                  onParsed={handleParsedData}
                />

                {parsedData && (
                  <VerifiedDataCard
                    data={parsedData}
                    onProceed={handleProceed}
                  />
                )}
              </CardContent>
            </div>
          </div>
        )}

        {/* Confirmación */}
        {parsedData && (
          <ConfirmRegistrationDialog
            open={showDialog}
            onClose={() => setShowDialog(false)}
            onConfirm={handleConfirm}
            loading={isConfirming}
            data={parsedData}
          />
        )}

        {/* Error modal */}
        {errorModal?.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
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
