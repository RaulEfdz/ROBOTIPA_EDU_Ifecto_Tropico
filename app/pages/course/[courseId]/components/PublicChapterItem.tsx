// app/pages/course/[courseId]/components/PublicChapterItem.tsx
"use client";

import { Lock, PlayCircle, FileText } from "lucide-react";

interface PublicChapterItemProps {
  chapter: {
    id: string;
    title: string;
    isFree?: boolean; // Si tienes esta info de la API de preview
    // podrías añadir más, como 'durationPreview', etc.
  };
  index: number; // Para numeración
  onPreviewClick?: (chapter: {
    id: string;
    title: string;
    isFree?: boolean;
  }) => void;
}

export default function PublicChapterItem({
  chapter,
  index,
  onPreviewClick,
}: PublicChapterItemProps) {
  // Determina si se puede previsualizar. Si 'isFree' no viene, asumimos que no es previsualizable
  // o podrías tener otra lógica (ej. solo los primeros N capítulos son preview)
  const isPreviewAvailable = chapter.isFree === true;

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800/50 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold shrink-0 ${
            isPreviewAvailable
              ? "bg-primary-100 text-primary-700 dark:bg-primary-700/30 dark:text-primary-300"
              : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
          }`}
        >
          {index + 1}
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 line-clamp-1">
          {chapter.title}
        </span>
      </div>
      <div className="ml-auto pl-2">
        {isPreviewAvailable ? (
          <button
            type="button"
            onClick={() => onPreviewClick && onPreviewClick(chapter)}
            className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline"
          >
            <PlayCircle size={16} />
            <span>Vista Previa</span>
          </button>
        ) : (
          <Lock size={16} className="text-slate-400 dark:text-slate-500" />
        )}
      </div>
    </div>
  );
}
