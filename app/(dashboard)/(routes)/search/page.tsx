"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Book, Filter, BookOpen } from "lucide-react";

import { CoursesList } from "@/components/courses-list";
import { Categories } from "./_components/categories";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SearchInput } from "./_components/SearchInput";

const SearchContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const title = searchParams.get("title") || "";
  const categoryId = searchParams.get("categoryId") || "";

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, categoryId }),
      });

      if (!res.ok) {
        router.push("/");
        return;
      }

      const data = await res.json();
      setUser(data.user);
      setCategories(data.categories);
      setCourses(data.courses);
      setLoading(false);
    };

    fetchData();
  }, [title, categoryId]);

  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  const selectedCategory = categoryId
    ? categories.find((c) => c.id === categoryId)?.name
    : null;

  const isFiltered = !!title || !!categoryId;

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
                ? `Mostrando cursos en la categoría "${selectedCategory}"`
                : title
                ? `Resultados para "${title}"`
                : "Descubre todos nuestros cursos disponibles"}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SearchInput className="w-full sm:w-64" />
            <Button variant="outline" size="icon" className="hidden sm:flex" title="Filtros">
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
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <Categories items={categories} />
          </div>
        </div>

        {/* Resultados */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-slate-700">
              {courses.length > 0
                ? `${courses.length} curso${courses.length === 1 ? "" : "s"} encontrado${courses.length === 1 ? "" : "s"}`
                : "Resultados"}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Ordenar por:</span>
              <select className="text-sm border rounded-md px-2 py-1 bg-white">
                <option>Más recientes</option>
                <option>Popularidad</option>
                <option>Mejor valorados</option>
              </select>
            </div>
          </div>

          {courses.length > 0 ? (
            <CoursesList items={courses} />
          ) : (
            <Alert className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-8 text-center">
              <div className="flex justify-center mb-4">
                <Book className="h-12 w-12 text-slate-300" />
              </div>
              <AlertTitle className="text-xl font-semibold text-slate-800 mb-2">
                No se encontraron cursos
              </AlertTitle>
              <AlertDescription className="text-slate-600 max-w-md mx-auto">
                {isFiltered ? (
                  <>No hay cursos que coincidan con tu búsqueda.</>
                ) : (
                  <>No hay cursos disponibles en este momento.</>
                )}
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
    <Suspense fallback={<div className="text-center mt-10">Cargando búsqueda...</div>}>
      <SearchContent />
    </Suspense>
  );
}
