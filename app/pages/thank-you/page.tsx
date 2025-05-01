"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  XCircle,
  Loader2,
  BookOpen,
  ArrowLeft,
} from "lucide-react";

type Status = "success" | "error" | "loading";

export default function ThankYouPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [statusVisual, setStatusVisual] = useState<Status>("loading");
  const [courseName, setCourseName] = useState<string>("");

  const status = params.get("status");
  const courseId = params.get("course");

  useEffect(() => {
    const enrollUser = async () => {
      if (status !== "SUCCESS" || !courseId) {
        toast.error("Parámetros inválidos o pago no exitoso.");
        setStatusVisual("error");
        return;
      }

      try {
        // Intentar obtener información del curso
        const courseRes = await fetch(`/api/courses/${courseId}`);
        if (courseRes.ok) {
          const courseData = await courseRes.json();
          setCourseName(courseData.title || "");
        }

        // Validar el pago
        const validateRes = await fetch(
          `/api/courses/${courseId}/validate-payment`
        );
        const validateData = await validateRes.json();

        if (!validateRes.ok || !validateData.valid) {
          toast.error("No se ha verificado el pago.");
          setStatusVisual("error");
          return;
        }

        // Inscribir al usuario
        const enrollRes = await fetch(`/api/courses/${courseId}/enroll`, {
          method: "POST",
        });
        const enrollData = await enrollRes.json();

        if (enrollRes.ok) {
          toast.success("¡Inscripción completada con éxito!");
          setStatusVisual("success");
        } else {
          toast.error(enrollData.error || "No se pudo inscribir al curso.");
          setStatusVisual("error");
        }
      } catch (err) {
        toast.error("Error al validar o inscribir.");
        setStatusVisual("error");
      }
    };

    enrollUser();
  }, [status, courseId]);

  const renderContent = () => {
    switch (statusVisual) {
      case "loading":
        return (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute w-16 h-16 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute w-16 h-16 border-4 border-t-blue-500 rounded-full animate-spin"></div>
              <Loader2 className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              Procesando tu inscripción
            </h1>
            <p className="text-gray-600 max-w-sm text-center">
              Estamos registrando tu inscripción, por favor espera un momento...
            </p>
          </div>
        );

      case "success":
        return (
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-300 to-emerald-500 rounded-full opacity-75 blur"></div>
              <div className="relative bg-white p-2 rounded-full">
                <CheckCircle className="text-emerald-500 w-16 h-16" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-800">
                ¡Gracias por tu compra!
              </h1>
              <p className="text-gray-600 max-w-sm text-center">
                Tu inscripción al curso{" "}
                {courseName ? (
                  <span className="font-semibold">{courseName}</span>
                ) : (
                  ""
                )}{" "}
                se ha registrado correctamente.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => router.push("/courses")}
                className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Ir a mis cursos
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
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-300 to-red-500 rounded-full opacity-75 blur"></div>
              <div className="relative bg-white p-2 rounded-full">
                <XCircle className="text-red-500 w-16 h-16" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-bold text-gray-800">
                No se pudo completar
              </h1>
              <p className="text-gray-600 max-w-sm text-center">
                Hubo un problema con tu inscripción o validación del pago. Por
                favor, intenta nuevamente o contacta a soporte.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Button
                onClick={() => router.push("/courses")}
                className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Ver otros cursos
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/contact")}
                className="border-gray-300 text-gray-700 flex-1"
              >
                Contactar soporte
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 transition-all duration-300">
        {renderContent()}
      </div>
      <p className="mt-6 text-sm text-gray-500">
        Si tienes alguna pregunta sobre tu compra, no dudes en contactarnos.
      </p>
    </div>
  );
}
