// app/api/exams/[examId]/questions/[questionId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * PATCH /api/exams/[examId]/questions/[questionId]
 * Actualiza atributos de la pregunta (visibilidad)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ examId: string; questionId: string }> }
) {
  const { examId, questionId } = await params;
  if (!examId || !questionId) {
    return NextResponse.json(
      { message: "Parámetros inválidos" },
      { status: 400 }
    );
  }
  try {
    const body = await request.json();
    const { isVisible } = body;
    if (typeof isVisible !== "boolean") {
      return NextResponse.json(
        { message: "isVisible debe ser booleano" },
        { status: 400 }
      );
    }

    // Verificar existencia
    const question = await db.question.findUnique({
      where: { id: questionId },
    });
    if (!question) {
      return NextResponse.json(
        { message: "Pregunta no encontrada" },
        { status: 404 }
      );
    }

    // Actualizar visibilidad
    await db.question.update({
      where: { id: questionId },
      data: { isVisible },
    });
    return NextResponse.json({
      message: `Pregunta ${isVisible ? "visible" : "oculta"}`,
    });
  } catch (error: any) {
    console.error("Error toggling visibility:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
