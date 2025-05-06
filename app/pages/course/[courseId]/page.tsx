// File: app/pages/course/[courseId]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation"; // Importa usePathname
import { toast, Toaster } from "sonner"; // Importa Toaster
import { useCourse } from "./hook/useCourse"; // Tu hook personalizado
import { sanitizeHtml } from "./utils/courseUtils"; // Tu utilidad
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import ChapterItem from "./components/ChapterItem"; // Tu componente
import Header from "./components/Header"; // Tu componente
import {
  BookOpen,
  Calendar,
  Clock,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
  Share2,
  Star,
  PlayCircle,
  Download,
  ShoppingCart,
  LogIn, // Añade LogIn y ShoppingCart
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
// QUITA PaymentButton si el pago se maneja en otro lado o si este botón ahora es para acceder/loguearse
// import PaymentButton from "@/app/payments/PaymentButton";
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import type { UserDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";

// Necesitas tu cliente Supabase aquí si vas a verificar sesión activamente
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();

export default function CoursePage() {
  const router = useRouter();
  const { courseId } = useParams<{ courseId: string }>();
  const pathname = usePathname(); // Para la redirección de login

  // Usa tu hook, asumiendo que obtiene datos públicos del curso
  // Asegúrate que useCourse NO requiera sesión para obtener los datos básicos
  const {
    course,
    relatedCourses,
    chaptersPreview,
    isLoading,
    error: courseError,
  } = useCourse(courseId);

  const [user, setUser] = useState<UserDB | null>(null);
  const [isSessionChecked, setIsSessionChecked] = useState(false); // Para saber si ya verificamos la sesión
  const [isActionLoading, setIsActionLoading] = useState(false); // Para el estado de carga del botón

  // Efecto para verificar la sesión del usuario al cargar la página
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Usa Supabase u otro método para obtener la sesión actual SIN redirigir si no existe
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          // Si hay sesión, intenta obtener los detalles de tu DB
          const dbUser = await getCurrentUserFromDB(); // Tu función existente
          setUser(dbUser); // Puede ser null si no está en tu DB aún, pero hay sesión
        } else {
          setUser(null); // No hay sesión
        }
      } catch (error) {
        console.error("Error checking session on course page:", error);
        setUser(null); // Asume no logueado si hay error
      } finally {
        setIsSessionChecked(true); // Marca que la verificación se completó
      }
    };

    checkSession();
  }, []); // Ejecutar solo una vez al montar

  // --- Lógica del Botón Principal ---
  const handleMainAction = async () => {
    if (!course) return; // No hacer nada si no hay curso

    setIsActionLoading(true);

    // Volver a verificar la sesión justo antes de la acción (por si cambió en otra pestaña)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      // Si HAY sesión: Redirigir a la vista interna del curso
      router.push(`/courses/${courseId}`);
      // setLoading(false) no es necesario aquí, la navegación se encarga
    } else {
      // Si NO HAY sesión: Redirigir a la página de login/auth
      const redirectUrl = encodeURIComponent(`/courses/${courseId}`); // Redirigir DENTRO del curso después de login
      // const redirectUrl = encodeURIComponent(pathname); // O redirigir de vuelta a esta página de detalle
      router.push(`/auth?redirect=${redirectUrl}`); // Ajusta '/auth' a tu ruta de login
    }
    // No necesitas setLoading(false) aquí porque estás navegando fuera
    // setIsActionLoading(false); // Podrías ponerlo si la navegación falla por alguna razón
  };
  // --- Fin Lógica Botón ---

  // --- Renderizado Condicional ---

  // Estado de carga inicial (hook useCourse + chequeo de sesión)
  if (isLoading || !isSessionChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-gray-50 p-4 animate-pulse">
        <Skeleton className="h-10 w-1/2 bg-slate-200" />
        <Skeleton className="h-64 w-full max-w-4xl bg-slate-200" />
        <Skeleton className="h-6 w-3/4 bg-slate-200" />
        <Skeleton className="h-6 w-1/2 bg-slate-200" />
      </div>
    );
  }

  // Estado de error al cargar el curso desde el hook
  if (courseError || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 text-center bg-gray-50">
        <AlertCircle size={48} className="text-red-500" />
        <h1 className="text-2xl font-bold">Error al cargar el curso</h1>
        <p className="text-gray-500 mb-4">
          {courseError || "El curso no está disponible o no se pudo encontrar."}
        </p>
        <Button onClick={() => router.push("/search")} variant="outline">
          Volver al catálogo
        </Button>
      </div>
    );
  }

  // --- Renderizado Normal (Curso encontrado, sesión verificada) ---
  const { title, description, imageUrl, price, category, purchases } = course;
  const isFree = !price || price === 0;
  const priceDisplay = isFree ? "Gratis" : `${price.toFixed(2)}$`; // Ajusta formato si es necesario
  // Determina el texto y el icono del botón principal
  const mainButtonText = user
    ? "Acceder al Curso"
    : isFree
    ? "Empezar Ahora (Gratis)"
    : "Comprar Curso";
  const MainButtonIcon = user ? PlayCircle : isFree ? PlayCircle : ShoppingCart;

  // (Resto de variables como students, learningObjectives, rating, etc. se calculan igual)
  const students = purchases?.length ?? 0;
  const learningObjectives = course.data?.learningObjectives || [];
  const rating = 4.8; // Podrías obtener esto de los datos si lo tienes
  const chapterCount = chaptersPreview.length;
  const totalHours = chapterCount * 0.5; // Calcular si tienes duraciones
  const updatedDate = new Date(course.updatedAt).toLocaleDateString("es-ES", {
    /* ... */
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-center" richColors />
      {/* Pasa el usuario (o null) al Header para que muestre "Login" o el perfil */}
      <Header user={user} />

      {/* Hero Section */}
      <header className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white py-12 md:py-16">
        {/* ... (Contenido del Hero igual que antes) ... */}
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* ... Título, badges, detalles ... */}
          <div className="flex-1 space-y-4 md:space-y-6">
            {/* ... categoría, rating ... */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              {title}
            </h1>
            {/* ... lecciones, horas, alumnos, fecha ... */}
          </div>
          {/* ... Imagen/Video Preview ... */}
          <div className="w-full md:w-80 lg:w-96 h-56 md:h-64 rounded-xl overflow-hidden relative shadow-lg">
            {/* ... Imagen o placeholder ... */}
            {/* ... Botón Play overlay ... */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 grid md:grid-cols-3 gap-8">
        {/* Left Section - Contenido */}
        <section className="md:col-span-2 space-y-8">
          {/* ... Secciones "Lo que aprenderás", "Descripción", "Contenido del curso" ... */}
          {/* (Sin cambios necesarios aquí, usan datos de 'course') */}
          {learningObjectives.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
              {/* ... Contenido "Lo que aprenderás" ... */}
            </div>
          )}
          <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            {/* ... Contenido "Descripción del curso" ... */}
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
            {/* ... Contenido "Contenido del curso" con ChapterItem ... */}
          </div>
        </section>

        {/* Right Section - Sidebar de Compra/Acceso */}
        <aside className="space-y-6 md:sticky md:top-6">
          {" "}
          {/* Sticky sidebar */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-slate-700">
            <div className="mb-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {priceDisplay}
              </div>
            </div>

            <div className="space-y-3">
              {/* --- BOTÓN PRINCIPAL CON LÓGICA --- */}
              <Button
                size="lg"
                onClick={handleMainAction}
                disabled={isActionLoading} // Deshabilitar mientras carga
                className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 group transition-colors duration-200"
                aria-live="polite"
              >
                {isActionLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 text-white" /* ... SVG spinner ... */
                  ></svg>
                ) : (
                  <MainButtonIcon
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                )}
                <span>
                  {isActionLoading ? "Procesando..." : mainButtonText}
                </span>
              </Button>
              {/* --- FIN BOTÓN PRINCIPAL --- */}

              {/* Botón Compartir (opcional) */}
              <Button
                variant="outline"
                className="w-full py-3 rounded-lg border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
              >
                <Share2 size={16} /> Compartir
              </Button>
            </div>

            {/* ... Resto de la sidebar ("Este curso incluye", etc.) ... */}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-4 mt-6 space-y-3">
              {/* ... lista de beneficios ... */}
            </div>
          </div>
          {/* ... Cursos relacionados (sin cambios) ... */}
          {relatedCourses.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
              {/* ... contenido cursos relacionados ... */}
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
