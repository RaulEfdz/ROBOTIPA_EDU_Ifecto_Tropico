"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Play,
  Lock,
  Crown,
  ChevronRight,
  Clock,
} from "lucide-react";

interface CourseSidebarItemProps {
  label: string;
  id: string;
  isCompleted: boolean;
  courseId: string;
  isPreviousCompleted: boolean;
  isFirstChapter: boolean;
  hasPurchase: boolean;
  isFree: boolean;
}

export const CourseSidebarItem = ({
  label,
  id,
  isCompleted,
  courseId,
  isPreviousCompleted,
  isFirstChapter,
  hasPurchase,
  isFree,
}: CourseSidebarItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = pathname?.includes(id);

  // Lógica de bloqueo mejorada
  const isLockedByPayment = !isFree && !hasPurchase;
  const isLockedSequentially =
    !isFirstChapter && !isPreviousCompleted && hasPurchase;
  const isLocked = isLockedByPayment || isLockedSequentially;

  // Selección de iconos siguiendo el brand
  const getIcon = () => {
    if (isCompleted) {
      return <CheckCircle2 className="w-5 h-5 text-brand-accent" />;
    } else if (isLockedByPayment) {
      return <Crown className="w-5 h-5 text-yellow-500" />;
    } else if (isLockedSequentially) {
      return <Lock className="w-5 h-5 text-muted" />;
    } else if (isActive) {
      return <Play className="w-5 h-5 text-brand-primary" />;
    } else {
      return <Clock className="w-5 h-5 text-muted" />;
    }
  };

  const handleClick = () => {
    if (!isLocked) {
      router.push(`/courses/${courseId}/chapters/${id}`);
    }
  };

  // Mensaje tooltip para estados bloqueados
  const getTooltipMessage = () => {
    if (isLockedByPayment) return "Requiere comprar el curso";
    if (isLockedSequentially) return "Completa el capítulo anterior";
    return "";
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        disabled={isLocked}
        title={getTooltipMessage()}
        className={cn(
          "w-full flex items-center justify-between px-4 py-3 text-sm transition-all duration-200 rounded-md mx-2 my-1",
          "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-brand-primary/20",
          // Estado activo - usando colores del brand
          isActive && [
            "bg-brand-primary/10",
            "text-brand-primary",
            "border-l-4 border-brand-accent",
            "font-semibold shadow-sm",
          ],
          // Estado completado (no activo)
          isCompleted &&
            !isActive && ["text-brand-accent", "bg-brand-accent/5"],
          // Estado bloqueado
          isLocked && [
            "opacity-60 cursor-not-allowed",
            "text-muted",
            "bg-muted/20",
          ],
          // Estado normal disponible
          !isLocked &&
            !isCompleted &&
            !isActive && ["text-text-body", "hover:text-text-heading"]
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Icono de estado */}
          <div className="flex-shrink-0">{getIcon()}</div>

          {/* Título del capítulo */}
          <span className="text-left truncate text-body-default">{label}</span>

          {/* Badge para capítulos gratuitos */}
          {isFree && !hasPurchase && (
            <span className="px-2 py-1 text-xs bg-brand-accent/10 text-brand-accent rounded-full font-medium">
              Gratis
            </span>
          )}
        </div>

        {/* Indicadores del lado derecho */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Indicador de capítulo activo */}
          {isActive && (
            <div className="w-2 h-2 rounded-full bg-brand-accent animate-pulse" />
          )}

          {/* Flecha para capítulos disponibles */}
          {!isLocked && !isActive && (
            <ChevronRight className="w-4 h-4 text-muted group-hover:text-text-body transition-colors" />
          )}
        </div>
      </button>

      {/* Tooltip para estados bloqueados */}
      {isLocked && getTooltipMessage() && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-brand-primary text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {getTooltipMessage()}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-brand-primary"></div>
        </div>
      )}
    </div>
  );
};
