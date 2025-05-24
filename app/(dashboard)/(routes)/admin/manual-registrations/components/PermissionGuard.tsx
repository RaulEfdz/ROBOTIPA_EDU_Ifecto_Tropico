/*
File: app/components/PermissionGuard.tsx
Description: Checks user permissions before showing children or loading state.
*/
"use client";

import { useEffect, ReactNode, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getCurrentUserFromDB,
  UserDB,
} from "@/app/auth/CurrentUser/getCurrentUserFromDB";

interface PermissionGuardProps {
  children: ReactNode;
}

export function PermissionGuard({ children }: PermissionGuardProps) {
  const [status, setStatus] = useState<"loading" | "granted" | "denied">(
    "loading"
  );
  const router = useRouter();
  const pathname = usePathname(); // Get current pathname for redirect
  // const [processingUser, setProcessingUser] = useState<UserDB | null>(null); // Declared in prompt, but not exposed. See notes.

  useEffect(() => {
    async function check() {
      try {
        const user = await getCurrentUserFromDB();
        if (!user) {
          toast.error("Debes iniciar sesión para acceder a esta página.");
          router.push("/auth?redirectUrl=" + encodeURIComponent(pathname));
          setStatus("denied");
          return;
        }
        // setProcessingUser(user); // Internal state, not passed to children as per prompt

        const adminRoleId = process.env.NEXT_PUBLIC_ADMIN_ID;
        const teacherRoleId = process.env.NEXT_PUBLIC_TEACHER_ID;
        const permitted =
          user.customRole === adminRoleId || user.customRole === teacherRoleId;

        if (!permitted) {
          toast.error("Acceso denegado. No tienes permisos para esta sección.");
          router.push("/courses/catalog"); // Or a more appropriate "unauthorized" page
          setStatus("denied");
          return;
        }

        setStatus("granted");
      } catch (e) {
        toast.error("Error verificando permisos. Serás redirigido.");
        router.push("/courses/catalog");
        setStatus("denied");
      }
    }
    check();
  }, [router, pathname]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-12 w-12 animate-spin text-slate-500 dark:text-slate-400 mb-4" />
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Verificando acceso y cargando módulo...
        </p>
      </div>
    );
  }

  if (status === "denied") {
    // Note: The router.push might have already navigated away. This is a fallback UI.
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-red-50 dark:bg-red-900/10">
        <ShieldAlert className="h-12 w-12 text-red-500 dark:text-red-400 mb-4" />
        <h1 className="text-2xl font-semibold text-red-700 dark:text-red-300 mb-2">
          Acceso Denegado
        </h1>
        <p className="text-red-600 dark:text-red-400">
          No tienes los permisos necesarios para ver esta página.
        </p>
        <Button
          onClick={() => router.push("/courses/catalog")}
          className="mt-6"
        >
          Volver al Catálogo
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
