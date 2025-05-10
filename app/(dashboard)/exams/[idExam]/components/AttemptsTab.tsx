// File: AttemptsTab.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Users, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Exam,
  AttemptsData,
  ExamAttempt,
  getLetterGrade,
} from "../utils/examApi";
import AttemptDetailModal from "./AttemptDetailModal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  exam: Exam;
  attemptsData: AttemptsData;
}

type SelectedAttempt = Omit<ExamAttempt, "answers"> & { answers: any[] };

export default function AttemptsTab({ exam, attemptsData }: Props) {
  const [selected, setSelected] = useState<SelectedAttempt | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [attempts, setAttempts] = useState<ExamAttempt[]>(
    attemptsData.attempts ?? []
  );
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loading, setLoading] = useState(false);

  // Refresh attempts on mount or when exam changes
  useEffect(() => {
    setLoading(true);
    fetch(`/api/exams/${exam.id}/attempts`)
      .then((res) => res.json())
      .then((data: AttemptsData) => setAttempts(data.attempts ?? []))
      .catch(() => toast.error("No se pudieron cargar los intentos."))
      .finally(() => setLoading(false));
  }, [exam.id]);

  const filtered = attempts.filter(
    (a) =>
      a.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  async function openDetail(a: ExamAttempt) {
    setLoadingDetail(true);
    try {
      const res = await fetch(
        `/api/exam-attempts/${encodeURIComponent(a.id)}/getanswers`
      );
      if (!res.ok)
        throw new Error((await res.json()).error || `Error ${res.status}`);
      const detailed = await res.json();
      setSelected({ ...a, answers: detailed });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al cargar las respuestas.");
    } finally {
      setLoadingDetail(false);
    }
  }

  const handleUpdateScore = async (attemptId: string, newScore: number) => {
    try {
      const res = await fetch("/api/exam-attempts/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ attemptId, score: newScore }),
      });
      if (!res.ok)
        throw new Error((await res.json()).message || `Error ${res.status}`);
      toast.success("Calificación actualizada");
      openDetail({ id: attemptId } as ExamAttempt);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al actualizar la calificación.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Intentos de Examen</h2>
        <div className="relative w-64">
          <Input
            placeholder="Buscar por nombre o correo"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No se encontraron intentos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((a) => (
            <Card key={a.id} className="transition-shadow hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{a.user?.fullName || "Anónimo"}</span>
                  <span className="text-xs text-gray-400">
                    {a.submittedAt
                      ? new Date(a.submittedAt).toLocaleDateString()
                      : "Sin enviar"}
                  </span>
                </CardTitle>
                <CardDescription className="text-xs text-gray-500">
                  {a.user?.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between mt-4">
                <span className="text-lg font-bold text-emerald-600">
                  {a.score != null
                    ? `${getLetterGrade(a.score)} (${a.score}%)`
                    : "F (0%)"}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openDetail(a)}
                  disabled={loadingDetail}
                >
                  Ver respuestas
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selected && (
        <AttemptDetailModal
          exam={exam}
          attempt={selected}
          onClose={() => setSelected(null)}
          onUpdateScore={handleUpdateScore}
        />
      )}
    </div>
  );
}
