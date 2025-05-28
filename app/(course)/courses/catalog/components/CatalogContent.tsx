// File: app/(course)/courses/catalog/components/CatalogContent.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { toast, Toaster } from "sonner";
import { AlertTriangle } from "lucide-react";

import CatalogHeader from "./CatalogHeader";
import CatalogSearch from "./CatalogSearch";
import CategoryFilter from "./CategoryFilter";
import CourseGrid from "./CourseGrid";
import EmptyState from "./EmptyState";
import LoadingSkeleton from "./LoadingSkeleton";

interface CatalogApiResponseCourse {
  id: string;
  title: string;
  imageUrl: string | null;
  chapters: { id: string }[];
  price: number | null;
  category: { id: string; name: string } | null;
  slug?: string;
  description?: string | null;
  createdAt?: string;
}

interface CategoryForFilter {
  id: string;
  name: string;
}

export type SortByType =
  | "recent"
  | "title_asc"
  | "title_desc"
  | "price_asc"
  | "price_desc";

export default function CatalogContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialCategory = searchParams.get("categoryId");
  const initialTitle = searchParams.get("title");
  const initialSortBy = (searchParams.get("sortBy") as SortByType) || "recent";

  const [courses, setCourses] = useState<CatalogApiResponseCourse[]>([]);
  const [categories, setCategories] = useState<CategoryForFilter[]>([]);
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
    const fetchData = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategoryId)
          queryParams.set("categoryId", selectedCategoryId);
        if (searchTerm.trim()) queryParams.set("title", searchTerm.trim());

        const res = await fetch(
          `/api/public-courses?${queryParams.toString()}`
        );
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const data: CatalogApiResponseCourse[] = await res.json();

        setCourses(data);

        const categoryMap = new Map<string, string>();
        const uniqueCategories = data.reduce<CategoryForFilter[]>(
          (acc, course) => {
            if (course.category && !categoryMap.has(course.category.id)) {
              categoryMap.set(course.category.id, course.category.name);
              acc.push(course.category);
            }
            return acc;
          },
          []
        );
        setCategories(
          uniqueCategories.sort((a, b) => a.name.localeCompare(b.name))
        );

        const status: Record<string, boolean> = {};
        await Promise.all(
          data.map(async (course) => {
            try {
              const res = await fetch(`/api/courses/${course.id}/is-enrolled`);
              status[course.id] = res.ok
                ? (await res.json()).isEnrolled
                : false;
            } catch {
              status[course.id] = false;
            }
          })
        );
        setEnrolledCourses(status);
      } catch (err: any) {
        toast.error(
          `Error al cargar el catálogo: ${err.message || "Error desconocido"}`
        );
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategoryId, searchTerm, sortBy]);

  const sortedCourses = useMemo(() => {
    let sorted = [...courses];
    switch (sortBy) {
      case "recent":
        sorted.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        break;
      case "title_asc":
        sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        break;
      case "title_desc":
        sorted.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        break;
      case "price_asc":
        sorted.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
        break;
      case "price_desc":
        sorted.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
        break;
    }
    return sorted;
  }, [courses, sortBy]);

  const updateParams = () => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("title", searchTerm.trim());
    if (selectedCategoryId) params.set("categoryId", selectedCategoryId);
    if (sortBy) params.set("sortBy", sortBy);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

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

          <CatalogSearch
            searchTerm={searchTerm}
            sortBy={sortBy}
            onSearchTermChange={setSearchTerm}
            onSortByChange={setSortBy}
            onSearchSubmit={updateParams}
            clearSearch={() => {
              setSearchTerm("");
              updateParams();
            }}
          />

          <CategoryFilter
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onCategoryChange={(categoryId) => {
              setSelectedCategoryId(categoryId);
              updateParams();
            }}
          />

          {loading ? (
            <LoadingSkeleton />
          ) : sortedCourses.length > 0 ? (
            <CourseGrid
              courses={sortedCourses}
              enrolledStatus={enrolledCourses}
            />
          ) : (
            <EmptyState
              resetFilters={() => {
                setSearchTerm("");
                setSelectedCategoryId(null);
                updateParams();
              }}
            />
          )}
        </div>
      </main>
    </>
  );
}
