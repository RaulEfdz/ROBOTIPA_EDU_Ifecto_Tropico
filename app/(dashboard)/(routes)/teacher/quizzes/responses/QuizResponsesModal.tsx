// QuizResponsesModal.tsx
"use client";

import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import QuizResponsesView from "./QuizResponsesView";
import { Answer, AnswerModel, Question } from "../types";

type QuizResponsesModalProps = {
  isOpen: boolean;
  closeModal: () => void;
  selectedAnswer: Answer | null;
  setSelectedAnswer: (answer: Answer | null) => void;
  userNames: Record<string, string>;
  responses: Answer[];
  questions: Question[];
  countCorrectAnswers: (answers: AnswerModel, questions: Question[]) => number;
};

function QuizResponsesModal({
  isOpen,
  closeModal,
  selectedAnswer,
  setSelectedAnswer,
  userNames,
  responses,
  questions,
  countCorrectAnswers,
}: QuizResponsesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="w-full max-w-4xl p-6">
        <DialogTitle className="text-2xl font-bold text-gray-900 mb-6">
          Respuestas de formulario
        </DialogTitle>
        <QuizResponsesView
          selectedAnswer={selectedAnswer}
          setSelectedAnswer={setSelectedAnswer}
          userNames={userNames}
          responses={responses}
          questions={questions}
          countCorrectAnswers={countCorrectAnswers}
        />
      </DialogContent>
    </Dialog>
  );
}

export default QuizResponsesModal;
