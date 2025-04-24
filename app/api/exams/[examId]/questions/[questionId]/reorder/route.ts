// app/api/exams/[examId]/questions/[questionId]/reorder/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Reordena preguntas usando el campo data.order en su JSON
 */
export async function PUT(
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
    const { direction } = await request.json();
    if (!["up", "down"].includes(direction)) {
      return NextResponse.json(
        { message: "Dirección inválida" },
        { status: 400 }
      );
    }

    // 1) Obtener todas las preguntas del examen
    const questions = await db.question.findMany({
      where: { examId },
      select: { id: true, data: true, createdAt: true },
    });

    // 2) Calcular "order" actual (data.order o createdAt)
    const ordered = questions
      .map((q) => ({
        id: q.id,
        jsonData: q.data ?? {},
        order:
          typeof (q.data as any)?.order === "number"
            ? (q.data as any).order
            : q.createdAt.getTime(),
      }))
      .sort((a, b) => a.order - b.order);

    // 3) Encontrar índice de la pregunta a mover
    const idx = ordered.findIndex((q) => q.id === questionId);
    if (idx === -1) {
      return NextResponse.json(
        { message: "Pregunta no encontrada" },
        { status: 404 }
      );
    }

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= ordered.length) {
      return NextResponse.json(
        { message: "No se puede mover más" },
        { status: 400 }
      );
    }

    // 4) Preparar los dos updates intercambiando los valores de order
    const current = ordered[idx];
    const target = ordered[swapIdx];
    const updates = [
      { id: current.id, newOrder: target.order },
      { id: target.id, newOrder: current.order },
    ];

    // 5) Ejecutar en transacción para atomicidad
    await db.$transaction(
      updates.map(({ id, newOrder }) =>
        db.question.update({
          where: { id },
          data: {
            data: {
              // Retomamos el JSON original y sobreescribimos order
              ...(ordered.find((q) => q.id === id)!.jsonData as Record<
                string,
                any
              >),
              order: newOrder,
            },
          },
        })
      )
    );

    return NextResponse.json({ message: "Orden actualizado" }, { status: 200 });
  } catch (error: any) {
    console.error("Error al reordenar pregunta:", error);
    return NextResponse.json(
      {
        message: error.message || "Error al reordenar preguntas",
      },
      { status: 500 }
    );
  }
}
