import React, { Suspense } from "react";
import ResultadoClient from "./ResultadoClient";

export const dynamic = "force-dynamic";

export default function ResultadoPage() {
  return (
    <Suspense fallback={<div>Cargando resultado...</div>}>
      <ResultadoClient />
    </Suspense>
  );
}
