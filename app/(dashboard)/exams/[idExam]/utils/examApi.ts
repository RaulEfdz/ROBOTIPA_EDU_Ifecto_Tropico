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
export interface ExamAttempt {
  id: string;
  examId: string;
  score: number | null;
  status: string;
  submittedAt?: string;
  answers?: Array<{
    questionId: string;
    selectedOptionIds?: string[];
    textResponse?: string;
  }>;
  user?: { fullName: string; email: string };
}
export interface AttemptsData {
  attempts: ExamAttempt[];
}

// fetcher genérico
export const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Error al cargar datos");
    return res.json();
  });

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
