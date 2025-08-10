"use client";

import { CheckCircle, Clock, Upload, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationStepperProps {
  currentStatus: "NO_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: any;
  status: "completed" | "current" | "pending";
}

export function ValidationStepper({ currentStatus }: ValidationStepperProps) {
  // Determinar el paso actual basado en el status
  const getCurrentStep = () => {
    switch (currentStatus) {
      case "NO_SUBMITTED":
        return 1;
      case "PENDING":
        return 2;
      case "REJECTED":
        return 2; // Vuelve al paso 2 para reenvío
      case "APPROVED":
        return 4;
      default:
        return 1;
    }
  };

  const currentStep = getCurrentStep();

  const steps: Step[] = [
    {
      id: 1,
      title: "Cuenta Creada",
      description: "Tu cuenta ha sido registrada",
      icon: CheckCircle,
      status: "completed"
    },
    {
      id: 2,
      title: "Subir Documento",
      description: "Sube tu documento de acreditación en PDF",
      icon: Upload,
      status: currentStep >= 2 ? (currentStatus === "REJECTED" ? "current" : "completed") : "pending"
    },
    {
      id: 3,
      title: "En Revisión",
      description: "Nuestro equipo revisa tu documento",
      icon: Clock,
      status: currentStep >= 3 ? (currentStatus === "PENDING" ? "current" : "completed") : "pending"
    },
    {
      id: 4,
      title: "Acceso Completo",
      description: "¡Listo! Ya puedes acceder a todos los cursos",
      icon: Award,
      status: currentStep >= 4 ? "completed" : "pending"
    }
  ];

  return (
    <div className="w-full">
      <nav aria-label="Progress" className="mb-8">
        <ol className="flex items-center justify-center">
          {steps.map((step, stepIdx) => (
            <li key={step.id} className="relative flex-1">
              {stepIdx !== steps.length - 1 ? (
                <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-200 ml-4">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      step.status === "completed" ? "bg-green-600" : "bg-gray-200"
                    )}
                  />
                </div>
              ) : null}
              
              <div className="relative flex flex-col items-center group">
                <span
                  className={cn(
                    "w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300",
                    step.status === "completed" && "bg-green-600 border-green-600 text-white",
                    step.status === "current" && currentStatus !== "REJECTED" && "border-blue-600 text-blue-600 bg-blue-50",
                    step.status === "current" && currentStatus === "REJECTED" && "border-red-600 text-red-600 bg-red-50",
                    step.status === "pending" && "border-gray-200 text-gray-400"
                  )}
                >
                  {step.status === "completed" ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </span>
                
                <div className="mt-3 text-center">
                  <div
                    className={cn(
                      "text-sm font-medium transition-colors duration-300",
                      step.status === "completed" && "text-green-600",
                      step.status === "current" && currentStatus !== "REJECTED" && "text-blue-600",
                      step.status === "current" && currentStatus === "REJECTED" && "text-red-600",
                      step.status === "pending" && "text-gray-500"
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 max-w-24 text-center">
                    {step.description}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* Status message */}
      <div className="text-center">
        {currentStatus === "NO_SUBMITTED" && (
          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
            Sube tu documento de acreditación para iniciar el proceso de validación
          </div>
        )}
        {currentStatus === "PENDING" && (
          <div className="text-sm text-blue-700 bg-blue-50 p-3 rounded-lg">
            Tu documento está en proceso de revisión. Te notificaremos por email cuando esté listo.
          </div>
        )}
        {currentStatus === "REJECTED" && (
          <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
            Tu documento fue rechazado. Revisa los comentarios y sube un nuevo documento.
          </div>
        )}
        {currentStatus === "APPROVED" && (
          <div className="text-sm text-green-700 bg-green-50 p-3 rounded-lg">
            ¡Felicidades! Tu documento ha sido aprobado. Ya tienes acceso completo a la plataforma.
          </div>
        )}
      </div>
    </div>
  );
}