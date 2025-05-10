// File: utils/examApi.ts

// Tipos
export interface Option {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: "single" | "multiple" | "text";
  options: Option[];
  correctAnswers: string[];
  points: number;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  isPublished?: boolean;
  data?: { passingScore?: number };
  questions: Question[];
}

// Respuesta de un intento
export interface Answer {
  questionId: string;
  selectedOptionIds: string[];
  textResponse?: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  score: number | null;
  status: string;
  submittedAt?: string;
  answers: Answer[]; // siempre presente
  user?: { fullName: string; email: string };
}

export interface AttemptsData {
  attempts: ExamAttempt[];
}

// fetcher genérico
export const fetcher = <T>(url: string): Promise<T> =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`Error al cargar datos: ${res.status}`);
    return res.json() as Promise<T>;
  });

// Obtiene los intentos de un examen
export const fetchAttempts = (examId: string) =>
  fetcher<AttemptsData>(`/api/exams/${encodeURIComponent(examId)}/attempts`);

// Obtiene las respuestas de un intento
export const fetchAnswers = (attemptId: string) =>
  fetcher<Answer[]>(
    `/api/exam-attempts/${encodeURIComponent(attemptId)}/getanswers`
  );

// Genera la nota en letra
export const getLetterGrade = (score: number | null): string => {
  if (score === null || score <= 0) return "F";
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
};

// Asegura que cada pregunta tenga su array correctAnswers
export const examProcessor = (data: Exam): Exam => {
  if (!data.questions) return data;
  const processedQuestions = data.questions.map((q) => {
    if (q.correctAnswers?.length) return q;
    const correctAnswers = q.options
      .filter((o) => o.isCorrect)
      .map((o) => o.id);
    return { ...q, correctAnswers };
  });
  return { ...data, questions: processedQuestions };
};
