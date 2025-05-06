// File: app/(course)/courses/catalog/page.tsx

"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { CourseCard, CourseWithProgress } from "@/components/course-card"; // Importa CourseCard y el tipo extendido

// Interfaz para los datos recibidos de la API pública
interface CatalogApiResponseCourse {
  id: string;
  title: string;
  imageUrl: string | null;
  chapters: { id: string }[]; // Solo para obtener length
  price: number | null;
  category: { id: string; name: string } | null;
  // Campos que NO vienen de la API pública pero necesita CourseCard (con valores por defecto)
  isPublished?: boolean; // Asumimos true
  delete?: boolean; // Asumimos false
}

// Componente principal envuelto en Suspense
function CatalogContent() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("categoryId");
  const title = searchParams.get("title");

  // El estado ahora usa la interfaz de la API
  const [coursesFromApi, setCoursesFromApi] = useState<
    CatalogApiResponseCourse[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(false); // Estado específico para el setLoading del Card
  const [searchTerm, setSearchTerm] = useState(title || "");

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true); // Carga general de la página
      try {
        const queryParams = new URLSearchParams();
        if (categoryId) queryParams.set("categoryId", categoryId);
        if (title) queryParams.set("title", title);

        const res = await fetch(
          `/api/public-courses?${queryParams.toString()}`
        );
        if (!res.ok) {
          throw new Error(`Error al obtener cursos: ${res.statusText}`);
        }
        const data: CatalogApiResponseCourse[] = await res.json();
        setCoursesFromApi(data);
      } catch (error: any) {
        console.error("Error fetching catalog data:", error);
        toast.error(
          `Error al cargar el catálogo: ${error.message || "Error desconocido"}`
        );
        setCoursesFromApi([]); // Asegurar que sea un array vacío en caso de error
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [categoryId, title]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      params.set("title", searchTerm.trim());
    } else {
      params.delete("title");
    }
    // Navega actualizando los searchParams (forma preferida en App Router)
    // Esto requiere importar useRouter en el componente que usa Suspense o pasarlo como prop
    // window.location.search = params.toString(); // Evitar recarga si es posible
    // Alternativa simple (si useRouter no está disponible directamente aquí):
    const currentPath = window.location.pathname; // O obtener de usePathname si está disponible
    window.location.href = `${currentPath}?${params.toString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Toaster position="top-center" richColors />

      {/* Encabezado y Búsqueda */}
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100">
          Catálogo de Cursos
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Explora nuestros cursos disponibles.
        </p>
        <form
          onSubmit={handleSearchSubmit}
          className="flex gap-2 items-center max-w-lg"
        >
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar cursos por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
          <Button type="submit" variant="default">
            Buscar
          </Button>
        </form>
      </div>

      {/* Lista de Cursos o Skeleton */}
      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="border rounded-lg p-3 space-y-2 animate-pulse bg-white dark:bg-slate-800"
            >
              <Skeleton className="aspect-video w-full rounded-md bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700" />
              <Skeleton className="h-6 w-1/4 mt-2 bg-slate-200 dark:bg-slate-700" />
            </div>
          ))}
        </div>
      ) : coursesFromApi.length > 0 ? (
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {coursesFromApi.map((apiCourse) => {
            // --- VALIDACIÓN ---
            if (!apiCourse || !apiCourse.id) {
              console.warn(
                "Datos de curso inválidos recibidos de la API:",
                apiCourse
              );
              return null; // No renderizar tarjeta si falta el ID o el objeto
            }

            // --- ADAPTACIÓN DE DATOS para CourseCard ---
            const courseCardProps: CourseWithProgress = {
              // Propiedades de la API pública que coinciden con Course
              id: apiCourse.id,
              title: apiCourse.title,
              imageUrl: apiCourse.imageUrl,
              price: apiCourse.price,
              category: apiCourse.category,
              categoryId: apiCourse.category?.id ?? null, // Necesario si Course lo requiere
              chapters: apiCourse.chapters, // Asumiendo que CourseCard necesita el array (aunque sea solo para .length)

              // Propiedades de Course que ASUMIMOS o ponemos por defecto
              description: null, // Asumimos null si no viene de API pública
              isPublished: true, // Asumido
              delete: false, // Asumido
              userId: "public", // Un placeholder, ya que no hay usuario específico
              createdAt: new Date(0), // Placeholder
              updatedAt: new Date(0), // Placeholder

              data: null, // Asumimos null
              examId: null, // Asumimos null
              // Propiedad extendida
              progress: null, // SIEMPRE null en catálogo público
            };
            // --- FIN CORRECCIÓN ---

            return (
              <CourseCard
                key={apiCourse.id}
                course={courseCardProps}
                setLoading={setCatalogLoading} // Pasar la función setLoading específica
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400 col-span-full">
          <h2 className="text-xl font-semibold mb-2">
            No se encontraron cursos
          </h2>
          <p>Intenta ajustar tu búsqueda o revisa más tarde.</p>
        </div>
      )}
    </div>
  );
}

// Wrapper para Suspense
export default function CatalogPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto p-8 text-center text-slate-500 dark:text-slate-400">
          Cargando catálogo...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
