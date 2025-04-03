import { Suspense } from "react";
import ResetPasswordClient from "./reset-password";

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ResetPasswordClient />
    </Suspense>
  );
}
