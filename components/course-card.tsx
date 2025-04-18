import Image from "next/image";
import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";
import { IconBadge } from "@/components/icon-badge";
import { CourseProgress } from "@/components/course-progress";
import { Badge } from "./ui/badge";

interface CourseCardProps {
  id: string;
  title: string;
  imageUrl: string;
  chaptersLength: number;
  price: number;
  progress: number | null;
  category: string;
  isPublished?: boolean;
  setLoading(value: boolean): void;
  estimatedTime?: string; // Nueva propiedad opcional para tiempo estimado
};

export const CourseCard = ({
  id,
  title,
  imageUrl,
  chaptersLength,
  price,
  progress,
  category,
  isPublished,
  setLoading,
  estimatedTime
}: CourseCardProps) => {
  // Componente de insignia de categoría
  const CategoryBadge = () => (
    <Badge className="absolute top-2 right-2 bg-TextCustom/80 text-slate-800 hover:bg-TextCustom/90 transition-all text-xs font-medium">
      {category}
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
            src={imageUrl} 
          />
          <div className="absolute inset-0 bg-slate-200/40 backdrop-blur-[1px]"></div>
        </div>
        
        <div className="flex flex-col p-4 opacity-60">
          <h3 className="text-lg font-semibold text-slate-800 line-clamp-2 mb-1">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mb-3">
            {category}
          </p>
          
          <Badge className="self-start bg-slate-200 text-slate-700 hover:bg-slate-300">
            No disponible
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <Link 
      href={`/courses/${id}`} 
      onClick={() => setLoading(true)}
      className="block h-full"
    >
      <div className="group relative rounded-lg overflow-hidden border border-slate-200 bg-TextCustom shadow-sm hover:shadow-md transition-all duration-300 h-full transform hover:-translate-y-1">
        <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
          <Image
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            alt={title}
            src={imageUrl}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <CategoryBadge />
        </div>
        
        <div className="flex flex-col p-4">
          <h3 className="text-lg font-semibold text-slate-800 group-hover:text-sky-700 transition-colors duration-300 line-clamp-2 mb-1">
            {title}
          </h3>
          
          <div className="flex flex-wrap items-center gap-3 mt-3 mb-4">
            <div className="flex items-center gap-x-1 text-slate-600 text-sm">
              <IconBadge size="sm" icon={BookOpen} />
              <span>{chaptersLength} {chaptersLength === 1 ? "Capítulo" : "Capítulos"}</span>
            </div>
            
            {estimatedTime && (
              <div className="flex items-center gap-x-1 text-slate-600 text-sm">
                <IconBadge size="sm" icon={Clock} />
                <span>{estimatedTime}</span>
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
          ) : (
            price > 0 ? (
              <div className="mt-auto">
                <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-200 border-0">
                  {new Intl.NumberFormat('es-MX', { 
                    style: 'currency', 
                    currency: 'MXN' 
                  }).format(price)}
                </Badge>
              </div>
            ) : (
              <Badge className="mt-auto bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0">
                Gratis
              </Badge>
            )
          )}
        </div>
      </div>
    </Link>
  );
};