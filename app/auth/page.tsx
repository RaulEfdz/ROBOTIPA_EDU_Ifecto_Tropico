// app/auth/page.tsx
"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Logo } from "@/utils/logo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import LoginForm from "./SignIn/LoginForm";
import SignupForm from "./SignUp/SignupForm";

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-emerald-700-500"></div>
          <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">
            Cargando...
          </p>
        </div>
      }
    >
      <AuthPageContent />
    </Suspense>
  );
}

function AuthPageContent() {
  const searchParams = useSearchParams();
  const rawRedirectUrl = searchParams.get("redirectUrl");
  const redirectUrl =
    rawRedirectUrl && rawRedirectUrl.startsWith("/courses/catalog")
      ? rawRedirectUrl
      : "/courses/catalog";
  const initialAction = searchParams.get("action");

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Panel */}
      <div className="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-500 p-12">
        <Image
          src="/auth-background.jpg"
          alt="Decorative background"
          fill
          style={{ objectFit: "cover" }}
          className="opacity-10"
        />
        <div className="relative z-10 text-center text-white">
          <Logo version="light" width={180} height={90} />
          <h1 className="mt-6 text-5xl font-extrabold tracking-tight">
            {process.env.NEXT_PUBLIC_NAME_APP || "Tu Plataforma Educativa"}
          </h1>
          <p className="mt-4 text-lg opacity-80">
            Aprende, crece y alcanza tus metas con nosotros.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 sm:p-12">
        <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden">
          <CardHeader className="p-8 text-center">
            <div className="block lg:hidden">
              <Logo version="original" width={120} height={60} />
            </div>
            <CardTitle className="mt-4 text-3xl font-bold text-gray-800 dark:text-white">
              Bienvenido
            </CardTitle>
            <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
              Accede o crea tu cuenta para continuar.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <Tabs
              defaultValue={initialAction === "sign_up" ? "signup" : "login"}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-emerald-400"
                >
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-emerald-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-emerald-400"
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

          {/* <div className="px-8 pb-8">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Al continuar, aceptas nuestros{" "}
              <a
                href="/terms"
                className="underline hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                Términos de Servicio
              </a>
              .
            </p>
          </div> */}
        </Card>
      </div>
    </div>
  );
}
