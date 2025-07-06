// File: app/(course)/courses/catalog/components/EmptyState.tsx
import { AlertTriangle } from "lucide-react";

interface EmptyStateProps {
  resetFilters: () => void;
}

export default function EmptyState({ resetFilters }: EmptyStateProps) {
  return (
    <div className="text-center py-16 text-slate-500 dark:text-slate-400 col-span-full">
      <AlertTriangle className="mx-auto h-12 w-12 text-amber-400 mb-4" />
      <h2 className="text-xl font-semibold mb-2 text-slate-700 dark:text-slate-200">
        No se encontraron cursos
      </h2>
      <p>
        Intenta ajustar tu búsqueda o filtros, o explora todas nuestras{" "}
        <button
          onClick={resetFilters}
          className="text-primary-600 hover:underline dark:text-primary-400"
        >
          categorías
        </button>
        .
      </p>
    </div>
  );
}
