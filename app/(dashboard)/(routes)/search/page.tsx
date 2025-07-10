"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Book, Filter, BookOpen } from "lucide-react";

import { CoursesList } from "@/components/courses-list";
import { Categories } from "./_components/categories";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SearchInput } from "./_components/SearchInput";

const SearchContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const title = searchParams?.get("title")?.trim() || "";
  const categoryId = searchParams?.get("categoryId")?.trim() || "";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // Armar payload solo con filtros activos
      const payload: Record<string, string> = {};
      if (title) payload.title = title;
      if (categoryId) payload.categoryId = categoryId;

      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          // Si el backend retorna error, redirigimos o lo mostramos
          router.push("/");
          return;
        }

        const data = await res.json();
        setUser(data.user);
        setCategories(data.categories);
        setCourses(data.courses);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError("Hubo un problema al cargar los cursos. Intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [title, categoryId, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center mt-10">
        {/* Aquí podrías usar tu propio spinner */}
        <svg
          className="animate-spin h-8 w-8 text-slate-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-label="Cargando"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mx-auto max-w-md mt-10">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const selectedCategory = categoryId
    ? categories.find((c) => c.id === categoryId)?.name || null
    : null;

  const isFiltered = Boolean(title || categoryId);

  return (
    <div className="max-w-7xl mx-auto">
      <section className="px-4 sm:px-6 py-8">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Explorar cursos
            </h1>
            <p className="text-slate-500 mt-1">
              {selectedCategory
                ? `Mostrando cursos en la categoría “${selectedCategory}”`
                : title
                  ? `Resultados para “${title}”`
                  : "Descubre todos nuestros cursos disponibles"}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SearchInput className="w-full sm:w-64" />
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex"
              title="Filtros"
              aria-label="Filtros"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Categorías */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-slate-700 mb-3 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-slate-500" />
            Categorías
          </h2>
          <div className="bg-TextCustom rounded-lg shadow-sm border border-slate-200 p-4">
            <Categories items={categories} />
          </div>
        </div>

        {/* Resultados */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-slate-700">
              {courses.length > 0
                ? `${courses.length} curso${
                    courses.length === 1 ? "" : "s"
                  } encontrado${courses.length === 1 ? "" : "s"}`
                : "Resultados"}
            </h2>
            <div className="flex items-center gap-2">
              <label htmlFor="order-select" className="sr-only">
                Ordenar por
              </label>
              <span className="text-sm text-slate-500">Ordenar por:</span>
              <select
                id="order-select"
                className="text-sm border rounded-md px-2 py-1 bg-TextCustom"
                aria-label="Ordenar resultados"
              >
                <option value="recent">Más recientes</option>
                {/* <option value="popularity">Popularidad</option> */}
                {/* <option value="rating">Mejor valorados</option> */}
              </select>
            </div>
          </div>

          {courses.length > 0 ? (
            <CoursesList items={courses} />
          ) : (
            <Alert className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <Book className="h-12 w-12 text-slate-300" aria-hidden="true" />
              </div>
              <AlertTitle className="text-xl font-semibold text-slate-800 mb-2">
                No se encontraron cursos
              </AlertTitle>
              <AlertDescription className="text-slate-600 max-w-md mx-auto">
                {isFiltered
                  ? "No hay cursos que coincidan con tu búsqueda."
                  : "No hay cursos disponibles en este momento."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </section>
    </div>
  );
};

// Wrapping the actual content in Suspense
export default function PageWrapper() {
  return (
    <Suspense
      fallback={<div className="text-center mt-10">Cargando búsqueda...</div>}
    >
      <SearchContent />
    </Suspense>
  );
}
