// components/BulkAddQuestionsModal.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { QuestionFormData } from "./add/QuestionForm";
import { Copy } from "lucide-react";

interface BulkAddQuestionsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  examId: string;
  onImported: () => void;
}

const aiPrompt = `Convierte las siguientes preguntas escritas en texto a un array JSON con este formato permitido:

[
  {
    "text": "Enunciado de la pregunta",
    "options": [
      { "text": "Opción A", "isCorrect": false },
      { "text": "Opción B", "isCorrect": true }
    ],
    "explanationText": "Explicación opcional",
    "points": 1
  },
  ...
]

Reemplaza la sección anterior con tus propias preguntas en texto, separadas por líneas o en párrafos.`;

export default function BulkAddQuestionsModal({
  isOpen,
  onOpenChange,
  examId,
  onImported,
}: BulkAddQuestionsModalProps) {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [parsedQuestions, setParsedQuestions] = useState<QuestionFormData[]>(
    []
  );
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState<boolean>(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(aiPrompt);
    toast.success("Prompt copiado al portapapeles");
  };

  const handleParse = () => {
    try {
      const data = JSON.parse(jsonInput);
      if (!Array.isArray(data)) {
        throw new Error("El JSON debe ser un array de preguntas");
      }
      const valid = data.every((q) => {
        return (
          typeof q.text === "string" &&
          Array.isArray(q.options) &&
          q.options.every(
            (o: any) =>
              typeof o.text === "string" && typeof o.isCorrect === "boolean"
          ) &&
          typeof q.points === "number"
        );
      });
      if (!valid) {
        throw new Error("Formato de preguntas inválido");
      }
      setParsedQuestions(data as QuestionFormData[]);
      setParseError(null);
      toast.success(`Se han validado ${data.length} preguntas`);
    } catch (err: any) {
      setParseError(err.message || "Error al parsear JSON");
      setParsedQuestions([]);
    }
  };

  const handleImport = async () => {
    if (parsedQuestions.length === 0) return;
    setIsImporting(true);
    try {
      const response = await fetch(`/api/exams/${examId}/questions/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: parsedQuestions }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al importar preguntas");
      }
      toast.success(
        `Importadas ${parsedQuestions.length} preguntas exitosamente`
      );
      onImported();
      setJsonInput("");
      setParsedQuestions([]);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al importar preguntas");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setJsonInput("");
      setParsedQuestions([]);
      setParseError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar Preguntas</DialogTitle>
          <DialogDescription>
            Pega un JSON con un array de preguntas (formato permitido) para
            importarlas, o bien usa el botón de abajo para copiar un prompt que
            transforme tu cuestionario de texto.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={handleCopyPrompt}>
            <Copy className="w-4 h-4 mr-1" />
            Copiar Prompt de Transformación
          </Button>
        </div>

        <Textarea
          className="h-40"
          placeholder="[ { text: 'Pregunta...', options: [...], points: 1 }, ... ]"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
        />
        {parseError && (
          <p className="text-red-500 text-sm mt-2">{parseError}</p>
        )}
        {parsedQuestions.length > 0 && (
          <p className="text-green-600 text-sm mt-2">
            Preguntas validadas: {parsedQuestions.length}
          </p>
        )}
        <DialogFooter className="space-x-2">
          <Button onClick={handleParse} variant="outline">
            Validar JSON
          </Button>
          <Button
            onClick={handleImport}
            disabled={parsedQuestions.length === 0 || isImporting}
          >
            {isImporting ? "Importando..." : "Importar Preguntas"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
