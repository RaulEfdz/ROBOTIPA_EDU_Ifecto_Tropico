// types.ts
export interface Question {
    saved?: boolean | undefined;
    id: string;
    question: string;
    correctAnswers: boolean; // booleano para true/false
  }
  export interface AnswerModel {
    [key: string]: boolean;
  }
  export interface Answer {
    userId: string;
    student: string;
    answers: AnswerModel; // Índices de respuestas seleccionadas
    score: number; // Puntuación del estudiante
    date: number
  }
  interface closeDateType {
    timestamp: number
  }
  export interface Quiz {
    id: string;
    title: string;
    description?: string; // Hacer opcional
    questions: Question[]; // Lista de preguntas
    responses?: Answer[]; // Respuestas opcionales
    idCreator: string,
    closeDate?: closeDateType
  }
  
  export interface QuizModel {
    name: string; // Nombre del quiz
    description: string; // Descripción del quiz
  }
  