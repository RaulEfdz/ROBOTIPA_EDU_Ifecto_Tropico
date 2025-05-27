// File: app/pages/course/[courseId]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { toast, Toaster } from "sonner";
import { useCourse, CoursePublicData, ChapterPreview } from "./hook/useCourse"; // Importa las interfaces necesarias
import { sanitizeHtml } from "./utils/courseUtils"; // Asume que esta utilidad existe
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Header from "./components/Header"; // Componente Header para esta página
import PublicChapterItem from "./components/PublicChapterItem"; // Componente para mostrar capítulos en preview
import {
  BookOpen,
  Calendar, // No usado directamente en este ejemplo, pero podría ser para fechas
  Clock,
  Users,
  Award,
  CheckCircle,
  AlertCircle,
  Share2,
  Star,
  PlayCircle,
  ShoppingCart,
  LogIn,
  RefreshCw,
  FileText,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  getCurrentUserFromDB,
  UserDB,
} from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { createClient } from "@/utils/supabase/client";
import { formatPrice } from "@/lib/format"; // Importar formatPrice
import ManualRegistrationButton from "./components/ManualRegistrationButton";
import ChapterPreviewModal from "@/app/components/modals/ChapterPreviewModal"; // Importar el modal para vista previa

const supabase = createClient();

export default function CoursePage() {
  const router = useRouter();
  const { courseId } = useParams<{ courseId: string }>();
  const pathname = usePathname();

  // Obtener datos del curso, capítulos, etc., desde el hook
  const {
    course,
    chaptersPreview,
    relatedCourses,
    isLoading: isCourseLoading,
    error: courseError,
    refetchCourse, // Función para recargar datos si es necesario
  } = useCourse(courseId);

  // Estados para la sesión y la compra del usuario actual
  const [user, setUser] = useState<UserDB | null>(null);
  const [isSessionChecked, setIsSessionChecked] = useState(false); // ¿Se verificó la sesión?
  const [isActionLoading, setIsActionLoading] = useState(false); // ¿Está el botón principal procesando algo?
  const [hasPurchased, setHasPurchased] = useState(false); // ¿El usuario ha comprado este curso?
  const [isPurchaseCheckLoading, setIsPurchaseCheckLoading] = useState(true); // ¿Se está verificando la compra?

  // Efecto para cargar datos de sesión y estado de compra al montar o si courseId cambia
  useEffect(() => {
    const fetchDataAndSession = async () => {
      setIsSessionChecked(false);
      setHasPurchased(false);
      setIsPurchaseCheckLoading(true);

      try {
        // 1. Verificar Sesión de Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // 2. Si hay sesión, obtener datos del usuario desde tu DB
          const dbUser = await getCurrentUserFromDB();
          setUser(dbUser);

          // 3. Si tenemos usuario de DB y courseId, verificar si ha comprado
          if (dbUser?.id && courseId) {
            try {
              const purchaseRes = await fetch(
                `/api/courses/${courseId}/is-enrolled`
              );
              if (purchaseRes.ok) {
                const purchaseData = await purchaseRes.json();
                setHasPurchased(purchaseData.isEnrolled || false);
              } else {
                // La API devolvió error, asumir no comprado
                setHasPurchased(false);
                console.warn(`API /is-enrolled falló: ${purchaseRes.status}`);
              }
            } catch (purchaseError) {
              console.error("Error verificando la compra:", purchaseError);
              setHasPurchased(false); // Asumir no comprado en caso de error de red/fetch
            }
          } else {
            // No hay usuario en DB o falta courseId
            setHasPurchased(false);
          }
        } else {
          // No hay sesión de Supabase
          setUser(null);
          setHasPurchased(false);
        }
      } catch (error) {
        console.error("Error en check session/purchase:", error);
        setUser(null);
        setHasPurchased(false);
      } finally {
        // Marcar ambas cargas como completadas
        setIsSessionChecked(true);
        setIsPurchaseCheckLoading(false);
      }
    };

    // Solo ejecutar si tenemos un courseId válido
    if (courseId) {
      fetchDataAndSession();
    } else {
      // Si no hay courseId (por alguna razón), marcamos las cargas como hechas para evitar loading infinito
      setIsSessionChecked(true);
      setIsPurchaseCheckLoading(false);
    }
  }, [courseId]); // Dependencia principal: courseId

  // --- Lógica para el botón de acción principal ---
  const handleMainAction = async () => {
    if (!course) return; // No hacer nada si no hay datos del curso
    setIsActionLoading(true);

    // Volver a verificar la sesión por seguridad
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.user) {
      // --- Usuario Logueado ---
      if (hasPurchased) {
        // Ya compró -> Ir a la vista interna del curso
        router.push(`/courses/${courseId}`);
      } else if (!course.price || course.price === 0) {
        // Curso gratuito
        // Opcional: Hacer un "enroll" silencioso si es necesario
        // try { await fetch(`/api/courses/${courseId}/enroll-free`, { method: 'POST' }); } catch (err) {}
        router.push(`/courses/${courseId}`); // Acceder directamente
      } else {
        // Curso de pago, no comprado -> Iniciar pago
        try {
          const paymentResponse = await fetch("/api/payments/init", {
            // Llama a tu API para iniciar pago
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              courseId: course.id,
              amount: course.price,
              description: course.title,
              email: user?.email,
              phone: user?.phone,
              course: course, // Enviar el curso completo si es necesario
            }),
          });
          if (!paymentResponse.ok) {
            const errorData = await paymentResponse.json();
            throw new Error(errorData.error || "Error al iniciar el pago");
          }
          const paymentData = await paymentResponse.json();
          if (paymentData.paymentUrl) {
            window.location.href = paymentData.paymentUrl; // Redirigir a pasarela
          } else {
            toast.error("No se pudo obtener la URL de pago.");
            setIsActionLoading(false); // Resetear estado en caso de error controlable
          }
        } catch (paymentError: any) {
          toast.error(paymentError.message || "Error al procesar el pago.");
          setIsActionLoading(false); // Resetear estado en caso de error
        }
      }
    } else {
      // --- Usuario NO Logueado ---
      // Ruta pública: permitir acceso sin redirección ni error
      // Simplemente acceder a la vista interna del curso
      router.push(`/courses/${courseId}`);
      setIsActionLoading(false);
    }
    // La navegación usualmente se encarga, pero reseteamos si hubo error sin navegación
  };

  // --- Estado de Carga General ---
  // La página está cargando si el curso está cargando O si aún no se ha verificado la sesión O si se está verificando la compra
  const isLoadingInitial =
    isCourseLoading || !isSessionChecked || isPurchaseCheckLoading;

  // --- Renderizado Condicional: Carga Inicial ---
  if (isLoadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-gray-50 p-4 animate-pulse dark:bg-slate-900">
        {/* Skeleton más representativo */}
        <Skeleton className="h-8 w-3/4 mb-4 md:w-1/3 bg-slate-200 dark:bg-slate-700" />{" "}
        {/* Header simulado */}
        <Skeleton className="h-40 md:h-56 w-full bg-slate-200 dark:bg-slate-700" />{" "}
        {/* Hero simulado */}
        <div className="max-w-6xl w-full mx-auto grid md:grid-cols-3 gap-8 mt-8">
          <div className="md:col-span-2 space-y-4">
            <Skeleton className="h-48 w-full bg-slate-200 dark:bg-slate-700" />
            <Skeleton className="h-64 w-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    );
  }

  // --- Renderizado Condicional: Error ---
  if (courseError || !course) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6 text-center bg-gray-50 dark:bg-slate-900 p-4">
        <Header user={user} /> {/* Mostrar header incluso en error */}
        <div className="pt-20">
          {" "}
          {/* Espacio para que no quede pegado al header */}
          <AlertCircle size={60} className="text-red-500 mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-slate-800 dark:text-slate-100">
            Error al Cargar el Curso
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 mb-6 max-w-md mx-auto">
            {courseError ||
              "El curso que buscas no está disponible, ha sido movido o no se pudo encontrar."}
          </p>
          <Button
            onClick={() => router.push("/courses/catalog")} // Enlace al catálogo
            variant="default" // O 'outline' si prefieres
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Explorar Catálogo de Cursos
          </Button>
        </div>
      </div>
    );
  }

  // --- Renderizado Normal (Curso cargado, sesión verificada) ---
  // Desestructuración de los datos del curso (SIN 'purchases' directamente)
  const {
    title,
    description,
    imageUrl,
    price,
    category,
    studentCount,
    data: courseDataModel,
    updatedAt,
  } = course; // Asumiendo que studentCount viene de la API si lo necesitas
  const isFree = !price || price === 0;
  const priceDisplay = isFree
    ? "Gratis"
    : price
      ? formatPrice(price)
      : "Precio no disponible";

  // Determinar texto e icono del botón principal basado en los estados
  let mainButtonText: string;
  let MainButtonIcon: React.ElementType;

  if (user) {
    if (hasPurchased) {
      mainButtonText = "Acceder al Curso";
      MainButtonIcon = PlayCircle;
    } else if (isFree) {
      mainButtonText = "Empezar Ahora (Gratis)";
      MainButtonIcon = PlayCircle;
    } else {
      mainButtonText = `Comprar por ${priceDisplay}`;
      MainButtonIcon = ShoppingCart;
    }
  } else {
    if (isFree) {
      mainButtonText = "Empezar Gratis (Requiere Cuenta)"; // Más claro
      MainButtonIcon = LogIn;
    } else {
      mainButtonText = `Comprar por ${priceDisplay}`; // Asume que el flujo de compra pedirá login
      MainButtonIcon = ShoppingCart; // O LogIn si prefieres forzar login primero
    }
  }

  // Calcular otros datos derivados
  const learningObjectives = courseDataModel?.learningObjectives || [];
  const rating = 4.5; // Placeholder - idealmente vendría de la API
  const chapterCount = chaptersPreview.length; // Usa la preview para el conteo público
  const totalHours = chapterCount * 0.4; // Placeholder - ajusta tu estimación
  const studentsDisplay = studentCount ?? 0; // Usa el conteo si existe, sino 0
  const updatedDate = new Date(updatedAt).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // --- JSX de la Página ---
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header user={user} courseTitle={title} />

      {/* --- Hero Section --- */}
      <header className="bg-gradient-to-r from-emerald-700 via-emerald-700 to-emerald-700 text-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Columna Izquierda: Texto */}
          <div className="flex-1 space-y-3 md:space-y-4">
            {category?.name && (
              <Link
                href={`/courses/catalog?categoryId=${category.id}`}
                className="inline-block"
              >
                <span className="text-sm font-semibold bg-white/20 text-white px-3 py-1 rounded-full hover:bg-white/30 transition">
                  {category.name}
                </span>
              </Link>
            )}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight">
              {title}
            </h1>
            {/* {description && (
              <p className="text-base md:text-lg text-emerald-100 line-clamp-3">
                {description.substring(0, 150)}
                {description.length > 150 && "..."}
              </p>
            )} */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-emerald-50">
              {/* <div className="flex items-center gap-1">
                <Star size={16} className="text-yellow-400 fill-yellow-400" />{" "}
                {rating.toFixed(1)} Rating
              </div> */}
              <div className="flex items-center gap-1">
                <BookOpen size={16} /> {chapterCount} Capítulos
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} /> Aprox. {totalHours.toFixed(1)}h
              </div>
              {/* Mostrar contador de estudiantes solo si es mayor que 0 */}
              {studentsDisplay > 0 && (
                <div className="flex items-center gap-1">
                  <Users size={16} /> {studentsDisplay} Estudiantes
                </div>
              )}
            </div>
            <p className="text-xs text-emerald-200">
              Última actualización: {updatedDate}
            </p>
          </div>
          {/* Columna Derecha: Imagen/Video */}
          <div className="w-full md:w-80 lg:w-96 h-56 md:h-64 rounded-xl overflow-hidden relative shadow-2xl group shrink-0">
            <Image
              src={imageUrl || "/images/course-placeholder.webp"}
              alt={`Visual del curso ${title}`}
              fill
              className="object-contain rounded-xl transition-transform group-hover:scale-105"
              priority // Cargar rápido la imagen principal
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 384px" // Optimizar tamaños
            />
            <div
              className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all flex items-center justify-center cursor-pointer"
              // onClick={() =>
              //   // toast.info(
              //   //   "La previsualización de video no está disponible aún.",
              //   //   { id: "preview-video" }
              //   // )
              // }
            >
              {/* <PlayCircle
                size={64}
                className="text-white/80 group-hover:text-white group-hover:scale-110 transition-transform"
              /> */}
            </div>
          </div>
        </div>
      </header>

      {/* --- Contenido Principal --- */}
      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12 grid md:grid-cols-3 gap-8">
        {/* Columna Izquierda: Detalles del Curso */}
        <section className="md:col-span-2 space-y-8">
          {/* Sección: Lo que aprenderás */}
          {learningObjectives.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
              <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Award size={24} className="text-emerald-500" /> Lo que
                aprenderás
              </h2>
              <ul className="space-y-2 columns-1 sm:columns-2">
                {learningObjectives.map((obj: string, index: number) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-slate-700 dark:text-slate-300"
                  >
                    <CheckCircle
                      size={18}
                      className="text-emerald-500 mt-0.5 shrink-0"
                    />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Sección: Descripción */}
          {description && (
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
              <h2 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">
                Descripción del curso
              </h2>
              {/* Usar dangerouslySetInnerHTML solo si confías plenamente en el HTML guardado */}
              {/* Considera usar librerías como 'react-markdown' o 'marked' si guardas Markdown */}
              <div
                className="prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-3 prose-li:my-1"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }} // Asegúrate que sanitizeHtml exista y funcione
              />
            </div>
          )}

          {/* Sección: Contenido del Curso (Preview) */}
          {chaptersPreview.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
              <h2 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileText size={24} className="text-emerald-500" /> Contenido
                del curso (Vista Previa)
              </h2>
              <div className="space-y-3">
                {chaptersPreview.map((chapter, idx) => (
                  <PublicChapterItem
                    key={chapter.id}
                    chapter={chapter}
                    index={idx}
                  />
                ))}
              </div>
              {course?.chapters &&
                course.chapters.length > chaptersPreview.length && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={handleMainAction}
                      className="text-emerald-600 dark:text-emerald-400"
                    >
                      {user && !hasPurchased && !isFree
                        ? `Comprar para ver los ${course.chapters.length} capítulos`
                        : user
                          ? `Acceder para ver los ${course.chapters.length} capítulos`
                          : `Iniciar sesión para ver los ${course.chapters.length} capítulos`}
                    </Button>
                  </div>
                )}
            </div>
          )}
        </section>

        {/* Columna Derecha: Sidebar de Acciones */}
        <aside className="space-y-6 md:sticky md:top-24 self-start h-fit">
          {" "}
          {/* Sticky sidebar */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700">
            <div className="mb-6 text-center">
              <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                {priceDisplay}
              </div>
              {!isFree && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Pago único, acceso de por vida
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                onClick={handleMainAction}
                disabled={isActionLoading || isLoadingInitial} // Deshabilitado mientras carga CUALQUIER cosa inicial
                className="w-full py-3.5 text-base rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2.5 group transition-all duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
                aria-live="polite"
              >
                {/* Icono de carga más claro */}
                {isActionLoading || isLoadingInitial ? (
                  <RefreshCw className="animate-spin h-5 w-5" />
                ) : (
                  <MainButtonIcon
                    size={22}
                    className="group-hover:scale-105 transition-transform"
                  />
                )}
                <span className="font-semibold">
                  {isActionLoading
                    ? "Procesando..."
                    : isLoadingInitial
                      ? "Cargando..."
                      : mainButtonText}
                </span>
              </Button>

              <ManualRegistrationButton
                courseId={courseId}
                courseTitle={title}
              />

              <Button
                variant="outline"
                className="w-full py-3.5 text-base rounded-lg border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2.5"
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard
                      .writeText(window.location.href)
                      .then(() =>
                        toast.success("¡Enlace copiado al portapapeles!")
                      )
                      .catch(() => toast.error("No se pudo copiar el enlace."));
                  } else {
                    toast.error(
                      "El portapapeles no está disponible en este navegador."
                    );
                  }
                }}
              >
                <Share2 size={18} /> Compartir Curso
              </Button>
            </div>

            {/* Beneficios del curso */}
            <div className="border-t border-gray-100 dark:border-slate-700 pt-5 mt-6 space-y-2.5 text-sm">
              <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Este curso incluye:
              </h4>
              {/* <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Clock size={16} /> Acceso de por vida
              </div> */}
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <BookOpen size={16} /> Materiales descargables (si aplica)
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Award size={16} /> Certificado de finalización
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Users size={16} /> Acceso en múltiples dispositivos
              </div>
            </div>
          </div>
          {/* Cursos Relacionados */}
          {relatedCourses.length > 0 && (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
              <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-100">
                Cursos Relacionados
              </h3>
              <div className="space-y-3">
                {/* Asumiendo que relatedCourses tiene la misma estructura que CoursePublicData */}
                {relatedCourses.slice(0, 3).map((relCourse) => (
                  <Link
                    key={relCourse.id}
                    href={`/pages/course/${relCourse.id}`}
                    className="block group"
                  >
                    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="w-16 h-9 relative shrink-0 rounded overflow-hidden">
                        <Image
                          src={
                            relCourse.imageUrl ||
                            "/images/course-placeholder.webp"
                          }
                          alt={relCourse.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 line-clamp-1">
                          {relCourse.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {relCourse.category?.name}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
