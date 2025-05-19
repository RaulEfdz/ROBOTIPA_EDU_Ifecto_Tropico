"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
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
import { CertificateGenerator } from "@/components/CertificateGenerator";
import DefaultCertificateTemplate from "@/templates/certificates/DefaultCertificateTemplate";

const ManageCertificatesPage = () => {
  const [userIdInput, setUserIdInput] = useState("");
  const [courseIdInput, setCourseIdInput] = useState("");
  const [isLoadingReissue, setIsLoadingReissue] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [certPreview, setCertPreview] = useState<{
    templateProps: any;
  } | null>(null);
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
    setIsLoadingReissue(true);
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
      setIsLoadingReissue(false);
    }
  };

  const handlePreviewCertificate = async () => {
    if (!userIdInput.trim() || !courseIdInput.trim()) {
      toast.error("Por favor, ingresa el ID de Usuario y el ID de Curso.");
      return;
    }
    setIsLoadingPreview(true);
    try {
      // Suponiendo que el endpoint devuelve todos los datos necesarios para la plantilla
      const response = await fetch("/api/admin/certificates/reissue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userIdInput.trim(),
          courseId: courseIdInput.trim(),
          preview: true, // Indica que solo queremos los datos, no guardar
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Error al obtener el certificado.");
      }
      // Mapear los datos de la API a los props requeridos por DefaultCertificateTemplate
      setCertPreview({
        templateProps: {
          studentName: result.name || "Estudiante",
          courseName: result.courseName || "Curso",
          issueDate: result.issueDate || new Date().toLocaleDateString(),
          certificateCode: result.code || "CERT-PRUEBA",
          backgroundImageUrl:
            result.backgroundImageUrl ||
            "/public/Certificado-de-Participación-Animales.png",
          qrCodeDataUrl: result.qrCodeDataUrl || undefined,
        },
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoadingPreview(false);
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
    <TooltipProvider>
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
              <label
                htmlFor="userIdInput"
                className="block text-sm font-medium"
              >
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
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    onClick={handleReissueCertificate}
                    disabled={isLoadingReissue || isLoadingPreview}
                    className="w-full bg-sky-600 hover:bg-sky-700"
                  >
                    {isLoadingReissue ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RotateCcw className="mr-2 h-4 w-4" />
                    )}
                    Generar/Reemitir Oficialmente
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Genera o reemite el certificado de forma oficial y lo guarda en
                la base de datos. Usa esta opción para emitir certificados
                válidos para el usuario y curso indicados.
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    onClick={handlePreviewCertificate}
                    className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    disabled={isLoadingPreview || isLoadingReissue}
                  >
                    {isLoadingPreview ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Previsualizar/Descargar Borrador
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Muestra una previsualización del certificado sin guardarlo
                oficialmente. Útil para revisar el diseño o descargar un
                borrador antes de emitirlo oficialmente.
              </TooltipContent>
            </Tooltip>
            {certPreview && (
              <div className="mt-6">
                <CertificateGenerator
                  certRef={React.createRef()}
                  templateComponent={DefaultCertificateTemplate}
                  templateProps={certPreview.templateProps}
                />
              </div>
            )}
            <Button
              onClick={() => router.push("/admin/certificates")}
              className="w-full mt-4"
            >
              ver
            </Button>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

export default ManageCertificatesPage;
