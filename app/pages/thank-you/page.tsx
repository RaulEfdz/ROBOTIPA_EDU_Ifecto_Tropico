"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

type Status = "success" | "error" | "loading" | "invalid-params";

export default function ThankYouPage() {
  const router = useRouter();

  const [statusVisual, setStatusVisual] = useState<Status>("loading");
  const [courseName, setCourseName] = useState<string>("");
  const [paymentDetails, setPaymentDetails] = useState<Record<string, string>>(
    {}
  );
  const [statusParam, setStatusParam] = useState<string | undefined>();
  const [courseId, setCourseId] = useState<string | undefined>();
  const [validationMessage, setValidationMessage] = useState<string>("");

  // Función auxiliar para parsear cualquier URL a un objeto { clave: valor }
  function obtenerParametrosDeUrl(fullUrl: string): Record<string, string> {
    try {
      const urlObj = new URL(fullUrl);
      const params = urlObj.searchParams;
      const resultado: Record<string, string> = {};

      for (const [clave, valor] of Array.from(params.entries())) {
        resultado[clave] = valor;
      }
      return resultado;
    } catch (e) {
      // Si el constructor URL falla, lo parseamos manualmente:
      const resultado: Record<string, string> = {};
      const indiceSigno = fullUrl.indexOf("?");
      if (indiceSigno === -1) return resultado;

      const queryString = fullUrl.slice(indiceSigno + 1);
      const pares = queryString.split("&");

      for (const par of pares) {
        if (!par) continue;
        const [claveRaw, valorRaw = ""] = par.split("=");
        const clave = decodeURIComponent(claveRaw.replace(/\+/g, " "));
        const valor = decodeURIComponent(valorRaw.replace(/\+/g, " "));
        resultado[clave] = valor;
      }
      return resultado;
    }
  }

  // Este efecto se ejecuta una sola vez (al montar el componente)
  // Toma window.location.href, extrae todos los parámetros y los guarda en state
  useEffect(() => {
    // Asegurarnos de que 'window' exista (solo en cliente)
    if (typeof window === "undefined") return;

    const fullUrl = window.location.href;
    const detalles = obtenerParametrosDeUrl(fullUrl);

    // Guardamos todos los parámetros para poder listarlos en la UI
    setPaymentDetails(detalles);

    // Extraemos explícitamente course del objeto resultante
    const rawCourse = detalles["course"] || detalles["COURSE"] || undefined;
    setCourseId(rawCourse);

    // Validación inicial de parámetros
    if (!rawCourse) {
      setStatusVisual("invalid-params");
      setValidationMessage("Faltan parámetros requeridos (course) en la URL.");
      return;
    }

    // Si llegamos aquí, los parámetros mínimos están presentes
    setStatusVisual("loading");
  }, []);

  // Efecto que se encarga de validar el pago e inscribir al usuario
  useEffect(() => {
    // Solo procedemos si el status visual es loading (parámetros válidos)
    if (statusVisual !== "loading" || !courseId) {
      return;
    }

    const enrollUser = async () => {
      try {
        // 1. Fetch info del curso (solo para mostrar nombre)
        const courseRes = await fetch(`/api/courses/${courseId}`);
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourseName(courseData.title || "Curso desconocido");
        } else {
          setCourseName("Curso no encontrado");
        }

        // 2. Validar el pago en backend pasando todos los parámetros de la URL
        const queryParams = new URLSearchParams(window.location.search);
        const validateRes = await fetch(
          `/api/courses/${courseId}/validate-payment?${queryParams.toString()}`
        );
        const validateData = await validateRes.json();

        if (!validateRes.ok || !validateData.valid) {
          setValidationMessage(
            validateData.message || "No se ha verificado el pago."
          );
          setStatusVisual("error");
          return;
        }

        // 3. Inscribir al usuario
        const enrollRes = await fetch(`/api/courses/${courseId}/enroll`, {
          method: "POST",
        });
        const enrollData = await enrollRes.json();

        if (enrollRes.ok) {
          toast.success("¡Inscripción completada con éxito!");
          setStatusVisual("success");
          setValidationMessage("Inscripción completada exitosamente.");
        } else {
          setValidationMessage(
            enrollData.error || "No se pudo inscribir al curso."
          );
          setStatusVisual("error");
        }
      } catch (err) {
        console.error("Error en el proceso de inscripción:", err);
        setValidationMessage("Error de conexión al validar o inscribir.");
        setStatusVisual("error");
      }
    };

    enrollUser();
  }, [statusVisual, courseId]);

  // Componente para mostrar los detalles de la URL
  const PaymentDetailsSection = () => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4 w-full">
      <h2 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
        Detalles del Pago
      </h2>
      {Object.keys(paymentDetails).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {Object.entries(paymentDetails).map(([key, value]) => {
            // Formatear algunos campos específicos para mejor legibilidad
            let displayKey = key;
            let displayValue: string | JSX.Element = value || "(vacío)";

            switch (key.toLowerCase()) {
              case "totalpagado":
                displayKey = "Total Pagado";
                displayValue = `${value}`;
                break;
              case "fecha":
                displayKey = "Fecha";
                break;
              case "hora":
                displayKey = "Hora";
                displayValue = decodeURIComponent(value);
                break;
              case "tipo":
                displayKey = "Tipo de Tarjeta";
                break;
              case "oper":
                displayKey = "Operación";
                break;
              case "usuario":
                displayKey = "Usuario";
                displayValue = decodeURIComponent(value.replace(/\+/g, " "));
                break;
              case "email":
                displayKey = "Email";
                displayValue = decodeURIComponent(value);
                break;
              case "estado":
                displayKey = "Estado";
                break;
              case "razon":
                displayKey = "Razón";
                displayValue = decodeURIComponent(value.replace(/\+/g, " "));
                // Agregar indicador visual para estado aprobado
                if (
                  displayValue.includes("00 - Aprobado") ||
                  displayValue.includes("Aprobado")
                ) {
                  displayValue = (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {displayValue}
                    </span>
                  );
                }
                break;
              case "status":
                displayKey = "Status";
                break;
              case "course":
                displayKey = "ID del Curso";
                break;
            }

            return (
              <div
                key={key}
                className="bg-white p-3 rounded border border-gray-100"
              >
                <div className="font-semibold text-gray-800 text-xs uppercase tracking-wide mb-1">
                  {displayKey}
                </div>
                <div className="text-gray-700 break-all font-mono text-xs">
                  {typeof displayValue === "string"
                    ? displayValue
                    : displayValue}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500">
          No se encontraron parámetros en la URL.
        </p>
      )}
      {validationMessage && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm font-medium text-blue-800">
              Estado de Validación
            </p>
          </div>
          <p className="text-sm text-blue-700">{validationMessage}</p>
        </div>
      )}
    </div>
  );

  // Función para renderizar contenido según el estado
  const renderContent = () => {
    switch (statusVisual) {
      case "loading":
        return (
          <div className="flex flex-col items-center space-y-4 w-full">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute w-16 h-16 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
              <Loader2 className="w-8 h-8 text-emerald-500 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Procesando tu inscripción
            </h1>
            <p className="text-gray-600 max-w-sm text-center">
              Estamos registrando tu inscripción al curso{" "}
              {courseName || courseId}, por favor espera un momento...
            </p>
            <PaymentDetailsSection />
          </div>
        );

      case "success":
        return (
          <div className="flex flex-col items-center space-y-6 w-full">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-300 to-emerald-500 rounded-full opacity-75 blur"></div>
              <div className="relative bg-white p-2 rounded-full">
                <CheckCircle className="text-emerald-500 w-16 h-16" />
              </div>
            </div>

            <div className="space-y-3 w-full text-center">
              <h1 className="text-3xl font-bold text-gray-800">
                ¡Gracias por tu compra!
              </h1>
              <p className="text-gray-600">
                Tu inscripción al curso{" "}
                <span className="font-semibold">{courseName}</span> se ha
                registrado correctamente.
              </p>
            </div>

            <PaymentDetailsSection />

            <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
              <Button
                onClick={() => router.push(`/courses/${courseId}`)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Ir a mi curso
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="border-gray-300 text-gray-700 flex-1"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Volver al inicio
              </Button>
            </div>
          </div>
        );

      case "invalid-params":
        return (
          <div className="flex flex-col items-center space-y-6 w-full">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-yellow-300 to-orange-500 rounded-full opacity-75 blur"></div>
              <div className="relative bg-white p-2 rounded-full">
                <AlertCircle className="text-orange-500 w-16 h-16" />
              </div>
            </div>

            <div className="space-y-3 text-center">
              <h1 className="text-3xl font-bold text-gray-800">
                Parámetros inválidos
              </h1>
              <p className="text-gray-600 max-w-sm">
                La URL no contiene los parámetros necesarios para procesar tu
                solicitud.
              </p>
            </div>

            <PaymentDetailsSection />

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => router.push("/courses/catalog")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Ver cursos disponibles
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="border-gray-300 text-gray-700 flex-1"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Volver al inicio
              </Button>
            </div>
          </div>
        );

      case "error":
      default:
        return (
          <div className="flex flex-col items-center space-y-6 w-full">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-300 to-red-500 rounded-full opacity-75 blur"></div>
              <div className="relative bg-white p-2 rounded-full">
                <XCircle className="text-red-500 w-16 h-16" />
              </div>
            </div>

            <div className="space-y-3 text-center">
              <h1 className="text-3xl font-bold text-gray-800">
                No se pudo completar
              </h1>
              <p className="text-gray-600 max-w-sm">
                Hubo un problema con tu inscripción o validación del pago.
                {courseName && ` Curso: ${courseName}`}
              </p>
            </div>

            <PaymentDetailsSection />

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => router.push("/courses/catalog")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Ver otros cursos
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/")}
                className="border-gray-300 text-gray-700 flex-1"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Volver al inicio
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      {/* Logo Section */}
      <div className="mb-6">
        <Image
          src="/logo.png"
          alt="Logo"
          width={120}
          height={60}
          className="h-12 w-auto object-contain"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full border border-gray-100 transition-all duration-300">
        {renderContent()}
      </div>
      <p className="mt-6 text-sm text-gray-500 text-center max-w-md">
        Si tienes alguna pregunta sobre tu compra o necesitas ayuda, no dudes en
        contactarnos.
      </p>
    </div>
  );
}
