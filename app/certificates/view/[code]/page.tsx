"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { CertificateGenerator } from "@/components/CertificateGenerator";

interface CertificateData {
  studentName: string;
  certificateId: string;
  courseName: string;
  pdfUrl?: string;
}

export default function CertificateViewPage() {
  const { id } = useParams();
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const certRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/certificates/public/${id}`);
        if (!res.ok) throw new Error("Certificado no encontrado");
        const data: CertificateData = await res.json();
        setCertificate(data);
      } catch (e: any) {
        setError(e.message || "Error al cargar el certificado");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p>Cargando certificado…</p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <p className="text-red-600">
          {error || "Error al cargar el certificado."}
        </p>
      </div>
    );
  }

  return (
    <div ref={certRef} className="w-screen h-screen bg-white overflow-auto">
      <CertificateGenerator
        certRef={certRef}
        studentName={certificate.studentName}
        certificateId={certificate.certificateId}
        courseName={certificate.courseName}
        positions={{
          name: { x: 300, y: 240 },
          certificate: { x: 300, y: 300 },
        }}
      />
      {certificate.pdfUrl && (
        <div className="mt-8 flex flex-col items-center">
          <a
            href={certificate.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Descargar PDF
          </a>
          <iframe
            src={certificate.pdfUrl}
            title="Certificado PDF"
            width="600"
            height="800"
            className="border rounded shadow"
          />
        </div>
      )}
    </div>
  );
}
