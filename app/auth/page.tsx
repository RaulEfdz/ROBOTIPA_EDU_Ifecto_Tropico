// app/auth/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image"; // Para la imagen de fondo/lateral
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/utils/logo"; // Asumo que tienes un componente Logo
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import LoginForm from "./SignIn/LoginForm";
import SignupForm from "./SignUp/SignupForm";

// Componente interno para usar useSearchParams y aplicar diseño
function AuthPageContent() {
  const searchParams = useSearchParams();
  const rawRedirectUrl = searchParams.get("redirectUrl");
  const redirectUrl =
    rawRedirectUrl && rawRedirectUrl.startsWith("/courses/catalog")
      ? rawRedirectUrl
      : "/courses/catalog";
  const initialAction = searchParams.get("action");

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2">
      {/* Panel Izquierdo - Imagen y Mensaje (visible en pantallas grandes) */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-primaryCustom2/90 via-primaryCustom2 to-primaryCustom/80 p-12 text-white relative overflow-hidden">
        {/* Imagen de fondo sutil o ilustración */}
        <Image
          src="/auth-background.jpg" // REEMPLAZA con la ruta a tu imagen en /public
          alt="Fondo decorativo de autenticación"
          layout="fill"
          objectFit="cover"
          className="opacity-20" // Ajusta la opacidad según necesites
        />
        <div className="relative z-10 text-center">
          <div className="mb-8">
            <Logo version="light" width={180} height={90} />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            {process.env.NEXT_PUBLIC_NAME_APP || "Tu Plataforma Educativa"}
          </h1>
          <p className="text-xl text-slate-200">
            Aprende, crece y alcanza tus metas con nosotros.
          </p>
        </div>
      </div>

      {/* Panel Derecho - Formularios de Autenticación */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-10 bg-slate-50 dark:bg-slate-900">
        <Card className="w-full max-w-md bg-PanelCustom dark:bg-slate-800 shadow-xl rounded-xl overflow-hidden border dark:border-slate-700">
          <CardHeader className="text-center p-6 sm:p-8">
            {/* Logo para pantallas pequeñas, oculto en grandes donde está en el panel izquierdo */}
            <div className="mx-auto mb-6 lg:hidden">
              <Logo version="original" width={120} height={60} />
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-primaryCustom2 dark:text-slate-100">
              Bienvenido
            </CardTitle>
            <CardDescription className="text-primaryCustom dark:text-slate-400 mt-1">
              Accede o crea tu cuenta para continuar.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 sm:p-8">
            <Tabs
              defaultValue={initialAction === "sign_up" ? "signup" : "login"}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm data-[state=active]:text-primaryCustom2 dark:data-[state=active]:text-emerald-400"
                >
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:shadow-sm data-[state=active]:text-primaryCustom2 dark:data-[state=active]:text-emerald-400"
                >
                  Crear Cuenta
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <LoginForm redirectUrl={redirectUrl} />
              </TabsContent>
              <TabsContent value="signup">
                <SignupForm redirectUrl={redirectUrl} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
          Al continuar, aceptas nuestros{" "}
          <a
            href="/temrs"
            className="underline hover:text-primaryCustom dark:hover:text-emerald-400"
          >
            Términos de Servicio
          </a>
          .
        </p>
      </div>
    </div>
  );
}

// Wrapper con Suspense para useSearchParams
export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-primaryCustom2 dark:border-emerald-500"></div>
          <p className="ml-4 text-lg text-slate-700 dark:text-slate-300">
            Cargando...
          </p>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}
