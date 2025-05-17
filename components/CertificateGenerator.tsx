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

export interface CertificateGeneratorProps extends DynamicCertPassthroughProps {
  studentName: string;
  certificateId: string;
  courseName?: string;
  certRef: React.RefObject<HTMLDivElement>;
  unit?: "px" | "rem" | "vh";
  baseRem?: number;
  positions?: {
    name?: { x: number; y: number };
    certificate?: { x: number; y: number };
  };
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  studentName,
  certificateId,
  courseName,
  unit,
  baseRem,
  positions,
  certRef,
}) => {
  // const certRef = useRef<HTMLDivElement>(null);

  // Sanitiza el nombre para el archivo
  const sanitizeFileName = (name: string) =>
    name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_.-]/g, "");

  const sName = sanitizeFileName(studentName);
  const cName = courseName
    ? sanitizeFileName(courseName)
    : sanitizeFileName(certificateId);
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
    <div>
      <div ref={certRef}>
        <DynamicCert
          name={studentName}
          certificateId={certificateId}
          unit={unit}
          baseRem={baseRem}
          positions={positions}
        />
      </div>
      {/* <button onClick={handleDownloadImage}>Descargar Certificado</button> */}
    </div>
  );
};

CertificateGenerator.displayName = "CertificateGenerator";
