"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

export interface ChapterHeaderProps {
  courseTitle: string;
  courseId: string;
  chapterIndex: number; // 1-based index
  totalChapters: number;
  chapterTitle: string;
  isFree: boolean;
  isCompleted: boolean;
  prevChapterId?: string;
  nextChapterId?: string;
}

const ChapterHeader: React.FC<ChapterHeaderProps> = ({
  courseTitle,
  courseId,
  chapterIndex,
  totalChapters,
  chapterTitle,
  isFree,
  isCompleted,
  prevChapterId,
  nextChapterId,
}) => {
  const router = useRouter();

  return (
    <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center text-sm text-slate-500 mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent text-slate-600 hover:text-sky-700 transition-colors flex items-center gap-1"
            onClick={() => router.push(`/courses/${courseId}`)}
          >
            <ArrowLeft className="h-4 w-4" /> {courseTitle}
          </Button>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="font-medium text-slate-700">
            Capítulo {chapterIndex}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          {chapterTitle}
        </h1>
        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={
              isFree
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            }
          ></Badge>
          {isCompleted && (
            <Badge
              variant="outline"
              className="bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
            >
              <CheckCircle className="h-3 w-3 mr-1" /> Completado
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-4 md:mt-0">
        {prevChapterId && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/courses/${courseId}/chapters/${prevChapterId}`)
            }
            className="text-sm flex items-center gap-1 shadow-sm hover:shadow"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
        )}
        {/* {nextChapterId && (
          <Button
            size="sm"
            onClick={() =>
              router.push(`/courses/${courseId}/chapters/${nextChapterId}`)
            }
            className="text-sm flex items-center gap-1 shadow-sm hover:shadow bg-sky-600 hover:bg-sky-700 text-TextCustom transition-colors"
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </Button>
        )} */}
      </div>
    </div>
  );
};

export default ChapterHeader;
