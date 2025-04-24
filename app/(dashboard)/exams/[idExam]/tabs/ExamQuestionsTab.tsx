// ExamQuestionsTab.tsx
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileQuestion, Plus } from "lucide-react";
import QuestionsList from "../QuestionsList";

interface ExamQuestionsTabProps {
  questions: any[];
  examId: string;
  onQuestionsChange: () => void;
  onOpenAddModal: () => void;
}

export default function ExamQuestionsTab({
  questions,
  examId,
  onQuestionsChange,
  onOpenAddModal,
}: ExamQuestionsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preguntas del Examen</CardTitle>
        <CardDescription>
          Gestiona las preguntas de este examen. Añade, edita o elimina
          preguntas según sea necesario.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <QuestionsList
          questions={questions}
          examId={examId}
          onQuestionsChange={onQuestionsChange}
        />

        {(!questions || questions.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <FileQuestion className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No hay preguntas en este examen.</p>
            <Button variant="outline" className="mt-4" onClick={onOpenAddModal}>
              <Plus className="w-4 h-4 mr-1" />
              Añadir primera pregunta
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Total de preguntas: {questions?.length || 0}
        </div>
        {questions && questions.length > 0 && (
          <Button variant="outline" onClick={onOpenAddModal}>
            <Plus className="w-4 h-4 mr-1" />
            Añadir Pregunta
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
