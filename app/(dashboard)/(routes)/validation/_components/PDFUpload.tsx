"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Upload, FileText, Loader2, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { UploadDropzone } from "@/lib/uploadthing";

interface PDFUploadProps {
  onUploadSuccess: (fileData: { fileName: string; fileUrl: string; fileSize: number }) => void;
}

export function PDFUpload({ onUploadSuccess }: PDFUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUploadComplete = async (files: any[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      
      try {
        // Llamar a la API para procesar el documento subido
        const response = await fetch("/api/validation/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            fileUrl: file.url,
            fileSize: file.size,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to process uploaded document");
        }

        const data = await response.json();
        
        onUploadSuccess({
          fileName: file.name,
          fileUrl: file.url,
          fileSize: file.size,
        });

        toast.success("Documento subido y procesado exitosamente");
      } catch (error) {
        console.error("Error processing upload:", error);
        toast.error("Error al procesar el documento subido");
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
    toast.error(`Error al subir el archivo: ${error.message}`);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleUploadBegin = () => {
    setIsUploading(true);
    setUploadProgress(0);
  };

  const handleUploadProgress = (progress: number) => {
    setUploadProgress(progress);
  };

  if (isUploading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Subiendo documento...</h3>
              <p className="text-sm text-muted-foreground">
                Por favor, no cierres esta ventana
              </p>
            </div>
            <div className="space-y-2">
              <Progress value={uploadProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {uploadProgress}% completado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Información sobre requisitos */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-900 mb-1">
                Requisitos del documento
              </h4>
              <ul className="text-blue-800 space-y-1">
                <li>• Solo archivos PDF (máximo 8MB)</li>
                <li>• Documento de identidad o acreditación profesional</li>
                <li>• Imagen clara y legible</li>
                <li>• Sin contraseñas de protección</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload zone */}
      <UploadDropzone
        endpoint="documentValidation"
        onClientUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        onUploadBegin={handleUploadBegin}
        onUploadProgress={handleUploadProgress}
        appearance={{
          container: {
            border: "2px dashed #e2e8f0",
            borderRadius: "8px",
            padding: "24px",
            backgroundColor: "#f8fafc",
            transition: "all 0.2s ease-in-out",
          },
          uploadIcon: {
            color: "#64748b",
            width: "48px",
            height: "48px",
          },
          label: {
            color: "#334155",
            fontSize: "16px",
            fontWeight: "500",
          },
          allowedContent: {
            color: "#64748b",
            fontSize: "14px",
          },
          button: {
            background: "#2563eb",
            color: "white",
            fontSize: "14px",
            fontWeight: "500",
            padding: "8px 16px",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            transition: "background 0.2s ease-in-out",
          },
        }}
        content={{
          uploadIcon: () => <Upload className="h-12 w-12 text-gray-400" />,
          label: "Arrastra tu documento PDF aquí o haz clic para seleccionar",
          allowedContent: "Solo archivos PDF (máx. 8MB)",
          button: "Seleccionar archivo",
        }}
      />

      {/* Botón alternativo para dispositivos móviles */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          ¿Tienes problemas? También puedes usar el{" "}
          <button
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".pdf";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  if (file.type !== "application/pdf") {
                    toast.error("Solo se permiten archivos PDF");
                    return;
                  }
                  if (file.size > 8 * 1024 * 1024) {
                    toast.error("El archivo es muy grande (máx. 8MB)");
                    return;
                  }
                  // Aquí podrías integrar el upload manual si es necesario
                  toast.info("Por favor, usa la zona de arrastre superior");
                }
              };
              input.click();
            }}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            selector de archivos tradicional
          </button>
        </p>
      </div>
    </div>
  );
}