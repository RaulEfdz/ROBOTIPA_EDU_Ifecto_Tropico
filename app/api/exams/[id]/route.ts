// Archivo: app/api/exams/[id]/route.ts

import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/exams/[id]
 * Obtiene un examen específico con todos sus detalles
 */
export async function GET(
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
    const exam = await db.exam.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
        attempts: {
          include: {
            user: true,
            answers: true,
          },
        },
      },
    });

    if (!exam) {
      return NextResponse.json(
        { message: "Examen no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("Error al obtener el examen:", error);
    return NextResponse.json(
      { message: "Error al obtener el examen" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/exams/[id]
 * Actualiza un examen existente
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
    const { title, description, duration, isPublished } = body;

    // Validación básica
    if (title !== undefined && title.trim() === "") {
      return NextResponse.json(
        { message: "El título no puede estar vacío" },
        { status: 400 }
      );
    }

    // Comprobar si el examen existe
    const existingExam = await db.exam.findUnique({
      where: { id },
    });

    if (!existingExam) {
      return NextResponse.json(
        { message: "Examen no encontrado" },
        { status: 404 }
      );
    }

    // Actualizar el examen
    const updatedExam = await db.exam.update({
      where: { id },
      data: {
        title: title !== undefined ? title : undefined,
        description: description !== undefined ? description : undefined,
        duration: duration !== undefined ? duration : undefined,
        isPublished: isPublished !== undefined ? isPublished : undefined,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedExam);
  } catch (error) {
    console.error("Error al actualizar el examen:", error);
    return NextResponse.json(
      { message: "Error al actualizar el examen" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/exams/[id]
 * Elimina un examen y todas sus entidades relacionadas
 */
export async function DELETE(
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
    // Verificar si el examen existe
    const exam = await db.exam.findUnique({
      where: { id },
    });

    if (!exam) {
      return NextResponse.json(
        { message: "Examen no encontrado" },
        { status: 404 }
      );
    }

    // Eliminar el examen (asumiendo que las relaciones están configuradas para eliminar en cascada)
    await db.exam.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Examen eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar el examen:", error);
    return NextResponse.json(
      { message: "Error al eliminar el examen" },
      { status: 500 }
    );
  }
}
