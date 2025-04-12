import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// PUT: Actualizar una pregunta
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const updatedQuestion = await db.question.update({
      where: { id },
      data: {
        text: data.text,
        type: data.type,
        correctAnswers: data.correctAnswers, // Array de strings
        points: data.points,
      }
    });
    return NextResponse.json(updatedQuestion);
  } catch (error) {
    console.error("Error al actualizar pregunta:", error);
    return NextResponse.error();
  }
}

// DELETE: Eliminar una pregunta
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.question.delete({
      where: { id }
    });
    return NextResponse.json({ message: "Pregunta eliminada correctamente" });
  } catch (error) {
    console.error("Error al eliminar pregunta:", error);
    return NextResponse.error();
  }
}
