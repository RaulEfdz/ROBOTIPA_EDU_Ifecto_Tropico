// app/(dashboard)/(routes)/search/_components/category-item.tsx
"use client";

import { IconType } from "react-icons";
import { cn } from "@/lib/utils";

// ASEGÚRATE DE QUE ESTÉ EXPORTADA
export interface CategoryItemProps {
  label: string;
  value?: string | null;
  icon?: IconType;
  isSelected: boolean;
  onClick: (value: string | null) => void;
}

export const CategoryItem = ({
  label,
  value,
  icon: Icon,
  isSelected,
  onClick,
}: CategoryItemProps) => {
  // ... resto del código del componente (sin cambios aquí)
  return (
    <button
      onClick={() => onClick(value === undefined ? null : value)}
      className={cn(
        "py-2 px-4 text-sm border rounded-full flex items-center gap-x-1.5 hover:border-sky-600 dark:hover:border-sky-400 transition-all duration-200 ease-in-out transform hover:scale-105",
        "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50",
        isSelected
          ? "border-sky-600 bg-sky-100 text-sky-800 dark:border-sky-400 dark:bg-sky-700/30 dark:text-sky-200 font-medium"
          : "border-slate-300 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
      )}
      type="button"
      aria-pressed={isSelected}
    >
      {Icon && (
        <Icon
          size={18}
          className={cn(
            isSelected
              ? "text-sky-700 dark:text-sky-300"
              : "text-slate-500 dark:text-slate-400"
          )}
        />
      )}
      <span className="truncate">{label}</span>
    </button>
  );
};
