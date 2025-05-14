"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Award, Eye, Download, ShieldX } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface Certificate {
  id: string;
  title: string;
  institution: string;
  issuedAt: string;
  code?: string;
  fileUrl?: string | null;
  course?: {
    title: string;
    imageUrl?: string | null;
  };
}

const MyCertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/certificates/me");
        if (!res.ok) {
          if (res.status === 401) {
            setError("No autenticado. Por favor, inicia sesión.");
          } else {
            setError("Error al obtener los certificados.");
          }
          setCertificates([]);
        } else {
          const data = await res.json();
          setCertificates(data);
        }
      } catch (e: any) {
        setError("Error de red al obtener los certificados.");
        setCertificates([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Loader2 className="h-10 w-10 animate-spin text-sky-600 mb-4" />
        <span className="text-slate-600">Cargando certificados...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <ShieldX className="h-10 w-10 text-red-500 mb-4" />
        <span className="text-red-600 mb-2">{error}</span>
        {error.includes("inicia sesión") && (
          <Button asChild variant="outline">
            <a href="/sign-in">Ir a Iniciar Sesión</a>
          </Button>
        )}
      </div>
    );
  }

  if (!certificates.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh]">
        <Award className="h-12 w-12 text-amber-400 mb-4" />
        <span className="text-slate-600 text-lg font-semibold mb-2">
          Aún no tienes certificados
        </span>
        <span className="text-slate-500">
          Completa cursos para obtener tus certificados aquí.
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-2">
      <h1 className="text-2xl font-bold mb-6 text-center">Mis Certificados</h1>
      <div className="grid gap-6">
        {certificates.map((cert) => (
          <Card key={cert.id} className="shadow-md">
            <CardHeader className="flex flex-row items-center gap-4">
              {cert.course?.imageUrl && (
                <img
                  src={cert.course.imageUrl}
                  alt={cert.course.title}
                  className="w-20 h-20 object-cover rounded-md border"
                />
              )}
              <div>
                <CardTitle className="text-lg">
                  {cert.course?.title || cert.title}
                </CardTitle>
                <CardDescription>
                  Emitido por: {cert.institution}
                  <br />
                  Fecha:{" "}
                  {format(new Date(cert.issuedAt), "PPP", {
                    locale: es,
                  })}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
              <div>
                <span className="text-xs text-slate-500">Código:</span>
                <span className="ml-2 font-mono text-sm">{cert.code}</span>
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <Button asChild variant="outline" size="sm">
                  <a
                    href={`/api/certificates/${cert.code}/view`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Eye className="h-4 w-4 mr-1" /> Ver Online
                  </a>
                </Button>
                <Button asChild variant="secondary" size="sm" disabled>
                  <span>
                    <Download className="h-4 w-4 mr-1" /> Descargar
                    (Próximamente)
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyCertificatesPage;
