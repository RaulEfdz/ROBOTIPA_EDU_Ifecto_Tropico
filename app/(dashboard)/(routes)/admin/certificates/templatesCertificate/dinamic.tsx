// app/(dashboard)/(routes)/admin/certificates/templatesCertificate/dinamic.tsx
"use client";

import React, { useEffect, useState } from "react";

export interface DynamicCertProps {
  name: string;
  certificateId: string;
  /** Unidad para todas las medidas: 'px', 'rem' o 'vh' */
  unit?: "px" | "rem" | "vh";
  /** Sólo tiene efecto si usas rem; por defecto 16px = 1rem */
  baseRem?: number;
  /** Posiciones personalizadas para los elementos en coordenadas de la resolución ORIGINAL */
  positions?: {
    name?: { x: number; y: number };
    certificate?: { x: number; y: number };
  };
}

const TEMPLATE_URL = "/Certificado-de-Participación-Animales.png";
const ORIGINAL = { width: 623, height: 440 };
const SCALE = 2;
const DEFAULT_POS = {
  name: { x: ORIGINAL.width * 0.5, y: ORIGINAL.height * 0.55 },
  certificate: { x: ORIGINAL.width * 0.5, y: ORIGINAL.height * 0.65 },
};

export const DynamicCert: React.FC<DynamicCertProps> = ({
  name,
  certificateId,
  unit = "rem",
  baseRem = 16,
  positions = {},
}) => {
  const [pxPerVh, setPxPerVh] = useState(0);
  useEffect(() => {
    if (unit === "vh") {
      const update = () => setPxPerVh(window.innerHeight / 100);
      update();
      window.addEventListener("resize", update);
      return () => window.removeEventListener("resize", update);
    }
  }, [unit]);

  const cvt = (px: number) => {
    if (unit === "rem") return px / baseRem;
    if (unit === "vh") return px / pxPerVh;
    return px;
  };

  const W = cvt(ORIGINAL.width * SCALE);
  const H = cvt(ORIGINAL.height * SCALE);

  const posNameOrig = positions.name ?? DEFAULT_POS.name;
  const posCertOrig = positions.certificate ?? DEFAULT_POS.certificate;

  const posStyle = (coord: { x: number; y: number }) => ({
    position: "absolute" as const,
    left: `${cvt(coord.x * SCALE)}${unit}`,
    top: `${cvt(coord.y * SCALE)}${unit}`,
    transform: "translate(-50%, -50%)",
  });

  return (
    <div
      style={{
        position: "relative",
        width: `${W}${unit}`,
        height: `${H}${unit}`,
        backgroundImage: `url(${TEMPLATE_URL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h1
        style={{
          ...posStyle(posNameOrig),
          margin: 0,
          fontFamily: "Arial, sans-serif",
          fontWeight: "bold",
          fontSize: `${cvt(ORIGINAL.width * 0.05)}${unit}`,
          color: "#333",
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </h1>
      <span
        style={{
          ...posStyle(posCertOrig),
          margin: 0,
          fontFamily: "Arial, sans-serif",
          fontSize: `${cvt(ORIGINAL.width * 0.032)}${unit}`,
          color: "#00000055",
        }}
      >
        {certificateId}
      </span>
    </div>
  );
};

export default DynamicCert;
