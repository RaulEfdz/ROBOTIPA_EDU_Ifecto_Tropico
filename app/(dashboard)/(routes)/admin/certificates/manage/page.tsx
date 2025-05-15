"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, RotateCcw, ShieldAlert, Info } from "lucide-react";
import {
  getCurrentUserFromDB,
  UserDB,
} from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ManageCertificatesPage = () => {
  const [userIdInput, setUserIdInput] = useState("");
  const [courseIdInput, setCourseIdInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const user = await getCurrentUserFromDB();
        if (!user) {
          toast.error("Debes iniciar sesión para acceder.");
          router.push(
            "/auth?redirectUrl=" + encodeURIComponent(window.location.pathname)
          );
          setHasPermission(false);
          return;
        }
        const adminRoleId = process.env.NEXT_PUBLIC_ADMIN_ID;
        const teacherRoleId = process.env.NEXT_PUBLIC_TEACHER_ID;
        const permitted =
          user.customRole === adminRoleId || user.customRole === teacherRoleId;
        setHasPermission(permitted);
        if (!permitted) {
          toast.error("Acceso denegado.");
          router.push("/dashboard");
        }
      } catch (e) {
        toast.error("Error verificando permisos.");
        setHasPermission(false);
        router.push("/dashboard");
      }
    };
    checkPermissions();
  }, [router]);

  const handleReissueCertificate = async () => {
    if (!userIdInput.trim() || !courseIdInput.trim()) {
      toast.error("Por favor, ingresa el ID de Usuario y el ID de Curso.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/certificates/reissue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userIdInput.trim(),
          courseId: courseIdInput.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Error al reemitir el certificado.");
      }
      toast.success(
        result.message || "Certificado reemitido/generado exitosamente."
      );
      setUserIdInput("");
      setCourseIdInput("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (hasPermission === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-slate-500 mb-4" />
        <p className="text-lg text-slate-600">Verificando acceso...</p>
      </div>
    );
  }
  if (hasPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-red-50">
        <ShieldAlert className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-2xl font-semibold text-red-700 mb-2">
          Acceso Denegado
        </h1>
        <Button onClick={() => router.push("/dashboard")} className="mt-6">
          Volver al Tablero
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-lg mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Gestionar/Reemitir Certificados
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Ingresa los datos para generar o reemitir un certificado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Información Importante</AlertTitle>
            <AlertDescription>
              Si el certificado ya existe para el usuario y curso, se
              actualizará la fecha de emisión (y opcionalmente el código y
              plantilla). Si no existe, se generará uno nuevo.
            </AlertDescription>
          </Alert>
          <div className="space-y-2">
            <label htmlFor="userIdInput" className="block text-sm font-medium">
              ID del Usuario
            </label>
            <Input
              id="userIdInput"
              type="text"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
              placeholder="Ingresa el ID del usuario"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="courseIdInput"
              className="block text-sm font-medium"
            >
              ID del Curso
            </label>
            <Input
              id="courseIdInput"
              type="text"
              value={courseIdInput}
              onChange={(e) => setCourseIdInput(e.target.value)}
              placeholder="Ingresa el ID del curso"
            />
          </div>
          <Button
            onClick={handleReissueCertificate}
            disabled={isLoading}
            className="w-full bg-sky-600 hover:bg-sky-700"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 h-4 w-4" />
            )}
            Generar / Reemitir Certificado
          </Button>
          <Button
            onClick={() => router.push("/admin/certificates")}
            className="w-full mt-4"
          >
            ver
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageCertificatesPage;
