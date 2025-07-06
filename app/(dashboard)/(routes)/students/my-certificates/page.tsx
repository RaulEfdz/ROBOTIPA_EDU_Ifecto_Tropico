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
import { Award, Eye, Download, ShieldX, XIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CertificateGenerator } from "@/components/CertificateGenerator";
import DefaultCertificateTemplate from "@/templates/certificates/DefaultCertificateTemplate";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRef } from "react";

// Interfaz para los datos del certificado que esperamos de la API y usamos internamente
interface StudentCertificateData {
  id: string;
  studentName: string;
  certificateId: string;
  courseName: string;
  courseImageUrl?: string | null;
  issuedAt: string;
  pdfUrl?: string | null;
  templateProps: {
    studentName: string;
    courseName: string;
    issueDate: string;
    certificateCode: string;
    backgroundImageUrl: string;
    qrCodeDataUrl?: string;
  };
}

interface CertificateApiResponse {
  id: string;
  userFullName?: string;
  code?: string;
  issuedAt?: string;
  pdfUrl?: string;
  qrCodeDataUrl?: string;
  course?: {
    title?: string;
    imageUrl?: string;
  };
}

// Componente de tarjeta para cada certificado
const CertificateCard: React.FC<{
  certificate: StudentCertificateData;
  onViewCertificate: (cert: StudentCertificateData) => void;
}> = ({ certificate, onViewCertificate }) => {
  // Validar fecha antes de formatear
  let formattedDate = "Fecha inválida";
  try {
    formattedDate = format(new Date(certificate.issuedAt), "PPP", {
      locale: es,
    });
  } catch {
    // Mantener "Fecha inválida"
  }
  return (
    <Card className="group flex flex-col h-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      {certificate.courseImageUrl && (
        <div className="relative w-full h-40 overflow-hidden">
          {/* Se recomienda usar next/image si el proyecto lo permite */}
          <img
            src={certificate.courseImageUrl}
            alt={`Imagen del curso: ${certificate.courseName}`}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {certificate.courseName}
        </CardTitle>
        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
          Emitido: {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
          Certificado de finalización del curso. Código:{" "}
          {certificate.certificateId}
        </p>
      </CardContent>
      <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
        <Button
          onClick={() => onViewCertificate(certificate)}
          variant="ghost"
          className="w-full justify-start text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30"
        >
          <Eye className="w-4 h-4 mr-2" />
          Ver Certificado
        </Button>
      </div>
    </Card>
  );
};

const MyCertificatesPage: React.FC = () => {
  const [certificates, setCertificates] = useState<StudentCertificateData[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] =
    useState<StudentCertificateData | null>(null);

  // Ref para CertificateGenerator
  const certGeneratorRef = useRef<HTMLDivElement>(null);

  // NOTA: El nombre del archivo contiene un carácter especial. Si es posible, renómbralo a "Certificado-de-Participacion-Animales.png" (sin tilde) para evitar problemas de rutas.
  const CERTIFICATE_BACKGROUND_IMAGE_URL =
    "/Certificado-de-Participación-Animales.png";

  useEffect(() => {
    const fetchCertificates = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/certificates/me");
        let dataFromApi: CertificateApiResponse[] = [];
        if (!response.ok) {
          // Intentar extraer error como JSON, si falla, usar texto plano
          try {
            const errorData = await response.json();
            throw new Error(
              errorData.error || "No se pudieron cargar los certificados."
            );
          } catch {
            const errorText = await response.text();
            throw new Error(
              errorText || "No se pudieron cargar los certificados."
            );
          }
        } else {
          try {
            dataFromApi = await response.json();
          } catch {
            throw new Error("Respuesta inesperada del servidor.");
          }
        }

        const mappedCertificates = dataFromApi.map(
          (certApi: CertificateApiResponse): StudentCertificateData => {
            const studentName = certApi.userFullName || "Nombre del Estudiante";
            const courseName = certApi.course?.title || "Nombre del Curso";
            const certificateCode = certApi.code || `CERT-${certApi.id}`;
            const issuedAtOriginal =
              certApi.issuedAt || new Date().toISOString();

            // Validar fecha para la plantilla
            let issueDateForTemplate = "Fecha inválida";
            try {
              issueDateForTemplate = format(
                new Date(issuedAtOriginal),
                "dd 'de' MMMM 'de' yyyy",
                { locale: es }
              );
            } catch {
              // Mantener "Fecha inválida"
            }

            return {
              id: certApi.id,
              studentName: studentName,
              certificateId: certificateCode,
              courseName: courseName,
              courseImageUrl: certApi.course?.imageUrl,
              issuedAt: issuedAtOriginal,
              pdfUrl: certApi.pdfUrl,
              templateProps: {
                studentName: studentName,
                courseName: courseName,
                issueDate: issueDateForTemplate,
                certificateCode: certificateCode,
                backgroundImageUrl: CERTIFICATE_BACKGROUND_IMAGE_URL,
                qrCodeDataUrl: certApi.qrCodeDataUrl,
              },
            };
          }
        );
        setCertificates(mappedCertificates);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
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
        <h1 className="text-3xl font-bold mb-12 text-center text-gray-800 dark:text-gray-100">
          Mis Certificados
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <ShieldX className="h-5 w-5" />
          <AlertTitle>Error al Cargar Certificados</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <header className="mb-10 md:mb-14 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
          Mis Certificados
        </h1>
        <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Aquí encontrarás todos los reconocimientos que has obtenido.
          ¡Felicidades por tu dedicación y aprendizaje!
        </p>
      </header>

      {certificates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
          {certificates.map((cert) => (
            <CertificateCard
              key={cert.id}
              certificate={cert}
              onViewCertificate={setSelectedCertificate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
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

      {/* Modal para ver el certificado en pantalla completa */}
      <Dialog
        open={!!selectedCertificate}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelectedCertificate(null);
        }}
      >
        <DialogContent className="max-w-4xl w-[95vw] md:w-[90vw] lg:w-[80vw] xl:w-[70vw] p-0 !rounded-xl overflow-hidden">
          {selectedCertificate && (
            <div className="bg-slate-100 dark:bg-slate-900">
              <div className="p-4 sm:p-6 flex justify-between items-center border-b dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[calc(100%-150px)]">
                  Certificado: {selectedCertificate.courseName}
                </h2>
                <div className="flex items-center gap-2">
                  {selectedCertificate.pdfUrl && (
                    <a
                      href={selectedCertificate.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-md shadow-sm transition-colors text-xs font-medium"
                      download={true}
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5" />
                      PDF Oficial
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedCertificate(null)}
                    className="inline-flex items-center justify-center rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors h-10 w-10"
                    aria-label="Cerrar"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div
                className="w-full overflow-auto p-2 sm:p-4 md:p-6"
                style={{ maxHeight: "calc(90vh - 80px)" }}
              >
                <CertificateGenerator
                  certRef={certGeneratorRef}
                  templateComponent={DefaultCertificateTemplate}
                  templateProps={selectedCertificate.templateProps}
                  studentName={selectedCertificate.studentName}
                  certificateId={selectedCertificate.certificateId}
                  courseName={selectedCertificate.courseName}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CardSkeleton: React.FC = () => (
  <Card className="flex flex-col h-full overflow-hidden rounded-lg shadow-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
    <Skeleton className="w-full h-40 bg-slate-200 dark:bg-slate-700" />
    <CardHeader className="pb-3 pt-4">
      <Skeleton className="h-5 w-3/4 mb-1 bg-slate-200 dark:bg-slate-700" />
      <Skeleton className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700" />
    </CardHeader>
    <CardContent className="flex-grow">
      <Skeleton className="h-4 w-full mb-1 bg-slate-200 dark:bg-slate-700" />
      <Skeleton className="h-4 w-5/6 bg-slate-200 dark:bg-slate-700" />
    </CardContent>
    <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-700/50 mt-auto">
      <Skeleton className="h-9 w-full bg-slate-200 dark:bg-slate-700" />
    </div>
  </Card>
);

export default MyCertificatesPage;
