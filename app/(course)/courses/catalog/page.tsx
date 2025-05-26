// File: app/(course)/courses/catalog/page.tsx
"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ListFilter, Search, XCircle } from "lucide-react"; // Importado BookOpen desde lucide
import { CategoryItem } from "./components/category-item";
import {
  PublicCourseCard,
  PublicCourseCardProps,
} from "./components/public-course-card";
import CatalogHeader from "./components/CatalogHeader";

interface CatalogApiResponseCourse {
  id: string;
  title: string;
  imageUrl: string | null;
  chapters: { id: string }[];
  price: number | null;
  category: { id: string; name: string } | null;
  slug?: string;
  description?: string | null;
  createdAt?: string; // Asumimos que la API devuelve string, convertiremos a Date
  // Otros campos que pueda devolver tu API
}

interface CategoryForFilter {
  id: string;
  name: string;
}

type SortByType =
  | "recent"
  | "title_asc"
  | "title_desc"
  | "price_asc"
  | "price_desc";

function CatalogContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("categoryId");
  const initialTitle = searchParams.get("title");
  const initialSortBy = (searchParams.get("sortBy") as SortByType) || "recent";

  const [coursesFromApi, setCoursesFromApi] = useState<
    CatalogApiResponseCourse[]
  >([]);
  const [allCategories, setAllCategories] = useState<CategoryForFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialTitle || "");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    initialCategory
  );
  const [sortBy, setSortBy] = useState<SortByType>(initialSortBy);

  const [enrolledCourses, setEnrolledCourses] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategoryId)
          queryParams.set("categoryId", selectedCategoryId);
        if (searchTerm.trim()) queryParams.set("title", searchTerm.trim());
        // Nota: El ordenamiento por 'sortBy' se hace en el cliente en esta versión.
        // Si tu API soporta ordenamiento, añade: queryParams.set("sortBy", sortBy);

        const res = await fetch(
          `/api/public-courses?${queryParams.toString()}`
        );
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data: CatalogApiResponseCourse[] = await res.json();
        setCoursesFromApi(data);

        const uniqueCategories: CategoryForFilter[] = [];
        const categoryMap = new Map<string, string>();
        data.forEach((course) => {
          if (course.category && !categoryMap.has(course.category.id)) {
            categoryMap.set(course.category.id, course.category.name);
            uniqueCategories.push({
              id: course.category.id,
              name: course.category.name,
            });
          }
        });
        setAllCategories(
          uniqueCategories.sort((a, b) => a.name.localeCompare(b.name))
        );

        // Fetch enrollment status for each course
        const enrollmentStatus: Record<string, boolean> = {};
        await Promise.all(
          data.map(async (course) => {
            try {
              const res = await fetch(`/api/courses/${course.id}/is-enrolled`);
              if (res.ok) {
                const json = await res.json();
                enrollmentStatus[course.id] = json.isEnrolled;
              } else {
                enrollmentStatus[course.id] = false;
              }
            } catch {
              enrollmentStatus[course.id] = false;
            }
          })
        );
        setEnrolledCourses(enrollmentStatus);
      } catch (error: any) {
        console.error("Error fetching catalog data:", error);
        toast.error(
          `Error al cargar el catálogo: ${error.message || "Error desconocido"}`
        );
        setCoursesFromApi([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [selectedCategoryId, searchTerm, sortBy]); // No incluir router aquí para evitar re-fetches innecesarios por cambio de URL si solo es por UI

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Opcional: Actualizar URL al escribir (con debounce) o solo al enviar
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    updateUrlParams();
  };

  const clearSearch = () => {
    setSearchTerm("");
    // Es importante llamar a updateUrlParams DESPUÉS de cambiar el estado searchTerm
    // para que el efecto de useEffect se dispare con el valor correcto o
    // pasar el valor directamente a updateUrlParams.
    const params = new URLSearchParams(searchParams.toString());
    params.delete("title");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategoryId(categoryId);
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId) params.set("categoryId", categoryId);
    else params.delete("categoryId");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = e.target.value as SortByType;
    setSortBy(newSortBy);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", newSortBy);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Esta función actualiza la URL basada en los estados actuales.
  // Se puede llamar después de que un estado cambie y quieras reflejarlo en la URL.
  const updateUrlParams = () => {
    const params = new URLSearchParams(); // Empezar con params vacíos para evitar duplicados de useEffect
    if (searchTerm.trim()) params.set("title", searchTerm.trim());
    if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
    if (sortBy) params.set("sortBy", sortBy);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const sortedCourses = useMemo(() => {
    let SResult = [...coursesFromApi];
    switch (sortBy) {
      case "recent":
        SResult.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        break;
      case "title_asc":
        SResult.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "title_desc":
        SResult.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      case "price_asc":
        SResult.sort(
          (a, b) =>
            (a.price === null ? Infinity : a.price) -
            (b.price === null ? Infinity : b.price)
        );
        break;
      case "price_desc":
        SResult.sort(
          (a, b) =>
            (b.price === null ? -Infinity : b.price) -
            (a.price === null ? -Infinity : a.price)
        );
        break;
    }
    return SResult;
  }, [coursesFromApi, sortBy]);

  return (
    <>
      <CatalogHeader />
      <main className="bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Toaster position="top-center" richColors />

          <section className="text-center py-8 mb-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg shadow-lg">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Encuentra Tu Próximo Desafío
            </h1>
            <p className="text-lg text-emerald-100 mt-2 max-w-2xl mx-auto px-4">
              Explora nuestra amplia gama de cursos diseñados para potenciar tus
              habilidades.
            </p>
          </section>

          <section className="mb-8 p-4 sm:p-6 bg-white dark:bg-slate-800 rounded-lg shadow">
            <form
              onSubmit={handleSearchSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
            >
              <div className="md:col-span-2">
                <label
                  htmlFor="search-courses"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Buscar Curso
                </label>
                <div className="relative">
                  <Input
                    id="search-courses"
                    type="text"
                    placeholder="Escribe el nombre del curso..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()} // Buscar con Enter
                    className="pl-10 pr-10 py-2 w-full dark:bg-slate-700 dark:text-white rounded-md"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
                  {searchTerm && (
                    <XCircle
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300"
                      onClick={clearSearch}
                    />
                  )}
                </div>
              </div>
              <div>
                <label
                  htmlFor="sort-by"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Ordenar Por
                </label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full p-2 border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 dark:bg-slate-700 dark:text-white"
                >
                  <option value="recent">Más Recientes</option>
                  <option value="title_asc">Título (A-Z)</option>
                  <option value="title_desc">Título (Z-A)</option>
                  <option value="price_asc">Precio (Menor a Mayor)</option>
                  <option value="price_desc">Precio (Mayor a Menor)</option>
                </select>
              </div>
            </form>

            <div className="mt-6">
              <h3 className="text-md font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center">
                <ListFilter className="h-5 w-5 mr-2 text-slate-500 dark:text-slate-400" />
                Filtrar por Categoría
              </h3>
              <div className="flex flex-wrap gap-2 items-center">
                <CategoryItem
                  label="Todas"
                  value={undefined} // O un identificador especial como "all"
                  isSelected={!selectedCategoryId} // Aquí se pasa isSelected
                  onClick={() => handleCategorySelect(null)}
                />
                {allCategories.map((cat) => (
                  <CategoryItem
                    key={cat.id}
                    label={cat.name}
                    value={cat.id}
                    isSelected={selectedCategoryId === cat.id} // Aquí también
                    onClick={() => handleCategorySelect(cat.id)}
                  />
                ))}
              </div>
            </div>
          </section>

          {loading ? (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="border dark:border-slate-700 rounded-lg p-4 space-y-3 animate-pulse bg-white dark:bg-slate-800"
                >
                  <Skeleton className="aspect-video w-full rounded-md bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-8 w-1/3 mt-2 bg-slate-200 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          ) : sortedCourses.length > 0 ? (
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedCourses.map((apiCourse) => {
                if (!apiCourse || !apiCourse.id) {
                  console.warn("Datos de curso inválidos:", apiCourse);
                  return null;
                }
                const publicCourseCardProps: PublicCourseCardProps = {
                  id: apiCourse.id,
                  title: apiCourse.title,
                  imageUrl: apiCourse.imageUrl,
                  chaptersCount: apiCourse.chapters?.length || 0,
                  price: apiCourse.price,
                  categoryName: apiCourse.category?.name || null,
                  shortDescription: apiCourse.description || null,
                  slug: apiCourse.slug,
                  isEnrolled: enrolledCourses[apiCourse.id] || false,
                };
                return (
                  <PublicCourseCard
                    key={apiCourse.id}
                    {...publicCourseCardProps}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400 col-span-full">
              <AlertTriangle className="mx-auto h-12 w-12 text-amber-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-200">
                No se encontraron cursos
              </h2>
              <p>
                Intenta ajustar tu búsqueda o filtros, o explora todas nuestras{" "}
                <button
                  onClick={() => {
                    setSelectedCategoryId(null);
                    setSearchTerm("");
                    updateUrlParams();
                  }}
                  className="text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  categorías
                </button>
                .
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

export default function CatalogPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
          <div className="bg-white dark:bg-slate-900 shadow-md h-16 animate-pulse"></div>
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="text-center py-8 mb-8 bg-slate-200 dark:bg-slate-700 rounded-lg h-36 animate-pulse"></div>
            <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-lg shadow h-40 animate-pulse"></div>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="border dark:border-slate-700 rounded-lg p-4 space-y-3 animate-pulse bg-white dark:bg-slate-800"
                >
                  <Skeleton className="aspect-video w-full rounded-md bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700" />
                  <Skeleton className="h-8 w-1/3 mt-2 bg-slate-200 dark:bg-slate-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
