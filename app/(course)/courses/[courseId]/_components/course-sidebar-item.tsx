"use client";

import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { FcOk, FcNext, FcLock } from "react-icons/fc";

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

  // Lógica de bloqueo
  const isLockedByPayment = !isFree && !hasPurchase;
  const isLockedSequentially = !isFirstChapter && !isPreviousCompleted;
  const isLocked = isLockedByPayment || isLockedSequentially;

  const Icon = isLocked ? FcLock : isCompleted ? FcOk : FcNext;

  const handleClick = () => {
    if (!isLocked) {
      router.push(`/courses/${courseId}/chapters/${id}`);
    }
    // Aquí puedes agregar un toast si el capítulo está bloqueado
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLocked}
      className={cn(
        "flex items-center justify-between px-4 py-3 text-sm transition-all group",
        "hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground font-semibold",
        isCompleted && !isActive && "text-emerald-600",
        isLocked && "opacity-60 cursor-not-allowed text-muted-foreground"
      )}
    >
      <div className="flex items-center gap-x-3">
        <Icon className="text-xl" />
        <span className="text-left">{label}</span>
      </div>

      {isActive && !isLocked && (
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}
    </button>
  );
};
