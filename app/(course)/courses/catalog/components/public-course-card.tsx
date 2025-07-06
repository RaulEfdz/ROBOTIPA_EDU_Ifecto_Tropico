// components/public-course-card.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Star,
  CheckCircle,
  Play,
  Eye,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import PaymentButton from "@/app/payments/PaymentButton";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface PublicCourseCardProps {
  id: string;
  title: string;
  imageUrl: string | null;
  chaptersCount: number;
  price: number | null;
  categoryName: string | null;
  shortDescription?: string | null;
  slug?: string;
  isEnrolled?: boolean;
  variant?: "default" | "featured" | "compact";
  className?: string;
  rating?: number;
  studentsCount?: number;
  isBestseller?: boolean;
  isNew?: boolean;
}

export const PublicCourseCard = ({
  id,
  title,
  imageUrl,
  chaptersCount,
  price,
  categoryName,
  shortDescription,
  slug,
  isEnrolled = false,
  variant = "default",
  className,
  rating,
  studentsCount,
  isBestseller = false,
  isNew = false,
}: PublicCourseCardProps) => {
  const courseLink = slug ? `/pages/course/${slug}` : `/pages/course/${id}`;
  const resolvedCourseLink = isEnrolled ? `/courses/${id}` : courseLink;
  const imageSrc = imageUrl || "/images/course-placeholder.webp";
  const priceDisplay =
    price !== null && price > 0 ? formatPrice(price) : "Gratis";
  const isFree = price === null || price === 0;

  // Componente de insignias especiales
  const SpecialBadges = () => (
    <div className="absolute top-3 left-3 z-20 flex flex-col gap-2">
      {isBestseller && (
        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 font-bold text-xs px-2.5 py-1 shadow-lg">
          🏆 BESTSELLER
        </Badge>
      )}
      {isNew && (
        <Badge
          className="text-white border-0 font-bold text-xs px-2.5 py-1 shadow-lg"
          style={{
            background: 'linear-gradient(to right, green, var(--primary))'
          }}
        >
          ✨ NUEVO
        </Badge>
      )}
      {isFree && (
        <Badge
          className="text-white border-0 font-bold text-xs px-2.5 py-1 shadow-lg"
          style={{
            background: 'linear-gradient(to right, var(--primary), purple)'
          }}
        >
          GRATIS
        </Badge>
      )}
    </div>
  );

  // Componente de insignia de categoría
  const CategoryBadge = () => {
    if (!categoryName) return null;
    return (
      <div className="absolute top-3 right-3 z-20">
        <Badge
          variant="outline"
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-white/30 text-gray-700 dark:text-gray-200 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-900 transition-all duration-200"
        >
          {categoryName}
        </Badge>
      </div>
    );
  };

  // Componente de overlay con efectos
  const ImageOverlay = () => (
    <>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      {/* Efecto de play button en hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full p-3 shadow-2xl">
          <Play className="w-6 h-6 text-primary-600 dark:text-primary-400 fill-current" />
        </div>
      </div>
    </>
  );

  // Componente de rating
  const RatingDisplay = () => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-1 text-amber-500">
        <Star className="w-4 h-4 fill-current" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {rating.toFixed(1)}
        </span>
      </div>
    );
  };

  // Estilos del card
  const cardStyles = cn(
    "group h-full overflow-hidden rounded-xl border",
    "bg-white dark:bg-gray-900",
    "border-gray-200 dark:border-gray-800",
    "shadow-lg hover:shadow-2xl",
    "transform transition-all duration-300 ease-out",
    "hover:-translate-y-2 hover:scale-[1.02]",
    "flex flex-col cursor-pointer",
    {
      "max-w-sm": variant === "compact",
      "max-w-md": variant === "default",
      "max-w-lg border-2 shadow-xl": // Gradiente eliminado, usar color sólido dinámico si es necesario
        variant === "featured",
    },
    className
  );

  const buttonStyles = cn(
    "w-full font-semibold transition-all duration-300",
    "shadow-lg hover:shadow-xl transform hover:scale-[1.02]",
    "text-white"
  );

  return (
    <Card className={cardStyles}>
      <CardHeader className="p-0 relative">
        <Link
          href={resolvedCourseLink}
          aria-label={`Ver detalles del curso ${title}`}
          className="block focus:outline-none focus:ring-4 focus:ring-primary-500/20 rounded-t-xl"
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
            <Image
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              src={imageSrc}
              alt={`Imagen del curso ${title}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={variant === "featured"}
            />
            <ImageOverlay />
            <SpecialBadges />
            <CategoryBadge />

            {/* Indicador de inscripción */}
            {isEnrolled && (
              <div className="absolute bottom-3 left-3 z-20">
                <Badge className="bg-primary-600 text-white border-0 font-semibold text-xs px-2.5 py-1 shadow-lg flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  INSCRITO
                </Badge>
              </div>
            )}
          </div>
        </Link>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-5 space-y-4">
        <Link
          href={resolvedCourseLink}
          className="flex-1 space-y-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 rounded-lg"
        >
          {/* Título del curso */}
          <h3 className="line-clamp-2 text-xl font-bold leading-tight text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-primary-600 dark:group-hover:text-primary-400">
            {title}
          </h3>

          {/* Descripción */}
          {shortDescription && (
            <p className="line-clamp-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {shortDescription}
            </p>
          )}
        </Link>

        {/* Metadatos del curso */}
        <div className="space-y-3">
          {/* Rating y estadísticas */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <RatingDisplay />
              {studentsCount && (
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <Eye className="w-4 h-4" />
                  <span>{studentsCount.toLocaleString()} estudiantes</span>
                </div>
              )}
            </div>
          </div>

          {/* Capítulos */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
              <BookOpen className="h-4 w-4 text-primary-500 dark:text-primary-400" />
              <span className="font-medium">
                {chaptersCount} {chaptersCount === 1 ? "Capítulo" : "Capítulos"}
              </span>
            </div>
          </div>

          {/* Separador con gradiente */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

          {/* Precio */}
          <div className="flex items-center justify-between">
            {price !== null ? (
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-2xl font-bold",
                    isFree
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-900 dark:text-white"
                  )}
                >
                  {priceDisplay}
                </span>
                {!isFree && (
                  <Badge
                    variant="outline"
                    className="text-xs text-gray-500 dark:text-gray-400"
                  >
                    Precio único
                  </Badge>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                Precio no disponible
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button asChild size="lg" className={buttonStyles}>
          <Link
            href={resolvedCourseLink}
            className="flex items-center justify-center gap-2"
          >
            {isEnrolled ? (
              <>
                <Play className="w-4 h-4" />
                Continuar Curso
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Ver Detalles
              </>
            )}
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>

      {/* Efecto de brillo en hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
      </div>
    </Card>
  );
};
