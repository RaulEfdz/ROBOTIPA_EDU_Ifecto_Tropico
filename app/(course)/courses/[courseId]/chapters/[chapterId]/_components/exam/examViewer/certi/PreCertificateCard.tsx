"use client";

import React from "react";
import { IconBadge } from "@/components/icon-badge";
import { CheckCircle } from "lucide-react";

interface PreCertificateProps {
  name: string;
}

export default function PreCertificateCard({ name }: PreCertificateProps) {
  return (
    <div className="w-full max-w-lg mx-auto bg-white shadow-xl rounded-2xl p-8 font-sans text-center border border-emerald-100 relative overflow-hidden animate-fade-in">
      <div className="flex flex-col items-center mb-6">
        <IconBadge icon={CheckCircle} variant="success" size="default" />
      </div>
      <h2 className="text-3xl font-bold text-emerald-700 mb-4 tracking-tight">
        Certificado en proceso
      </h2>
      <p className="text-gray-800 text-lg mb-3">
        Hola <span className="font-semibold text-emerald-700">{name}</span>, tu
        certificado se estará enviando a tu correo electrónico pronto.
      </p>
      <p className="text-gray-600 text-base mb-2">
        Gracias por completar satisfactoriamente el curso virtual de{" "}
        <span className="font-semibold">
          Manejo médico del accidente por contacto animal
        </span>
        .
      </p>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full opacity-40 z-0" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-100 rounded-full opacity-30 z-0" />
    </div>
  );
}
