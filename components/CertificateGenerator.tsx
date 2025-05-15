import React, { useRef } from "react";
import html2canvas from "html2canvas";

export interface CertificateGeneratorProps {
  studentName: string;
  certificateId: string;
  courseName?: string;
  // ...otras props necesarias para renderizar el certificado
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  studentName,
  certificateId,
  courseName,
  // ...otras props
}) => {
  const certRef = useRef<HTMLDivElement>(null);

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
        {/* Renderizado del certificado aquí usando las props */}
        {/* ...existing code... */}
      </div>
      <button onClick={handleDownloadImage}>Descargar Certificado</button>
    </div>
  );
};

CertificateGenerator.displayName = "CertificateGenerator";
