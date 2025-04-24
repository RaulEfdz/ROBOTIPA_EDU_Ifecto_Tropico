"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QuestionForm from "./QuestionForm";
import BulkAddQuestionsModal from "../BulkAddQuestionsModal";

export interface AddQuestionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  onQuestionAdded: () => void;
}

export default function AddQuestionModal({
  isOpen,
  onOpenChange,
  examId,
  onQuestionAdded,
}: AddQuestionModalProps) {
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  const handleDialogChange = (open: boolean) => {
    onOpenChange(open);
  };

  const handleImported = () => {
    onQuestionAdded();
    setIsBulkOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir Pregunta</DialogTitle>
            <DialogDescription>
              Crea una nueva pregunta para este examen.
            </DialogDescription>
          </DialogHeader>

          <div className="mb-4 text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkOpen(true)}
            >
              Importar Preguntas
            </Button>
          </div>

          <QuestionForm examId={examId} onQuestionAdded={onQuestionAdded} />
        </DialogContent>
      </Dialog>

      <BulkAddQuestionsModal
        isOpen={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        examId={examId}
        onImported={handleImported}
      />
    </>
  );
}
