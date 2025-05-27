// components/course-card.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { BookOpen } from "lucide-react"; // Solo BookOpen es necesario aquí
import { IconBadge } from "@/components/icon-badge";
import { CourseProgress } from "@/components/course-progress";
// Asegúrate que la ruta y los tipos sean correctos según tu proyecto Prisma
import type { Course, Category, Chapter } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format"; // Asegúrate de que esta utilidad exista y funcione

/**
 * Extiende el tipo Course base con propiedades opcionales que pueden o no venir
 * y la propiedad 'progress' que indica si el usuario está inscrito.
 */
export interface CourseWithProgress extends Course {
  progress?: number | null; // null o undefined si no está inscrito, número si lo está
  // Tipos flexibles para category y chapters porque pueden venir completos o simplificados
  category?: Category | { id: string; name: string } | null;
  chapters?: Chapter[] | { id: string }[];
}

interface CourseCardProps {
  course: CourseWithProgress; // Usa el tipo específico CourseWithProgress
  setLoading: (value: boolean) => void; // Función para indicar estado de carga al navegar
}

export const CourseCard = ({ course, setLoading }: CourseCardProps) => {
  // Desestructura las propiedades necesarias del objeto 'course'
  // Usa valores por defecto seguros para evitar errores si alguna propiedad falta inesperadamente
  const {
    id = "unknown-id", // ID es crucial, fallback por si acaso
    title = "Curso sin título",
    imageUrl = null, // Permitir null
    price = null, // Permitir null
    isPublished = false, // Asumir no publicado si no se especifica
    category = null,
    chapters = [], // Array vacío por defecto
    progress = null, // null por defecto
  } = course || {}; // Añadir objeto vacío como fallback si 'course' fuera undefined

  // Manejo seguro de valores y cálculo de derivados
  const imageSrc: string = imageUrl ?? "/images/course_placeholder.jpg"; // Placeholder obligatorio
  // Extrae el nombre de la categoría de forma segura, sea objeto completo o simplificado
  const categoryName: string =
    typeof category === "object" && category !== null && "name" in category
      ? category.name
      : "Sin categoría";
  const chaptersCount: number = Array.isArray(chapters) ? chapters.length : 0;
  const priceDisplay: string =
    price !== null && price > 0 ? formatPrice(price) : "Gratis"; // Usa la función formatPrice

  const router = useRouter();

  // Lógica para manejar la navegación al hacer clic en la tarjeta
  const determineTargetPath = () => {
    if (id === "unknown-id") {
      console.error(
        "CourseCard: No se puede navegar sin un ID de curso válido."
      );
      return null; // No navegar si no hay ID
    }
    const isEnrolled = progress !== null; // Determina si el usuario está inscrito
    return isEnrolled
      ? `/courses/${id}/chapters/${chapters[0].id}`
      : `/pages/course/${id}/chapters/${chapters[0].id}`;
  };

  const handleNavigate = () => {
    const targetPath = determineTargetPath();
    if (!targetPath) return;
    setLoading(true); // Indica que la navegación/carga ha comenzado
    router.push(targetPath); // Navega a la ruta destino
    // setLoading(false) no se llama aquí; la nueva página manejará su propio estado de carga.
  };

  // Componente interno para renderizar la insignia de categoría
  const CategoryBadge = () => {
    // No renderizar si no hay nombre de categoría o es el valor por defecto
    if (!categoryName || categoryName === "Sin categoría") return null;
    return (
      <Badge
        variant="outline"
        className="absolute top-2 right-2 z-10 bg-bg-base/80 dark:bg-brand-primary/80 backdrop-blur-sm border-border-default dark:border-brand-primary text-text-heading dark:text-text-body text-xs font-medium px-2 py-0.5 rounded-full shadow-sm"
      >
        {categoryName}
      </Badge>
    );
  };

  // Renderizado especial si el curso no está publicado
  if (!isPublished) {
    return (
      <div className="card-base group relative opacity-70 cursor-not-allowed shadow-md shadow-slate-400 dark:shadow-slate-900">
        <div className="relative w-full aspect-video overflow-hidden rounded-t-lg bg-bg-card">
          <Image
            fill
            className="object-cover opacity-40 grayscale"
            alt={`(No publicado) ${title}`}
            src={imageSrc}
          />
        </div>
        <div className="flex flex-col p-3">
          <h3 className="title-h3 line-clamp-2 mb-1">{title}</h3>
          <p className="text-xs text-text-body mb-2">{categoryName}</p>
          <Badge variant="secondary" className="self-start text-xs">
            No publicado
          </Badge>
        </div>
      </div>
    );
  }

  // Renderizado normal para cursos publicados
  return (
    <div
      onClick={handleNavigate}
      className="cursor-pointer h-full block focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 rounded-lg shadow-lg shadow-slate-300 dark:shadow-slate-900 hover:shadow-2xl transition-shadow duration-300"
      role="link"
      aria-label={`Ver detalles del curso ${title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleNavigate();
      }}
    >
      <div className="card-base group relative flex flex-col h-full">
        {/* Sección de Imagen */}
        <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
          <Image
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            alt={`Portada del curso ${title}`}
            src={imageSrc}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
          <CategoryBadge />
        </div>

        {/* Sección de Contenido */}
        <div className="flex flex-col flex-grow p-3">
          <h3
            className="title-h3 group-hover:text-brand-primary transition-colors duration-200 line-clamp-2 mb-1"
            title={title}
          >
            {title}
          </h3>
          {/* Detalles (Número de Capítulos) */}
          <div className="flex items-center gap-x-1 text-text-body text-xs mt-1 mb-3">
            <IconBadge size="sm" icon={BookOpen} />
            <span>
              {chaptersCount} {chaptersCount === 1 ? "Capítulo" : "Capítulos"}
            </span>
          </div>
          {/* Footer de la tarjeta: Muestra Progreso o Precio */}
          <div className="mt-auto pt-2">
            {progress !== null ? (
              <div className="space-y-1">
                <span className="text-xs text-text-body">Progreso</span>
                <CourseProgress
                  variant={progress === 100 ? "success" : "default"}
                  size="sm"
                  value={progress}
                />
              </div>
            ) : (
              <Badge
                variant={price === 0 ? "secondary" : "default"}
                className="text-sm font-semibold"
              >
                {priceDisplay}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
