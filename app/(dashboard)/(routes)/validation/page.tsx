"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, FileText, Clock, CheckCircle, XCircle, Upload, History, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { ValidationStepper } from "./_components/ValidationStepper";
import { PDFUpload } from "./_components/PDFUpload";
import { ValidationHistory } from "./_components/ValidationHistory";

interface DocumentValidation {
  id: string;
  status: "NO_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  uploadedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  reviewer?: {
    id: string;
    fullName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const getStatusInfo = (status: string) => {
  switch (status) {
    case "NO_SUBMITTED":
      return {
        title: "Sin documento",
        description: "Sube tu documento de acreditación para iniciar el proceso",
        icon: Upload,
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        badge: "secondary"
      };
    case "PENDING":
      return {
        title: "En revisión",
        description: "Tu documento está siendo revisado por nuestro equipo",
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        badge: "default"
      };
    case "APPROVED":
      return {
        title: "Aprobado",
        description: "¡Tu documento ha sido aprobado! Ya puedes acceder a todos los cursos",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
        badge: "default"
      };
    case "REJECTED":
      return {
        title: "Rechazado",
        description: "Tu documento fue rechazado. Por favor, revisa los comentarios y vuelve a enviarlo",
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
        badge: "destructive"
      };
    default:
      return {
        title: "Estado desconocido",
        description: "",
        icon: AlertCircle,
        color: "text-gray-500",
        bgColor: "bg-gray-100",
        badge: "secondary"
      };
  }
};

export default function ValidationPage() {
  const router = useRouter();
  const [validation, setValidation] = useState<DocumentValidation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const fetchValidationStatus = async () => {
    try {
      const response = await fetch("/api/validation/status");
      if (!response.ok) {
        throw new Error("Failed to fetch validation status");
      }
      const data = await response.json();
      setValidation(data);
    } catch (error) {
      console.error("Error fetching validation status:", error);
      toast.error("Error al cargar el estado de validación");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidationStatus();
  }, []);

  const handleUploadSuccess = (fileData: { fileName: string; fileUrl: string; fileSize: number }) => {
    toast.success("Documento subido exitosamente");
    // Actualizar el estado local inmediatamente
    setValidation(prev => prev ? {
      ...prev,
      status: "PENDING",
      fileName: fileData.fileName,
      fileUrl: fileData.fileUrl,
      fileSize: fileData.fileSize,
      uploadedAt: new Date().toISOString(),
    } : null);
  };

  const statusInfo = validation ? getStatusInfo(validation.status) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p>Cargando estado de validación...</p>
        </div>
      </div>
    );
  }

  if (!validation) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Error</CardTitle>
            <CardDescription className="text-center">
              No se pudo cargar el estado de validación
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={fetchValidationStatus}>
              Intentar nuevamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Validación de Documentos</h1>
          <p className="text-muted-foreground">
            Completa el proceso de validación para acceder a todos los cursos
          </p>
        </div>

        {/* Stepper */}
        <ValidationStepper currentStatus={validation.status} />

        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {statusInfo && (
                  <div className={`p-3 rounded-full ${statusInfo.bgColor}`}>
                    <statusInfo.icon className={`h-6 w-6 ${statusInfo.color}`} />
                  </div>
                )}
                <div>
                  <CardTitle>{statusInfo?.title}</CardTitle>
                  <CardDescription>{statusInfo?.description}</CardDescription>
                </div>
              </div>
              <Badge variant={statusInfo?.badge as any}>
                {validation.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Información del documento actual */}
            {validation.fileName && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">Documento actual:</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Archivo:</strong> {validation.fileName}</p>
                  <p><strong>Tamaño:</strong> {validation.fileSize ? `${(validation.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</p>
                  {validation.uploadedAt && (
                    <p><strong>Subido:</strong> {new Date(validation.uploadedAt).toLocaleDateString()}</p>
                  )}
                  {validation.reviewedAt && validation.reviewer && (
                    <p><strong>Revisado por:</strong> {validation.reviewer.fullName} el {new Date(validation.reviewedAt).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            )}

            {/* Mensaje de rechazo */}
            {validation.status === "REJECTED" && validation.rejectionReason && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Motivo del rechazo:</strong> {validation.rejectionReason}
                </AlertDescription>
              </Alert>
            )}

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-3">
              {(validation.status === "NO_SUBMITTED" || validation.status === "REJECTED") && (
                <PDFUpload onUploadSuccess={handleUploadSuccess} />
              )}

              {validation.status === "APPROVED" && (
                <Button onClick={() => router.push("/courses/catalog")} className="w-full sm:w-auto">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Explorar Cursos
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setShowHistory(!showHistory)}
                className="w-full sm:w-auto"
              >
                <History className="h-4 w-4 mr-2" />
                {showHistory ? "Ocultar Historial" : "Ver Historial"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Historial */}
        {showHistory && (
          <ValidationHistory validationId={validation.id} />
        )}

        {/* Información adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Información Importante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Requisitos del documento:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Formato PDF únicamente</li>
                  <li>• Tamaño máximo: 8MB</li>
                  <li>• Documento de identidad o acreditación profesional</li>
                  <li>• Legible y en buena calidad</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Proceso de revisión:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Tiempo de revisión: 1-3 días hábiles</li>
                  <li>• Recibirás notificación por email</li>
                  <li>• Puedes subir un nuevo documento si es rechazado</li>
                  <li>• El acceso a cursos está bloqueado hasta la aprobación</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}