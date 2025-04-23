// Archivo: app/api/exams/route.ts

import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Modelos
export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  SINGLE_CHOICE = "SINGLE_CHOICE",
  TEXT = "TEXT",
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  duration?: number; // Duración en minutos
  isPublished: boolean;
  questions: Question[];
  attempts: ExamAttempt[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: string;
  examId: string;
  exam: Exam;
  text: string;
  type: QuestionType;
  options: Option[];
  correctAnswers: string[]; // IDs de las opciones correctas
  points: number;
  answers: Answer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Option {
  id: string;
  questionId: string;
  question: Question;
  text: string;
  createdAt: Date;
}

export interface ExamAttempt {
  id: string;
  userId: string;
  examId: string;
  user: User;
  exam: Exam;
  startedAt: Date;
  submittedAt?: Date;
  score?: number;
  status: string; // Ej: "in_progress"
  answers: Answer[];
}

export interface Answer {
  id: string;
  attemptId: string;
  questionId: string;
  attempt: ExamAttempt;
  question: Question;
  selectedOptionIds: string[];
  textResponse?: string;
  isCorrect?: boolean;
  createdAt: Date;
}

// DTO para crear un examen
export interface CreateExamDTO {
  title: string;
  description?: string;
  duration?: number;
}

/**
 * GET /api/exams
 * Obtiene todos los exámenes con sus preguntas y intentos
 */
export async function GET() {
  try {
    const exams = await db.exam.findMany({
      include: {
        questions: true,
        attempts: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Error al obtener exámenes:", error);
    return NextResponse.json(
      { message: "Error al obtener los exámenes" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/exams
 * Crea un nuevo examen
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, duration } = body as CreateExamDTO;

    // Validación básica
    if (!title || title.trim() === "") {
      return NextResponse.json(
        { message: "El título es obligatorio" },
        { status: 400 }
      );
    }

    const newExam = await db.exam.create({
      data: {
        title,
        description,
        duration: duration || 60, // Por defecto 60 minutos si no se especifica
        isPublished: false, // Por defecto no publicado
      },
    });

    return NextResponse.json(newExam, { status: 201 });
  } catch (error) {
    console.error("Error al crear examen:", error);
    return NextResponse.json(
      { message: "Error al crear el examen" },
      { status: 500 }
    );
  }
}
