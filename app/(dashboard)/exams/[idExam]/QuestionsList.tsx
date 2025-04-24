"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Edit2, Trash2, MoveUp, MoveDown, Eye, EyeOff } from "lucide-react";
import { Question } from "@/prisma/types";
import EditQuestionModal from "./EditQuestionModal";

interface QuestionsListProps {
  questions: Question[];
  examId: string;
  onQuestionsChange: () => void;
}

export default function QuestionsList({
  questions,
  examId,
  onQuestionsChange,
}: QuestionsListProps) {
  const [localQuestions, setLocalQuestions] = useState<Question[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);

  // Ordenar preguntas por data.order
  const sortedQuestions = [...localQuestions].sort((a, b) => {
    const aOrder = (a.data as any)?.order ?? 0;
    const bOrder = (b.data as any)?.order ?? 0;
    return aOrder - bOrder;
  });

  const swap = (arr: Question[], i: number, j: number) => {
    const copy = [...arr];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    return copy;
  };

  const handleReorderQuestion = async (
    questionId: string,
    direction: "up" | "down"
  ) => {
    const idx = sortedQuestions.findIndex((q) => q.id === questionId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx === -1 || swapIdx < 0 || swapIdx >= sortedQuestions.length) return;

    const swapped = swap(sortedQuestions, idx, swapIdx);
    setLocalQuestions(swapped);

    try {
      const res = await fetch(
        `/api/exams/${examId}/questions/${questionId}/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ direction }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al reordenar");
      }
      toast.success("Orden actualizado correctamente");
      onQuestionsChange();
    } catch (error: any) {
      console.error("Error reordering question:", error);
      toast.error(error.message || "Error al cambiar el orden");
      setLocalQuestions(questions);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta pregunta?")) return;
    try {
      const res = await fetch(`/api/exams/${examId}/questions/${questionId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al eliminar");
      }
      toast.success("Pregunta eliminada correctamente");
      onQuestionsChange();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al eliminar la pregunta");
    }
  };

  const handleToggleVisibility = async (
    questionId: string,
    isVisible: boolean
  ) => {
    try {
      const res = await fetch(`/api/exams/${examId}/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: !isVisible }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al cambiar visibilidad");
      }
      toast.success(`Pregunta ${!isVisible ? "visible" : "oculta"}`);
      onQuestionsChange();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al cambiar la visibilidad");
    }
  };

  const handleEditQuestion = (q: Question) => {
    setCurrentQuestion(q);
    setIsEditModalOpen(true);
  };

  const handleQuestionUpdated = () => {
    setIsEditModalOpen(false);
    onQuestionsChange();
  };

  return (
    <div className="space-y-4">
      {sortedQuestions.map((question, index) => (
        <Card
          key={question.id}
          className={question.isVisible === false ? "opacity-60" : ""}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-semibold">
                    {question.data?.order || 0}.
                  </span>
                  <span className="flex-1">{question.text}</span>
                  {question.isVisible === false && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full px-2 py-0.5">
                      Oculta
                    </span>
                  )}
                </div>

                {question.options?.length > 0 && (
                  <div className="ml-6 mt-2 space-y-1">
                    {question.options.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span
                          className={`text-sm px-2 py-0.5 rounded-full ${
                            opt.isCorrect
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm">{opt.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={index === 0}
                  onClick={() => handleReorderQuestion(question.id, "up")}
                  title="Mover arriba"
                >
                  <MoveUp className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  disabled={index === sortedQuestions.length - 1}
                  onClick={() => handleReorderQuestion(question.id, "down")}
                  title="Mover abajo"
                >
                  <MoveDown className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    handleToggleVisibility(
                      question.id,
                      question.isVisible !== false
                    )
                  }
                  title={
                    question.isVisible === false
                      ? "Mostrar pregunta"
                      : "Ocultar pregunta"
                  }
                >
                  {question.isVisible === false ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleEditQuestion(question)}
                  title="Editar pregunta"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteQuestion(question.id)}
                  title="Eliminar pregunta"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {currentQuestion && (
        <EditQuestionModal
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          question={currentQuestion}
          examId={examId}
          onQuestionUpdated={handleQuestionUpdated}
        />
      )}
    </div>
  );
}
