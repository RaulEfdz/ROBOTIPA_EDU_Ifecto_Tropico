"use client";

import { Chapter } from "@/prisma/types";
import { ChevronDown, Lock, CheckCircle2 } from "lucide-react";
import { ChapterPreview } from "../hook/useCourse";

interface ChapterItemProps {
  chapter: ChapterPreview;
  index: number;
  onToggle: () => void;
}

export default function ChapterItem({
  chapter,
  index,
  onToggle,
}: ChapterItemProps) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        onClick={onToggle}
        className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
      >
        <div className="flex items-center gap-3 font-medium">
          <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-sm">
            Capítulo {index + 1}
          </span>
          <span>{chapter.title}</span>
          {!chapter.isPublished && (
            <span className="bg-amber-100 text-amber-800 px-2 py-1 text-xs rounded-full">
              No publicado
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
