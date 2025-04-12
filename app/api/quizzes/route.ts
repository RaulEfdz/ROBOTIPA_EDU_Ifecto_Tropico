import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// GET: Listar todos los quizzes
export async function GET() {
  try {
    const quizzes = await db.exam.findMany({
      include: { questions: true }
    });
    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("Error al obtener quizzes:", error);
    return NextResponse.error();
  }
}

// POST: Crear un nuevo quiz
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validación mínima de los datos recibidos
    if (!data.title || !data.description || !data.duration) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios: title, description o duration" },
        { status: 400 }
      );
    }
    
    const newQuiz = await db.exam.create({
      data: {
        title: data.title,
        description: data.description,
        duration: data.duration,
        isPublished: data.isPublished ?? false,
        // Si deseas agregar preguntas directamente, podrías hacerlo anidando la creación:
        // questions: { create: data.questions }
      }
    });
    return NextResponse.json(newQuiz);
  } catch (error) {
    console.error("Error al crear quiz:", error);
    return NextResponse.error();
  }
}
