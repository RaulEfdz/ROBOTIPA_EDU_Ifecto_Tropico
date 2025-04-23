// Archivo: app/api/exams/[id]/publish/route.ts

import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * PUT /api/exams/[id]/publish
 * Publica o despublica un examen
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { message: "ID de examen inválido" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { isPublished } = body;

    if (typeof isPublished !== "boolean") {
      return NextResponse.json(
        { message: "El valor de isPublished debe ser un booleano" },
        { status: 400 }
      );
    }

    // Verificar que el examen existe
    const exam = await db.exam.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!exam) {
      return NextResponse.json(
        { message: "Examen no encontrado" },
        { status: 404 }
      );
    }

    // Verificar que tenga al menos una pregunta si se va a publicar
    if (isPublished && exam.questions.length === 0) {
      return NextResponse.json(
        {
          message: "No se puede publicar un examen sin preguntas",
          code: "NO_QUESTIONS",
        },
        { status: 400 }
      );
    }

    // Actualizar el estado de publicación
    const updatedExam = await db.exam.update({
      where: { id },
      data: {
        isPublished,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: isPublished
        ? "Examen publicado correctamente"
        : "Examen despublicado correctamente",
      exam: updatedExam,
    });
  } catch (error) {
    console.error("Error al cambiar estado de publicación:", error);
    return NextResponse.json(
      { message: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
