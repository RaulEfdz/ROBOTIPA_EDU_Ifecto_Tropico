// components/course-card.tsx
"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { BookOpen, Clock, Users, Star } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { CourseProgress } from "@/components/course-progress";
import type { Course, Category, Chapter } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { formatText } from "@/utils/formatTextMS";

/**
 * Extiende el tipo Course base con propiedades opcionales que pueden o no venir
 * y la propiedad 'progress' que indica si el usuario está inscrito.
 */
export interface CourseWithProgress extends Course {
  progress?: number | null;
  category?: Category | { id: string; name: string } | null;
  chapters?: Chapter[] | { id: string }[];
}

interface CourseCardProps {
  course: CourseWithProgress;
  setLoading: (value: boolean) => void;
  className?: string;
  variant?: "default" | "compact" | "featured";
}

export const CourseCard = ({
  course,
  setLoading,
  className,
  variant = "default",
}: CourseCardProps) => {
  const {
    id = "unknown-id",
    title = "Curso sin título",
    imageUrl = null,
    price = null,
    isPublished = false,
    category = null,
    chapters = [],
    progress = null,
    description = null,
  } = course || {};

  const imageSrc: string = imageUrl ?? "/images/course_placeholder.jpg";
  const categoryName: string =
    typeof category === "object" && category !== null && "name" in category
      ? category.name
      : "Sin categoría";
  const chaptersCount: number = Array.isArray(chapters) ? chapters.length : 0;
  const priceDisplay: string =
    price !== null && price > 0 ? formatPrice(price) : "Gratis";

  const router = useRouter();

  const determineTargetPath = () => {
    if (id === "unknown-id") {
      console.error(
        "CourseCard: No se puede navegar sin un ID de curso válido."
      );
      return null;
    }
    const isEnrolled = progress !== null;
    return isEnrolled
      ? `/courses/${id}/chapters/${chapters[0]?.id}`
      : `/pages/course/${id}/chapters/${chapters[0]?.id}`;
  };

  const handleNavigate = () => {
    const targetPath = determineTargetPath();
    if (!targetPath) return;
    setLoading(true);
    router.push(targetPath);
  };

  // Componente de insignia de categoría mejorado
  const CategoryBadge = () => {
    if (!categoryName || categoryName === "Sin categoría") return null;
    return (
      <div className="absolute top-3 right-3 z-20">
        <Badge
          variant="outline"
          className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-white/20 text-gray-700 dark:text-gray-200 text-xs font-semibold px-3 py-1 rounded-full shadow-lg hover:bg-white/95 dark:hover:bg-gray-900/95 transition-all duration-200"
        >
          {categoryName}
        </Badge>
      </div>
    );
  };

  // Componente de overlay con gradiente
  const ImageOverlay = () => (
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-xl" />
  );

  // Indicador de progreso visual
  const ProgressIndicator = () => {
    if (progress === null) return null;
    return (
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  // Renderizado para cursos no publicados
  if (!isPublished) {
    return (
      <div
        className={cn(
          "group relative overflow-hidden rounded-xl",
          "bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900",
          "border border-gray-200 dark:border-gray-700",
          "opacity-60 cursor-not-allowed",
          "shadow-sm",
          className
        )}
      >
        <div className="relative w-full aspect-video overflow-hidden">
          <Image
            fill
            className="object-cover opacity-40 grayscale filter blur-[1px]"
            alt={`(No publicado) ${title}`}
            src={imageSrc}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gray-900/20" />
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-600 dark:text-gray-400 text-lg line-clamp-2 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
            {categoryName}
          </p>
          <Badge variant="secondary" className="text-xs font-medium">
            No publicado
          </Badge>
        </div>
      </div>
    );
  }

  // Estilos base del componente
  const cardStyles = cn(
    "group relative overflow-hidden rounded-xl cursor-pointer",
    "bg-white dark:bg-gray-900",
    "border border-gray-200 dark:border-gray-800",
    "shadow-lg hover:shadow-2xl",
    "transform transition-all duration-300 ease-out",
    "hover:-translate-y-2 hover:scale-[1.02]",
    "focus:outline-none focus:ring-4 focus:ring-emerald-500/20",
    "h-full flex flex-col",
    {
      "max-w-sm": variant === "compact",
      "max-w-md": variant === "default",
      "max-w-lg border-2 border-gradient-to-r from-emerald-500 to-purple-600":
        variant === "featured",
    },
    className
  );

  return (
    <div
      onClick={handleNavigate}
      className={cardStyles}
      role="button"
      aria-label={`Ver detalles del curso ${title}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNavigate();
        }
      }}
    >
      {/* Sección de Imagen con efectos mejorados */}
      <div className="relative w-full aspect-video overflow-hidden">
        <Image
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          alt={`Portada del curso ${title}`}
          src={imageSrc}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={variant === "featured"}
        />
        <ImageOverlay />
        <CategoryBadge />
        <ProgressIndicator />

        {/* Indicador de curso gratuito/premium */}
        {price === 0 && (
          <div className="absolute top-3 left-3 z-20">
            <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 font-semibold">
              GRATIS
            </Badge>
          </div>
        )}
      </div>

      {/* Sección de Contenido mejorada */}
      <div className="flex flex-col flex-grow p-5 space-y-3">
        {/* Título del curso */}
        <div className="space-y-2">
          <h3
            className="font-bold text-xl text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 line-clamp-2 leading-tight"
            title={title}
          >
            {title}
          </h3>
        </div>

        {/* Metadatos del curso */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <IconBadge size="sm" icon={BookOpen} />
              <span className="font-medium">
                {chaptersCount} {chaptersCount === 1 ? "Capítulo" : "Capítulos"}
              </span>
            </div>

            {/* Indicador adicional para cursos con progreso */}
            {progress !== null && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-xs">En progreso</span>
              </div>
            )}
          </div>
        </div>

        {/* Separador sutil */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

        {/* Footer de la tarjeta mejorado */}
        <div className="mt-auto pt-2">
          {progress !== null ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Progreso del curso
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.round(progress)}%
                </span>
              </div>
              {/* <CourseProgress
                variant={progress === 100 ? "success" : "default"}
                size="sm"
                value={progress}
              /> */}
              <div className="h-2 bg-gray-200 dark:bg-gray-700" />
              {progress === 100 && (
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-xs font-semibold">¡Completado!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <Badge
                variant={price === 0 ? "secondary" : "default"}
                className={cn(
                  "text-lg font-bold px-4 py-2 rounded-lg",
                  price === 0
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gradient-to-r from-emerald-600 to-purple-600 text-white hover:from-emerald-700 hover:to-purple-700"
                )}
              >
                {priceDisplay}
              </Badge>

              {/* Indicador de llamada a la acción */}
              <div className="text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Clic para ver →
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      </div>
    </div>
  );
};
