// File: examSubmit.tsx
"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useConfettiStore } from "@/hooks/use-confetti-store";
import { useState, useCallback } from "react";

// --- Enums e interfaces ---
export enum QuestionType {
  SINGLE = "single",
  MULTIPLE = "multiple",
  TEXT = "text",
}

export interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: Option[];
  correctAnswers: string[];
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

export interface AnswerPayload {
  questionId: string;
  selectedOptionIds: string[];
  textResponse: string;
}

export interface SubmitExamData {
  examId: string;
  score: number;
  answers: AnswerPayload[];
  timestamp: string;
}

// --- Helpers ---
function getLetterGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function isAnswerCorrect(
  question: Question,
  userAnswer: string | string[] | undefined
): boolean {
  if (!userAnswer || (Array.isArray(userAnswer) && userAnswer.length === 0))
    return false;
  const answers = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
  if (question.type === QuestionType.SINGLE) {
    return question.correctAnswers.includes(answers[0]);
  }
  if (question.type === QuestionType.MULTIPLE) {
    if (question.correctAnswers.length !== answers.length) return false;
    return (
      question.correctAnswers.every((a) => answers.includes(a)) &&
      answers.every((a) => question.correctAnswers.includes(a))
    );
  }
  return false;
}

function calculateScore(
  exam: Exam,
  userAnswers: Record<string, string | string[]>
): number {
  let totalPoints = 0;
  let earned = 0;
  for (const q of exam.questions) {
    if (q.type !== QuestionType.TEXT) {
      totalPoints += q.points;
      if (isAnswerCorrect(q, userAnswers[q.id])) {
        earned += q.points;
      }
    }
  }
  return totalPoints === 0 ? 0 : Math.round((earned / totalPoints) * 100);
}

async function markChapterCompletedAndNavigate(
  courseId: string,
  chapterId: string,
  nextChapterId: string | undefined,
  router: ReturnType<typeof useRouter>
): Promise<boolean> {
  try {
    const res = await fetch(
      `/api/courses/${courseId}/chapters/${chapterId}/progress`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: true }),
      }
    );
    if (!res.ok) throw new Error("No se pudo completar el capítulo");
    const apiResponse = await res.json();

    // Mostrar modal si el certificado se enviará por correo (no generado aún)
    if (apiResponse.courseCompleted && !apiResponse.certificateGenerated) {
      // Mostrar toast personalizado en lugar de alert
      toast(
        "¡Felicidades! Has completado el curso. Tu certificado será enviado a tu correo electrónico pronto.",
        {
          duration: 8000,
          style: {
            backgroundColor: "#d1fae5",
            color: "#065f46",
            fontWeight: "bold",
          },
        }
      );
    } else if (
      apiResponse.courseCompleted &&
      (apiResponse.certificateGenerated || apiResponse.certificateId)
    ) {
      toast.success(
        <span>
          ¡Felicidades! Has completado el curso y obtenido tu certificado.{" "}
          <a
            href="/students/my-certificates"
            className="underline text-emerald-700 hover:text-emerald-900 ml-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ver mis certificados
          </a>
        </span>
      );
      useConfettiStore.getState().onOpen();
      await new Promise((r) => setTimeout(r, 2000));
    } else {
      toast.success("✅ Capítulo completado");
      await new Promise((r) => setTimeout(r, 1500));
    }

    const target = nextChapterId
      ? `/courses/${courseId}/chapters/${nextChapterId}`
      : `/courses/${courseId}`;
    router.push(target);
    router.refresh();
    return true;
  } catch (error) {
    console.error(error);
    toast.error("Error al marcar el capítulo como completado.");
    return false;
  }
}

async function submitExamAttemptToApi(data: Omit<SubmitExamData, "timestamp">) {
  const payload: SubmitExamData = {
    ...data,
    timestamp: new Date().toISOString(),
  };
  const res = await fetch("/api/exam-attempts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Error al enviar el intento");
  return json;
}

// --- Hook personalizado ---
interface ProcessExamFunctionParams {
  exam: Exam;
  userAnswers: Record<string, string | string[]>;
  courseId: string;
  chapterId: string;
  nextChapterId?: string;
  isChapterAlreadyCompleted: boolean;
  onScoreCallback?: (score: number) => void;
}

export function useProcessAndSubmitExam() {
  const router = useRouter();
  const confettiStore = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);

  const submit = useCallback(
    async ({
      exam,
      userAnswers,
      courseId,
      chapterId,
      nextChapterId,
      isChapterAlreadyCompleted,
      onScoreCallback,
    }: ProcessExamFunctionParams): Promise<boolean> => {
      setIsLoading(true);
      const score = calculateScore(exam, userAnswers);
      const answersPayload: AnswerPayload[] = Object.entries(userAnswers).map(
        ([qId, value]) => {
          const question = exam.questions.find((x) => x.id === qId)!;
          return {
            questionId: qId,
            selectedOptionIds: Array.isArray(value)
              ? value
              : value
                ? [value]
                : [],
            textResponse:
              question.type === QuestionType.TEXT && typeof value === "string"
                ? value
                : "",
          };
        }
      );

      try {
        await submitExamAttemptToApi({
          examId: exam.id,
          score,
          answers: answersPayload,
        });

        toast.success(
          `Examen enviado. Calificación: ${getLetterGrade(score)} (${score}%)`
        );
        onScoreCallback?.(score);

        if (score >= 70 && !isChapterAlreadyCompleted) {
          // markChapterCompletedAndNavigate ahora maneja el confetti del certificado y del capítulo
          await markChapterCompletedAndNavigate(
            courseId,
            chapterId,
            nextChapterId,
            router
          );
        } else {
          router.refresh();
        }
        return true;
      } catch (err: any) {
        console.error(err);
        toast.error(
          "Error al enviar el examen: " + (err.message || "desconocido")
        );
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [router] // Eliminada la dependencia innecesaria confettiStore
  );

  return { submit, isLoading };
}
