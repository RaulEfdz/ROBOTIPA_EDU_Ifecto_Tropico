import React, { useRef, useState, useCallback } from "react";
import html2canvas from "html2canvas";
import {
  DynamicCert,
  DynamicCertProps as InnerDynamicCertProps,
} from "@/app/(dashboard)/(routes)/admin/certificates/templatesCertificate/dinamic";
import Image from "next/image";

// Omitimos 'name' porque lo manejamos como studentName
// y 'certificateId' porque ya está explícito en CertificateGeneratorProps
type DynamicCertPassthroughProps = Omit<InnerDynamicCertProps, "name">;

export interface CertificateGeneratorProps {
  certRef: React.RefObject<HTMLDivElement>;
  templateComponent?: React.ComponentType<any>;
  templateProps?: Record<string, any>;
  // Propiedades para compatibilidad con DynamicCert
  studentName?: string;
  certificateId?: string;
  courseName?: string;
  unit?: "px" | "rem" | "vh";
  baseRem?: number;
  positions?: {
    name?: { x: number; y: number };
    certificate?: { x: number; y: number };
  };
  // Nuevas propiedades opcionales
  downloadFormat?: "png" | "jpeg" | "webp";
  quality?: number; // 0.1 a 1.0
  scale?: number; // Factor de escala para la imagen
  backgroundColor?: string;
  onDownloadStart?: () => void;
  onDownloadComplete?: (success: boolean) => void;
  onDownloadError?: (error: Error) => void;
  customFileName?: string;
  showPreview?: boolean;
  maxWidth?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  certRef,
  templateComponent: TemplateComponent,
  templateProps,
  // Propiedades legacy para DynamicCert
  studentName,
  certificateId,
  courseName,
  unit,
  baseRem,
  positions,
  // Nuevas propiedades
  downloadFormat = "png",
  quality = 1.0,
  scale = 2,
  backgroundColor = "#ffffff",
  onDownloadStart,
  onDownloadComplete,
  onDownloadError,
  customFileName,
  showPreview = true,
  maxWidth = "1123px",
  className,
  style,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Sanitiza cadenas para nombres de archivo
  const sanitizeFileName = useCallback((name: string): string => {
    return name
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_.-]/g, "")
      .substring(0, 100); // Limitar longitud
  }, []);

  // Genera el nombre del archivo
  const generateFileName = useCallback((): string => {
    if (customFileName) {
      return customFileName.endsWith(`.${downloadFormat}`)
        ? customFileName
        : `${customFileName}.${downloadFormat}`;
    }

    const sName = sanitizeFileName(
      studentName || (templateProps?.studentName ?? "Estudiante")
    );
    const cName = sanitizeFileName(
      courseName ||
        templateProps?.courseName ||
        certificateId ||
        templateProps?.certificateId ||
        templateProps?.certificateCode ||
        "CERT"
    );

    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return `Certificado_${sName}_${cName}_${timestamp}.${downloadFormat}`;
  }, [
    customFileName,
    downloadFormat,
    studentName,
    templateProps,
    courseName,
    certificateId,
    sanitizeFileName,
  ]);

  // Genera la imagen del certificado
  const generateCertificateImage = useCallback(async (): Promise<string> => {
    if (!certRef.current) {
      throw new Error("Referencia del certificado no encontrada");
    }

    try {
      const canvas = await html2canvas(certRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: scale,
        backgroundColor: backgroundColor,
        logging: false,
        removeContainer: true,
        foreignObjectRendering: true,
        imageTimeout: 30000,
        onclone: (clonedDoc) => {
          // Asegurar que las fuentes se carguen correctamente
          // fontDisplay no es válido en CSSStyleDeclaration, así que lo omitimos
        },
      });

      const mimeType = `image/${downloadFormat}`;
      return canvas.toDataURL(mimeType, quality);
    } catch (error) {
      console.error("Error al generar imagen del certificado:", error);
      throw new Error("No se pudo generar la imagen del certificado");
    }
  }, [certRef, scale, backgroundColor, downloadFormat, quality]);

  // Descarga la imagen
  const handleDownloadImage = useCallback(async (): Promise<void> => {
    setIsGenerating(true);
    onDownloadStart?.();

    try {
      const dataUrl = await generateCertificateImage();
      const fileName = generateFileName();

      // Crear y activar el enlace de descarga
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = fileName;
      link.style.display = "none";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Generar preview si está habilitado
      if (showPreview) {
        setPreviewUrl(dataUrl);
      }

      onDownloadComplete?.(true);
    } catch (error) {
      console.error("Error en la descarga:", error);
      onDownloadError?.(error as Error);
      onDownloadComplete?.(false);
    } finally {
      setIsGenerating(false);
    }
  }, [
    generateCertificateImage,
    generateFileName,
    showPreview,
    onDownloadStart,
    onDownloadComplete,
    onDownloadError,
  ]);

  // Genera preview sin descargar
  const handleGeneratePreview = useCallback(async (): Promise<void> => {
    if (!showPreview) return;

    try {
      const dataUrl = await generateCertificateImage();
      setPreviewUrl(dataUrl);
    } catch (error) {
      console.error("Error al generar preview:", error);
    }
  }, [generateCertificateImage, showPreview]);

  // --- CLASES CSS ---
  const containerClass = `certificate-generator-container max-w-full h-full flex flex-col items-center justify-center p-4 ${className || ""}`;
  const certClass = `p-2 certificate-generator-cert  shadow-md overflow-hidden bg-white relative`;
  const buttonClass = (color: string) =>
    `mt-4 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 min-w-[200px] transition-all duration-200 text-white ${isGenerating ? "bg-gray-400 cursor-not-allowed" : color}`;
  const previewClass = "text-center";
  const previewImgClass =
    "max-w-full  border-2 border-gray-200 rounded-lg shadow";
  const previewTitleClass = "mb-4 text-lg font-bold text-gray-700";

  return (
    <div className={containerClass} style={style}>
      <div
        ref={certRef}
        data-certificate
        className={certClass}
        style={{ maxWidth: maxWidth, backgroundColor }}
      >
        {TemplateComponent ? (
          <TemplateComponent {...templateProps} />
        ) : (
          <DynamicCert
            name={studentName || ""}
            certificateId={certificateId || ""}
            unit={unit}
            baseRem={baseRem}
            positions={positions}
          />
        )}
      </div>

      <div className="flex gap-4 mt-4">
        <button
          onClick={handleDownloadImage}
          disabled={isGenerating}
          className={buttonClass("bg-blue-600 hover:bg-blue-700")}
          title={`Descargar como ${downloadFormat.toUpperCase()}`}
        >
          {isGenerating ? (
            <>
              <span>⏳</span>
              Generando...
            </>
          ) : (
            <>
              <span>⬇️</span>
              Descargar certificado
            </>
          )}
        </button>

        {showPreview && (
          <button
            onClick={handleGeneratePreview}
            disabled={isGenerating}
            className={buttonClass("bg-primary-600 hover:bg-primary-700")}
            title="Generar vista previa"
          >
            <span>👁️</span>
            Vista previa
          </button>
        )}
      </div>

      {previewUrl && showPreview && (
        <div className={previewClass}>
          <h3 className={previewTitleClass}>Vista previa del certificado</h3>
          <Image
            width={1123}
            height={794}
            loading="lazy"
            src={previewUrl}
            alt="Vista previa del certificado"
            className={previewImgClass}
          />
        </div>
      )}
    </div>
  );
};

CertificateGenerator.displayName = "CertificateGenerator";
