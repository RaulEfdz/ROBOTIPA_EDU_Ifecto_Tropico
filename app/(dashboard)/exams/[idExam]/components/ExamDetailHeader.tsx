import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Save } from "lucide-react";
import Link from "next/link";
import { Exam } from "../utils/examApi";

interface Props {
  exam: Exam;
  hasMissingCorrectAnswers: boolean;
  onCorrectAnswers: () => void;
  onSaveChanges: () => void;
  isDirty: boolean;
  isSubmitting: boolean;
}

export default function ExamDetailHeader({
  exam,
  hasMissingCorrectAnswers,
  onCorrectAnswers,
  onSaveChanges,
  isDirty,
  isSubmitting,
}: Props) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/exams">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Volver
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            exam.isPublished
              ? "bg-primary-100 text-green-800"
              : "bg-yellow-100 text-yellow-800"
          }`}
        >
          {exam.isPublished ? "Publicado" : "Borrador"}
        </span>
      </div>

      <div className="flex gap-2">
        {hasMissingCorrectAnswers && (
          <Button variant="destructive" onClick={onCorrectAnswers}>
            Corregir Respuestas
          </Button>
        )}
        <Button onClick={onSaveChanges} disabled={!isDirty || isSubmitting}>
          <Save className="w-4 h-4 mr-1" />
          {isSubmitting ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </div>
  );
}
