"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { BookOpen, Clock } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { CourseProgress } from "@/components/course-progress";
import type { Course } from "@/prisma/types";
import { Badge } from "@/components/ui/badge";

/**
 * Extiende Course con progreso opcional
 */
export interface CourseWithProgress extends Course {
  progress?: number | null;
}

interface CourseCardProps {
  course: CourseWithProgress;
  setLoading(value: boolean): void;
}

export const CourseCard = ({ course, setLoading }: CourseCardProps) => {
  // Desestructuramos todos los campos del modelo, incluso si no se usan aún
  const {
    id,
    userId,
    title,
    description,
    imageUrl,
    price,
    isPublished,
    delete: deleted,
    categoryId,
    category,
    chapters,
    attachments,
    purchases,
    data,
    createdAt,
    updatedAt,
    user,
    progress = null,
  } = course;

  // Garantiza una URL de imagen válida (string) para Next/Image
  const imageSrc: string = imageUrl ?? "/placeholder.png";
  // Asegura que price sea número para formatear
  const priceValue: number = price ?? 0;

  const router = useRouter();
  const handleNavigate = () => {
    setLoading(true);
    // Verificar si el usuario ya está inscrito (tiene compras)
    const isEnrolled = Array.isArray(purchases) && purchases.length > 0;
    // Redirigir según estado de inscripción
    const targetPath = isEnrolled ? `/courses/${id}` : `/pages/course/${id}`;
    router.push(targetPath);
  };

  const CategoryBadge = () =>
    category && (
      <Badge className="absolute top-2 right-2 bg-TextCustom/80 text-slate-800 hover:bg-TextCustom/90 transition-all text-xs font-medium">
        {category.name}
      </Badge>
    );

  if (!isPublished) {
    return (
      <div className="group relative rounded-lg overflow-hidden border border-slate-200 bg-TextCustom shadow-sm h-full transition-all">
        <div className="relative w-full aspect-video overflow-hidden rounded-t-lg bg-slate-100">
          <Image
            fill
            className="object-cover opacity-30 grayscale"
            alt={title}
            src={imageSrc}
          />
          <div className="absolute inset-0 bg-slate-200/40 backdrop-blur-[1px]" />
        </div>
        <div className="flex flex-col p-4 opacity-60">
          <h3 className="text-lg font-semibold text-slate-800 line-clamp-2 mb-1">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mb-3">{category?.name}</p>
          <Badge className="self-start bg-slate-200 text-slate-700 hover:bg-slate-300">
            No disponible
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div onClick={handleNavigate} className="cursor-pointer h-full">
      <div className="group relative rounded-lg overflow-hidden border border-slate-200 bg-TextCustom shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 h-full">
        <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
          <Image
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            alt={title}
            src={imageSrc}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <CategoryBadge />
        </div>
        <div className="flex flex-col p-4">
          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-sky-700 transition-colors duration-300 line-clamp-2 mb-1">
            {title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-3 mb-4">
            <div className="flex items-center gap-x-1 text-slate-600 text-sm">
              <IconBadge size="sm" icon={BookOpen} />
              <span>
                {chapters.length}{" "}
                {chapters.length === 1 ? "Capítulo" : "Capítulos"}
              </span>
            </div>
            {progress !== null && (
              <div className="flex items-center gap-x-1 text-slate-600 text-sm">
                <IconBadge size="sm" icon={Clock} />
                <span>{progress}%</span>
              </div>
            )}
          </div>
          {progress !== null ? (
            <div className="mt-auto">
              <p className="text-xs text-slate-500 mb-1">Tu progreso</p>
              <CourseProgress
                variant={progress === 100 ? "success" : "default"}
                size="sm"
                value={progress}
              />
              {progress === 100 && (
                <Badge className="mt-2 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0">
                  Completado
                </Badge>
              )}
            </div>
          ) : priceValue > 0 ? (
            <div className="mt-auto">
              <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-200 border-0">
                {new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(priceValue)}
              </Badge>
            </div>
          ) : (
            <Badge className="mt-auto bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0">
              Gratis
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};
