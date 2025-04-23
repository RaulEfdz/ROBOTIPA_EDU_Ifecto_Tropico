"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);

  // Función para eliminar una pregunta
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta pregunta?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/exams/${examId}/questions/${questionId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar la pregunta");
      }

      toast.success("Pregunta eliminada correctamente");
      onQuestionsChange();
    } catch (err: any) {
      console.error("Error deleting question:", err);
      toast.error(err.message || "Error al eliminar la pregunta");
    }
  };

  // Función para cambiar el orden de las preguntas
  const handleReorderQuestion = async (
    questionId: string,
    direction: "up" | "down"
  ) => {
    try {
      const response = await fetch(
        `/api/exams/${examId}/questions/${questionId}/reorder`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ direction }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al reordenar la pregunta");
      }

      toast.success("Orden actualizado correctamente");
      onQuestionsChange();
    } catch (err: any) {
      console.error("Error reordering question:", err);
      toast.error(err.message || "Error al cambiar el orden");
    }
  };

  // Función para cambiar la visibilidad de una pregunta
  const handleToggleVisibility = async (
    questionId: string,
    isVisible: boolean
  ) => {
    try {
      const response = await fetch(
        `/api/exams/${examId}/questions/${questionId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isVisible: !isVisible }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al cambiar la visibilidad");
      }

      toast.success(`Pregunta ${!isVisible ? "visible" : "oculta"}`);
      onQuestionsChange();
    } catch (err: any) {
      console.error("Error toggling visibility:", err);
      toast.error(err.message || "Error al cambiar la visibilidad");
    }
  };

  // Función para abrir el modal de edición con la pregunta seleccionada
  const handleEditQuestion = (question: Question) => {
    setCurrentQuestion(question);
    setIsEditModalOpen(true);
  };

  // Función para manejar cuando se actualiza una pregunta
  const handleQuestionUpdated = () => {
    onQuestionsChange();
    setIsEditModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <Card
          key={question.id}
          className={question.isVisible === false ? "opacity-60" : ""}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-semibold">{index + 1}.</span>
                  <span className="flex-1">{question.text}</span>
                  {question.isVisible === false && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full px-2 py-0.5">
                      Oculta
                    </span>
                  )}
                </div>

                {/* Opciones de respuesta */}
                {question.options && question.options.length > 0 && (
                  <div className="ml-6 mt-2 space-y-1">
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <span
                          className={`text-sm px-2 py-0.5 rounded-full ${
                            option.isCorrect
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}
                        </span>
                        <span className="text-sm">{option.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Acciones */}
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
                  disabled={index === questions.length - 1}
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

      {/* Modal para editar pregunta */}
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
