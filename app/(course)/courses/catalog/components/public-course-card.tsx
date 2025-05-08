// components/public-course-card.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react"; // Removidos Clock, Tag, DollarSign si no se usan directamente aquí
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"; // Removido CardTitle si no se usa aquí
import { formatPrice } from "@/lib/format";

export interface PublicCourseCardProps {
  id: string;
  title: string;
  imageUrl: string | null;
  chaptersCount: number;
  price: number | null;
  categoryName: string | null;
  shortDescription?: string | null;
  slug?: string;
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
}: PublicCourseCardProps) => {
  const courseLink = slug ? `/pages/course/${slug}` : `/pages/course/${id}`;

  return (
    <Card className="group h-full overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-lg dark:bg-slate-800 dark:border-slate-700 flex flex-col">
      <CardHeader className="p-0">
        <Link href={courseLink} aria-label={`Ver detalles del curso ${title}`}>
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              src={imageUrl || "/images/course-placeholder.webp"}
              alt={`Imagen del curso ${title}`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {categoryName && (
              <Badge
                variant="secondary"
                className="absolute top-3 right-3 bg-white/80 px-2.5 py-1 text-xs font-semibold text-sky-700 backdrop-blur-sm dark:bg-slate-900/70 dark:text-sky-300"
              >
                {categoryName}
              </Badge>
            )}
          </div>
        </Link>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col p-4">
        <Link href={courseLink} className="flex-1">
          <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-tight text-slate-800 transition-colors group-hover:text-sky-600 dark:text-slate-100 dark:group-hover:text-sky-400">
            {title}
          </h3>
          {shortDescription && (
            <p className="mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
              {shortDescription}
            </p>
          )}
        </Link>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-sky-500" />
              <span>
                {chaptersCount} {chaptersCount === 1 ? "Capítulo" : "Capítulos"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {price !== null ? (
              <p className="text-xl font-semibold text-slate-700 dark:text-slate-200">
                {price > 0 ? formatPrice(price) : "Gratis"}
              </p>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Precio no disponible
              </p>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          size="sm"
          className="w-full bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
        >
          <Link href={courseLink}>
            Ver Detalles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
