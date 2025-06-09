"use client";

import React from "react";
import Image from "next/image";

interface CertificateProps {
  name: string;
  certificateId: string;
}

export default function CertificateCard({
  name,
  certificateId,
}: CertificateProps) {
  return (
    <div className="relative w-full max-w-5xl mx-auto bg-white shadow-md px-10 py-8 border border-gray-300 font-sans">
      {/* Top green wave */}
      <div className="absolute top-0 left-0 w-full h-6 bg-green-900 rounded-b-full z-10" />

      {/* Logos */}
      <div className="flex justify-between items-center mb-6 z-20 relative">
        <Image
          src="/logos/sni-logo.png"
          alt="SNI Logo"
          width={100}
          height={100}
        />
        <Image
          src="/logos/infectotropico.png"
          alt="Infecto Tropico"
          width={160}
          height={100}
        />
        <Image
          src="/logos/medicina.png"
          alt="Facultad Medicina"
          width={100}
          height={100}
        />
      </div>

      {/* Título */}
      <div className="text-center mt-6">
        <h1 className="text-4xl font-bold text-gray-800">CERTIFICADO</h1>
        <h2 className="text-lg font-semibold text-gray-600 tracking-widest mt-1">
          DE PARTICIPACIÓN
        </h2>
        <p className="text-gray-500 mt-2">Este certificado es entregado a</p>
        <p className="text-2xl font-bold text-gray-800 mt-4">{name}</p>
      </div>

      {/* Cuerpo */}
      <div className="mt-6 text-center text-gray-600 px-10 leading-relaxed">
        Por participar y completar satisfactoriamente las{" "}
        <span className="font-bold">4 horas</span> de formación del curso
        virtual de Manejo médico del accidente por contacto animal.
      </div>

      {/* Firmas */}
      <div className="mt-10 flex justify-around items-center text-center">
        <div>
          <Image
            src="/signatures/lam.png"
            alt="Firma Oris"
            width={160}
            height={60}
          />
          <p className="mt-1 font-semibold">Dra. Oris Lam de Calvo</p>
          <p className="text-sm text-gray-500">
            Decana de la Facultad de medicina UP
          </p>
        </div>
        <div>
          <Image
            src="/signatures/naranjo.png"
            alt="Firma Laura"
            width={160}
            height={60}
          />
          <p className="mt-1 font-semibold">Dra. Laura Naranjo</p>
          <p className="text-sm text-gray-500">Infecto Trópico</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-10 text-center text-sm text-white bg-green-900 py-2 rounded-md">
        Avalado por la Universidad de Panamá – Aval Nro. 016-2025
        <br />
        <span className="text-xs text-gray-300">
          ID de certificado: {certificateId}
        </span>
      </div>
    </div>
  );
}
