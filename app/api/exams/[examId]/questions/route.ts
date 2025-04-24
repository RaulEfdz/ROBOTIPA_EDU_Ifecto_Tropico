// app/api/exams/[examId]/questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string }> }
) {
  const { examId } = await params;

  if (!examId) {
    return NextResponse.json(
      { message: "ID de examen inválido" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { type, text, options, explanationText, points } = body;

    if (
      !text ||
      !Array.isArray(options) ||
      options.length < 2 ||
      typeof points !== "number"
    ) {
      return NextResponse.json(
        { message: "Datos de pregunta inválidos" },
        { status: 400 }
      );
    }

    // Validar que cada opción tenga texto
    if (options.some((opt: any) => typeof opt.text !== "string")) {
      return NextResponse.json(
        { message: "Cada opción debe tener texto" },
        { status: 400 }
      );
    }

    const exam = await db.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return NextResponse.json(
        { message: "Examen no encontrado" },
        { status: 404 }
      );
    }

    // Obtener todas las preguntas del examen y calcular el siguiente order
    const allQuestions = await db.question.findMany({
      where: { examId },
      select: { id: true, data: true },
    });

    const ordered = allQuestions
      .map((q) => ({
        ...q,
        order:
          typeof (q.data as any)?.order === "number"
            ? (q.data as any).order
            : 0,
      }))
      .sort((a, b) => b.order - a.order);

    const lastQuestion = ordered[0];
    const nextOrder = lastQuestion?.order ? lastQuestion.order + 1 : 1;

    // Crear nueva pregunta
    const newQuestion = await db.question.create({
      data: {
        type: type ?? "multiple",
        text,
        points,
        explanationText: explanationText || null,
        isVisible: true,
        data: {
          order: nextOrder,
        },
        exam: {
          connect: {
            id: examId,
          },
        },
        options: {
          create: options.map((opt: any) => ({
            text: opt.text,
            isCorrect: opt.isCorrect ?? false,
            data: {},
          })),
        },
      },
      include: {
        options: true,
      },
    });

    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error: any) {
    console.error("Error al crear pregunta:", error);
    return NextResponse.json(
      {
        message: error.message || "Error al crear la pregunta",
      },
      { status: 500 }
    );
  }
}
