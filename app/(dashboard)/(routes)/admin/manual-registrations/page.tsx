"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  XCircle,
  User,
  BookOpen,
  CalendarDays,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB"; // Para obtener usuario en cliente
import { UserDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB"; // Tipo UserDB
import { useRouter } from "next/navigation";

interface ParsedData {
  courseId: string;
  userId: string;
  date: string; // YYYY-MM-DD
  courseTitle?: string;
  userName?: string;
  userEmail?: string;
}

const ManualRegistrationsPage = () => {
  const [requestCode, setRequestCode] = useState("");
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [processingUser, setProcessingUser] = useState<UserDB | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null); // null = cargando, true = tiene, false = no tiene
  const router = useRouter();

  useEffect(() => {
    const checkPermissionsAndUser = async () => {
      try {
        const user = await getCurrentUserFromDB();
        if (!user) {
          toast.error("Debes iniciar sesión para acceder a esta página.");
          router.push(
            "/auth?redirectUrl=" + encodeURIComponent(window.location.pathname)
          );
          setHasPermission(false); // Marcar como sin permiso si no hay usuario
          return;
        }
        setProcessingUser(user);

        const adminRoleId = process.env.NEXT_PUBLIC_ADMIN_ID;
        const teacherRoleId = process.env.NEXT_PUBLIC_TEACHER_ID;
        const permitted =
          user.customRole === adminRoleId || user.customRole === teacherRoleId;
        setHasPermission(permitted);

        if (!permitted) {
          toast.error("Acceso denegado. No tienes permisos para esta sección.");
          router.push("/dashboard");
        }
      } catch (e) {
        toast.error("Error verificando permisos. Serás redirigido.");
        setHasPermission(false);
        router.push("/dashboard");
      }
    };
    checkPermissionsAndUser();
  }, [router]); // router como dependencia

  const handleParseRequest = async () => {
    if (!requestCode.trim()) {
      setError("El ID de solicitud no puede estar vacío.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setParsedData(null);

    try {
      const response = await fetch("/api/admin/manual-access/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: requestCode }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el ID.");
      }
      setParsedData(data);
      toast.success("ID procesado correctamente. Verifica los datos.");
    } catch (err: any) {
      setError(err.message);
      setParsedData(null);
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmRegistration = async () => {
    if (!parsedData || !processingUser) {
      toast.error(
        "Faltan datos para la confirmación o el usuario procesador no está identificado."
      );
      return;
    }
    setIsConfirming(true);
    try {
      const response = await fetch("/api/admin/manual-access/confirm", {
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
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Error al confirmar el registro.");
      }
      toast.success(
        result.message || "Registro manual completado exitosamente."
      );
      setShowConfirmModal(false);
      setParsedData(null);
      setRequestCode("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsConfirming(false);
    }
  };

  if (hasPermission === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-slate-500 mb-4" />
        <p className="text-lg text-slate-600">
          Verificando acceso y cargando módulo...
        </p>
      </div>
    );
  }
  // Si hasPermission es false, ya se habrá redirigido, pero podemos mostrar un mensaje por si acaso.
  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-red-50">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-semibold text-red-700 mb-2">
          Acceso Denegado
        </h1>
        <p className="text-red-600">
          No tienes los permisos necesarios para ver esta página.
        </p>
        <Button onClick={() => router.push("/dashboard")} className="mt-6">
          Volver al Tablero
        </Button>
      </div>
    );
  }

  // Si tiene permiso, renderiza la página
  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto shadow-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <CardHeader className="border-b dark:border-slate-700">
          <CardTitle className="text-2xl font-bold text-center text-slate-800 dark:text-slate-100">
            Módulo de Registro Manual de Cursos
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground dark:text-slate-400">
            Ingresa el ID de solicitud proporcionado por el alumno/vendedor.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-2">
            <label
              htmlFor="requestCode"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              ID de Solicitud Completo
            </label>
            <div className="flex gap-2">
              <Input
                id="requestCode"
                type="text"
                value={requestCode}
                onChange={(e) => setRequestCode(e.target.value)}
                placeholder={`Ej: cursoId${process.env.NEXT_PUBLIC_MANUAL_ACCESS_ID_SEPARATOR || "|"}userId${process.env.NEXT_PUBLIC_MANUAL_ACCESS_ID_SEPARATOR || "|"}YYYYMMDD`}
                className="flex-grow dark:bg-slate-700 dark:text-slate-50 dark:border-slate-600"
                onKeyPress={(e) => e.key === "Enter" && handleParseRequest()}
              />
              <Button
                onClick={handleParseRequest}
                disabled={isLoading || !requestCode.trim()}
                className="bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Verificar ID
              </Button>
            </div>
          </div>

          {error && (
            <Alert
              variant="destructive"
              className="dark:bg-red-900/20 dark:border-red-700 dark:text-red-300"
            >
              <XCircle className="h-4 w-4" />
              <AlertTitle>Error de Validación</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {parsedData && (
            <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-5 w-5" /> Datos Verificados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground dark:text-slate-500" />
                  <strong>Usuario:</strong>{" "}
                  {parsedData.userName || parsedData.userId}{" "}
                  {parsedData.userEmail && `(${parsedData.userEmail})`}
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground dark:text-slate-500" />
                  <strong>Curso:</strong>{" "}
                  {parsedData.courseTitle || parsedData.courseId}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-muted-foreground dark:text-slate-500" />
                  <strong>Fecha de Suscripción (Manual):</strong>{" "}
                  {parsedData.date}
                </div>
              </CardContent>
              <CardFooter className="pt-3">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                  onClick={() => setShowConfirmModal(true)}
                >
                  Proceder con el Registro{" "}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          )}
        </CardContent>
      </Card>

      {parsedData && (
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent className="dark:bg-slate-800 dark:border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-6 w-6" /> Confirmar Registro Manual
              </DialogTitle>
              <DialogDescription className="dark:text-slate-400">
                Estás a punto de otorgar acceso manualmente. Esta acción es
                irreversible y creará/actualizará un registro de compra.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p>
                <strong>Usuario:</strong>{" "}
                {parsedData.userName || parsedData.userId}
              </p>
              <p>
                <strong>Curso:</strong>{" "}
                {parsedData.courseTitle || parsedData.courseId}
              </p>
              <p>
                <strong>Fecha de Activación:</strong> {parsedData.date}
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  disabled={isConfirming}
                  className="dark:border-slate-600 dark:hover:bg-slate-700"
                >
                  Cancelar
                </Button>
              </DialogClose>
              <Button
                onClick={handleConfirmRegistration}
                disabled={isConfirming}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
              >
                {isConfirming ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Confirmar y Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManualRegistrationsPage;
