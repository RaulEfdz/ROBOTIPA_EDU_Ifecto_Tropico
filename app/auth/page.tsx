// app/auth/page.tsx
"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
import EmailValidationTab from "./EmailValidationTab";
import PrivacyPolicyModal from "@/components/PrivacyPolicyModal";
import { ArrowRight, BookOpen } from "lucide-react";

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"></div>
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
  const rawRedirectUrl = searchParams?.get("redirectUrl");
  const redirectUrl =
    rawRedirectUrl && rawRedirectUrl.startsWith("/courses/catalog")
      ? rawRedirectUrl
      : "/courses/catalog";
  const initialAction = searchParams?.get("action");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header with Logo and Course Link */}
      <div
        className="lg:hidden px-6 py-8 text-white"
        style={{
          background:
            "linear-gradient(to right, var(--primary), color-mix(in srgb, var(--primary), black 20%))",
        }}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <Logo version="light" width={140} height={70} />
          <h1 className="text-2xl font-bold tracking-tight">
            {process.env.NEXT_PUBLIC_NAME_APP || "Robotipa Academy"}
          </h1>
          <p className="text-primary-100 text-sm max-w-sm">
            Accede a cursos especializados en medicina tropical
          </p>
          <Link
            href="/courses/catalog"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm border border-white/20"
          >
            <BookOpen className="h-4 w-4" />
            Ver cursos disponibles
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Desktop Left Panel */}
        <div
          className="relative hidden lg:flex items-center justify-center p-12"
          style={{
            background:
              "linear-gradient(to bottom right, var(--primary), color-mix(in srgb, var(--primary), black 20%))",
          }}
        >
          <Image
            src="/rbtpbasic.png"
            alt=""
            fill
            style={{ objectFit: "cover" }}
            className="opacity-10"
          />
          <div className="relative z-10 text-left text-white max-w-lg">
            <Logo version="light" width={180} height={90} />
            <h1 className="mt-6 text-5xl font-extrabold tracking-tight leading-tight">
              {process.env.NEXT_PUBLIC_NAME_APP || "Robotipa Academy"}
            </h1>
            <p className="mt-4 text-xl text-primary-100">
              {process.env.NEXT_PUBLIC_DESCRIPTION_APP || ""}
            </p>
            <div className="mt-8">
              <Link
                href="/courses/catalog"
                className="inline-flex items-center gap-3 text-primary-600 hover:bg-primary-50 transition-colors px-6 py-3 rounded-lg font-semibold shadow-lg"
              >
                <BookOpen className="h-5 w-5" />
                Explorar cursos
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex items-center justify-center p-4 sm:p-6 lg:p-12">
          <Card className="w-full max-w-md bg-white dark:bg-gray-800 shadow-xl rounded-2xl border-0 overflow-hidden">
            <CardHeader className="p-6 sm:p-8 text-center">
              <div className="hidden lg:block">
                <Logo version="original" width={120} height={60} />
              </div>
              <CardTitle className="mt-4 text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">
                Bienvenido
              </CardTitle>
              <CardDescription className="mt-2 text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                Accede o crea tu cuenta para continuar
              </CardDescription>
              <PrivacyPolicyModal
                triggerText="Políticas de Privacidad"
                triggerClassName="text-sm text-gray-500 hover:text-primary-600 underline"
              />
            </CardHeader>

            <CardContent className="p-6 sm:p-8 pt-0">
              <Tabs
                defaultValue={initialAction === "sign_up" ? "signup" : "login"}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 mb-6 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl h-12">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-primary-400 rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    Iniciar Sesión
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary-600 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-primary-400 rounded-lg transition-all duration-200 text-sm font-medium"
                  >
                    Crear Cuenta
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="mt-0">
                  <LoginForm redirectUrl={redirectUrl} />
                </TabsContent>
                <TabsContent value="signup" className="mt-0">
                  <SignupForm redirectUrl={redirectUrl} />
                </TabsContent>
                <TabsContent value="emailValidation" className="mt-0">
                  <EmailValidationTab />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
