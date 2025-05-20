import React, { useRef } from "react";
import html2canvas from "html2canvas";
import {
  DynamicCert,
  DynamicCertProps as InnerDynamicCertProps,
} from "@/app/(dashboard)/(routes)/admin/certificates/templatesCertificate/dinamic";

// Omitimos 'name' porque lo manejamos como studentName
// y 'certificateId' porque ya está explícito en CertificateGeneratorProps
// Así permitimos pasar unit, baseRem, positions, etc.
type DynamicCertPassthroughProps = Omit<InnerDynamicCertProps, "name">;

export interface CertificateGeneratorProps {
  certRef: React.RefObject<HTMLDivElement>;
  templateComponent?: React.ComponentType<any>;
  templateProps?: Record<string, any>;
  // For backward compatibility with DynamicCert
  studentName?: string;
  certificateId?: string;
  courseName?: string;
  unit?: "px" | "rem" | "vh";
  baseRem?: number;
  positions?: {
    name?: { x: number; y: number };
    certificate?: { x: number; y: number };
  };
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  certRef,
  templateComponent: TemplateComponent,
  templateProps,
  // legacy props for DynamicCert
  studentName,
  certificateId,
  courseName,
  unit,
  baseRem,
  positions,
}) => {
  // Sanitiza el nombre para el archivo
  const sanitizeFileName = (name: string) =>
    name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");

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
  const downloadFileName = `Certificado_${sName}_${cName}.png`;

  const handleDownloadImage = async () => {
    if (!certRef.current) return;
    const canvas = await html2canvas(certRef.current, {
      useCORS: true,
    });
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = downloadFileName;
    link.click();
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: "1rem",
        boxSizing: "border-box",
      }}
    >
      <div
        ref={certRef}
        style={{
          width: "100%",
          // maxWidth: "1123px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          borderRadius: "8px",
          overflow: "hidden",
        }}
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
      <button
        onClick={handleDownloadImage}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1.2rem",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        Descargar como imagen
      </button>
    </div>
  );
};

CertificateGenerator.displayName = "CertificateGenerator";
