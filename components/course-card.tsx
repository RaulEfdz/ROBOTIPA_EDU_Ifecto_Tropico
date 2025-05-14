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
  course: any; // Recibe el objeto curso completo (o adaptado)
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
  const handleNavigate = () => {
    if (id === "unknown-id") {
      console.error(
        "CourseCard: No se puede navegar sin un ID de curso válido."
      );
      return; // No navegar si no hay ID
    }
    setLoading(true); // Indica que la navegación/carga ha comenzado
    const isEnrolled = progress !== null; // Determina si el usuario está inscrito

    // Define la ruta de destino según si está inscrito o no
    const targetPath = isEnrolled
      ? `/courses/${id}` // Usuario inscrito -> Vista interna del curso
      : `/pages/course/${id}`; // Usuario no inscrito -> Página de detalle pública

    router.push(targetPath); // Navega a la ruta destino
    // setLoading(false) no se llama aquí; la nueva página manejará su propio estado de carga.
  };

  // Componente interno para renderizar la insignia de categoría
  const CategoryBadge = () => {
    // No renderizar si no hay nombre de categoría o es el valor por defecto
    if (!categoryName || categoryName === "Sin categoría") return null;
    return (
      <Badge
        variant="outline" // Usa variantes de Badge si las tienes definidas
        className="absolute top-2 right-2 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium px-2 py-0.5 rounded-full shadow-sm"
      >
        {categoryName}
      </Badge>
    );
  };

  // Renderizado especial si el curso no está publicado
  if (!isPublished) {
    return (
      <div className="group relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shadow-sm h-full opacity-70 cursor-not-allowed">
        <div className="relative w-full aspect-video overflow-hidden rounded-t-lg bg-slate-100 dark:bg-slate-700">
          <Image
            fill
            className="object-cover opacity-40 grayscale" // Estilo visual de no disponible
            alt={`(No publicado) ${title}`}
            src={imageSrc}
          />
        </div>
        <div className="flex flex-col p-3">
          <h3 className="text-base font-medium text-slate-600 dark:text-slate-400 line-clamp-2 mb-1">
            {title}
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
            {categoryName}
          </p>
          <Badge variant="secondary" className="self-start text-xs">
            {" "}
            {/* Usa variante secondary */}
            No publicado
          </Badge>
        </div>
      </div>
    );
  }

  // Renderizado normal para cursos publicados
  return (
    // Usa un div clickeable para poder llamar a setLoading antes de la navegación
    <div
      onClick={handleNavigate}
      className="cursor-pointer h-full block focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 rounded-lg" // Estilos de foco para accesibilidad
      role="link"
      aria-label={`Ver detalles del curso ${title}`}
      tabIndex={0} // Permite que el div reciba foco
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleNavigate();
      }} // Activar con teclado
    >
      <div className="group relative flex flex-col rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full">
        {/* Sección de Imagen */}
        <div className="relative w-full aspect-video overflow-hidden rounded-t-lg">
          <Image
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            alt={`Portada del curso ${title}`} // Alt más descriptivo
            src={imageSrc}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" // Ajusta sizes para optimización
            priority={false} // Generalmente no es prioritario en una lista
          />
          <CategoryBadge />
        </div>

        {/* Sección de Contenido */}
        <div className="flex flex-col flex-grow p-3">
          {" "}
          {/* flex-grow empuja el footer (precio/progreso) hacia abajo */}
          <h3
            className="text-base font-medium text-slate-800 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors duration-200 line-clamp-2 mb-1"
            title={title}
          >
            {title}
          </h3>
          {/* Detalles (Número de Capítulos) */}
          <div className="flex items-center gap-x-1 text-slate-500 dark:text-slate-400 text-xs mt-1 mb-3">
            <IconBadge size="sm" icon={BookOpen} />
            <span>
              {chaptersCount} {chaptersCount === 1 ? "Capítulo" : "Capítulos"}
            </span>
          </div>
          {/* Footer de la tarjeta: Muestra Progreso o Precio */}
          <div className="mt-auto pt-2">
            {" "}
            {/* mt-auto empuja esto al fondo */}
            {progress !== null ? (
              // Si está inscrito (progreso no es null), muestra la barra de progreso
              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Progreso
                </span>
                <CourseProgress
                  variant={progress === 100 ? "success" : "default"}
                  size="sm"
                  value={progress}
                />
                {/* Opcional: Badge de completado */}
                {/* {progress === 100 && (
                        <Badge variant="outline" className="mt-1 text-xs bg-emerald-50 ...">
                           Completado
                        </Badge>
                    )} */}
              </div>
            ) : (
              // Si no está inscrito, muestra el precio
              <Badge
                variant={price === 0 ? "secondary" : "default"}
                className="text-sm font-semibold"
              >
                {/* Usa 'secondary' para Gratis, 'default' para precio */}
                {priceDisplay}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
