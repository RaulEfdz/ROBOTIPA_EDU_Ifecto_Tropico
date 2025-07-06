"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface StatusInfo {
  icon: JSX.Element;
  title: string;
  description: string;
  cardClass: string;
}

function ResultadoClientContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<Record<string, string>>({});
  const [statusInfo, setStatusInfo] = useState<StatusInfo | null>(null);

  useEffect(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    setDetails(params);

    const estado = params.Estado;
    const razon = params.Razon;

    if (estado === "APROBADA") {
      setStatusInfo({
        icon: <CheckCircle className="h-16 w-16 text-green-500" />,
        title: "¡Pago completado con éxito!",
        description:
          "Gracias por tu compra. Se te ha concedido acceso al curso y serás redirigido en unos segundos.",
        cardClass: "border-green-200 bg-primary-50",
      });
      const courseId = params.PARM_1?.split("|")[1];
      if (courseId) {
        setTimeout(() => router.push(`/courses/${courseId}`), 4000);
      }
    } else if (razon === "AUTHORIZED" && estado !== "APROBADA") {
      setStatusInfo({
        icon: <AlertTriangle className="h-16 w-16 text-yellow-500" />,
        title: "Pago Autorizado pero no Completado",
        description:
          "Tu banco autorizó la transacción, pero no se pudo completar. Esto puede pasar por verificaciones de seguridad. Por favor, contacta a nuestro equipo de soporte con tu número de operación para ayudarte.",
        cardClass: "border-yellow-200 bg-yellow-50",
      });
    } else {
      setStatusInfo({
        icon: <XCircle className="h-16 w-16 text-red-500" />,
        title: "No se pudo completar el pago",
        description: `La transacción fue rechazada. Razón: ${razon || "Desconocida"}. Por favor, inténtalo de nuevo o contacta a tu banco.`,
        cardClass: "border-red-200 bg-red-50",
      });
    }

    setLoading(false);
  }, [searchParams, router]);

  if (loading || !statusInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-lg shadow-lg ${statusInfo.cardClass}`}>
        <CardHeader className="text-center space-y-4 pt-8">
          <div className="flex justify-center">{statusInfo.icon}</div>
          <CardTitle className="text-2xl font-bold">
            {statusInfo.title}
          </CardTitle>
          <CardDescription className="text-slate-600">
            {statusInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-t pt-4 mt-4 space-y-2 text-sm text-slate-600">
            <h3 className="font-semibold text-base text-slate-800 mb-3">
              Detalles de la Transacción
            </h3>
            {Object.entries(details).map(([key, value]) => {
              if (key === "PF_CF" || key === "RETURN_URL") return null;
              return (
                <div
                  key={key}
                  className="flex justify-between items-start gap-4"
                >
                  <span className="font-medium capitalize">
                    {key.replace(/_/g, " ")}:
                  </span>
                  <span className="text-right break-all text-slate-800">
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
        <div className="p-6 pt-0">
          <Button
            asChild
            className="w-full mt-4 bg-primary-600 hover:bg-primary-700"
          >
            <Link href="/courses/catalog">Ver otros cursos</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function ResultadoClient() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <ResultadoClientContent />
    </Suspense>
  );
}
