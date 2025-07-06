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

  const courseIdPath = location.pathname.split("/")[2];

  function beforChapter() {
    // alert(`URL: /courses/${courseIdPath}/chapters/${prevChapterId}`);
    if (prevChapterId) {
      router.push(`/courses/${courseIdPath}/chapters/${prevChapterId}`);
    }
  }

  return (
    <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex items-center text-sm text-slate-500 mb-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto hover:bg-transparent text-slate-600 hover:text-primary-700 transition-colors flex items-center gap-1"
            onClick={() => beforChapter()}
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
                ? "bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            }
          ></Badge>
          {isCompleted && (
            <Badge
              variant="outline"
              className="bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100"
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
            onClick={() => beforChapter()}
            className="text-sm flex items-center gap-1 shadow-sm hover:shadow"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChapterHeader;
