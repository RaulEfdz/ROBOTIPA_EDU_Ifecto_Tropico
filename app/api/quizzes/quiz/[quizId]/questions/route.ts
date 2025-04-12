import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const data = await request.json();
    // Se espera que data incluya: text, type, correctAnswers, points, y opcionalmente un array de options
    const newQuestion = await db.question.create({
      data: {
        examId: quizId,
        text: data.text,
        type: data.type,
        correctAnswers: data.correctAnswers, // Asegúrate de enviar un array de strings
        points: data.points,
        // Si se incluyen opciones, se pueden agregar de forma anidada:
        options: data.options ? { create: data.options } : undefined,
      }
    });
    return NextResponse.json(newQuestion);
  } catch (error) {
    console.error("Error al agregar pregunta:", error);
    return NextResponse.error();
  }
}
