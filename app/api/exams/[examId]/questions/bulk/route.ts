// app/api/exams/[examId]/questions/bulk/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/exams/[examId]/questions/bulk
 * Importa varias preguntas al examen especificado
 */
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
    const { questions } = await request.json();

    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { message: "El cuerpo debe contener un array de preguntas" },
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

    // Obtener el último orden actual
    const allQuestions = await db.question.findMany({
      where: { examId },
      select: { id: true, data: true },
    });

    const ordered = allQuestions
      .map((q) => ({
        order:
          typeof (q.data as any)?.order === "number"
            ? (q.data as any).order
            : 0,
      }))
      .sort((a, b) => b.order - a.order);

    const lastOrder = ordered[0]?.order ?? 0;

    // Crear preguntas en cascada con order correcto
    const inserted = await Promise.all(
      questions.map((q: any, index: number) =>
        db.question.create({
          data: {
            type: q.type ?? "multiple",
            text: q.text,
            points: q.points,
            explanationText: q.explanationText || null,
            data: {
              order: lastOrder + index + 1,
            },
            exam: { connect: { id: examId } },
            options: {
              create: q.options.map((opt: any) => ({
                text: opt.text,
                isCorrect: opt.isCorrect,
                data: {},
              })),
            },
          },
        })
      )
    );

    return NextResponse.json({ imported: inserted.length }, { status: 201 });
  } catch (error: any) {
    console.error("Error al importar preguntas en bulk:", error);
    return NextResponse.json(
      { message: error.message || "Error al importar preguntas" },
      { status: 500 }
    );
  }
}
