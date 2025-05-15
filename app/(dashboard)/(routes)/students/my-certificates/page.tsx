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
import { CertificateGenerator } from "@/components/CertificateGenerator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

// Ajustamos la interfaz para que sea compatible con CertificateGenerator
interface StudentCertificateData {
  id: string;
  studentName: string;
  certificateId: string;
  courseName: string;
  // unit?: "px" | "rem" | "vh";
  // baseRem?: number;
  // positions?: { name?: { x: number; y: number }; certificate?: { x: number; y: number } };
}

const MyCertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<StudentCertificateData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/certificates/me");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "No se pudieron cargar los certificados."
          );
        }
        // Adaptar los datos recibidos a la interfaz StudentCertificateData
        const data = await response.json();
        const mapped = data.map((cert: any) => ({
          id: cert.id,
          studentName: cert.userFullName || cert.studentName || "Estudiante",
          certificateId: cert.code || cert.certificateId,
          courseName: cert.course?.title || cert.title || "Curso",
        }));
        setCertificates(mapped);
      } catch (err: any) {
        setError(err.message);
        setCertificates([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Mis Certificados
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <CardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8 text-center">
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertTitle>Error al Cargar Certificados</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-12 text-center text-gray-800 dark:text-gray-100">
        Mis Certificados
      </h1>
      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
          {certificates.map((cert) => (
            <div
              key={cert.id}
              className="w-full max-w-md p-4 bg-white dark:bg-slate-800 shadow-xl rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <h2 className="text-xl font-semibold mb-3 text-center text-sky-700 dark:text-sky-400">
                {cert.courseName}
              </h2>
              <CertificateGenerator
                studentName={cert.studentName}
                certificateId={cert.certificateId}
                courseName={cert.courseName}
                // unit, baseRem, positions si lo necesitas por certificado
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400">
          <Award className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500 mb-6" />
          <h2 className="text-2xl font-semibold mb-3 text-slate-700 dark:text-slate-200">
            Aún no tienes certificados
          </h2>
          <p className="max-w-md mx-auto">
            Completa cursos para obtener tus certificados y verlos aquí. ¡Sigue
            aprendiendo!
          </p>
        </div>
      )}
    </div>
  );
};

const CardSkeleton = () => (
  <div className="p-4 bg-white dark:bg-slate-800 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700">
    <Skeleton className="h-6 w-3/4 mb-4 mx-auto" />
    <Skeleton className="h-[250px] w-full mb-4" />
    <Skeleton className="h-10 w-full" />
  </div>
);

export default MyCertificatesPage;
