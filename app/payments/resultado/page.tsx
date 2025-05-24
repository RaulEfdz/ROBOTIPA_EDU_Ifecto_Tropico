"use client";

import { useSearchParams } from "next/navigation";
import React from "react";

export default function ResultadoPage() {
  const params = useSearchParams();
  const status = params.get("status") || params.get("Estado") || "Desconocido";
  const totalPagado = params.get("TotalPagado");
  const operacion = params.get("Oper");
  const courseId = params.get("course");

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Resultado del Pago</h1>
      <div className="space-y-2">
        <p>
          <span className="font-semibold">Estado:</span> {status}
        </p>
        {totalPagado && (
          <p>
            <span className="font-semibold">Total Pagado:</span> {totalPagado}
          </p>
        )}
        {operacion && (
          <p>
            <span className="font-semibold">Operación:</span> {operacion}
          </p>
        )}
        {courseId && (
          <p>
            <span className="font-semibold">ID de Curso:</span> {courseId}
          </p>
        )}
      </div>
      {status !== "SUCCESS" && (
        <p className="mt-4 text-red-600">
          Hubo un problema con tu pago. Por favor, intenta de nuevo o contacta
          soporte.
        </p>
      )}
    </div>
  );
}
