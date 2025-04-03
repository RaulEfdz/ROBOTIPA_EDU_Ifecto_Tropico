import { Suspense } from "react";
import ConfirmActionClient from "./ConfirmActionClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ConfirmActionClient />
    </Suspense>
  );
}
