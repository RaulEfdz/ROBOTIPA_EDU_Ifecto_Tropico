// File: AttemptsTab.tsx
"use client";

import React, { useState } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";
import {
  Exam,
  AttemptsData,
  ExamAttempt,
  getLetterGrade,
} from "../utils/examApi";
import AttemptDetailModal from "./AttemptDetailModal";

interface Props {
  exam: Exam;
  attemptsData: AttemptsData;
}

export default function AttemptsTab({ exam, attemptsData }: Props) {
  const [selected, setSelected] = useState<ExamAttempt | null>(null);
  const [attempts, setAttempts] = useState<ExamAttempt[]>(
    attemptsData.attempts ?? []
  );

  // Función para actualizar la calificación vía API usando POST
  async function handleUpdateScore(attemptId: string, newScore: number) {
    try {
      const res = await fetch("/api/exam-attempts/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, score: newScore }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || `Error ${res.status}`);
        return;
      }

      toast.success("Calificación actualizada correctamente.");

      // Refrescar la lista de intentos tras actualizar
      const updatedRes = await fetch(`/api/exams/${exam.id}/attempts`);
      if (updatedRes.ok) {
        const updatedData: AttemptsData = await updatedRes.json();
        setAttempts(updatedData.attempts ?? []);
        // Actualizar detalle abierto si corresponde
        setSelected((prev) =>
          prev && prev.id === attemptId ? { ...prev, score: newScore } : prev
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de red al actualizar la calificación.");
    }
  }

  if (!attempts.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
        <p>No hay intentos registrados.</p>
        {!exam.isPublished && (
          <p className="mt-2">
            Publica el examen para que los alumnos puedan hacerlo.
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {attempts.map((a) => (
          <button
            key={a.id}
            onClick={() => setSelected(a)}
            className="w-full p-4 border rounded flex justify-between hover:bg-gray-50"
          >
            <div>
              <p className="font-medium">{a.user?.fullName || "Anónimo"}</p>
              <p className="text-sm text-gray-500">{a.user?.email}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-emerald-600">
                {a.score != null
                  ? `${getLetterGrade(a.score)} (${a.score}%)`
                  : "F (0%)"}
              </p>
              <p className="text-sm text-gray-400">
                {a.submittedAt
                  ? new Date(a.submittedAt).toLocaleString()
                  : "Sin enviar"}
              </p>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <AttemptDetailModal
          exam={exam}
          attempt={selected}
          onClose={() => setSelected(null)}
          onUpdateScore={handleUpdateScore}
        />
      )}
    </>
  );
}
