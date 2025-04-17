// app/api/quizzes/[id]/route.ts
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

interface Params {
  params: { id: string };
}

// GET: Obtener un quiz específico (incluyendo sus preguntas si es necesario)
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Extraemos el valor de id desde la promesa params
    const { id } = await params;
    
    const quiz = await db.exam.findUnique({
      where: { id },
      include: { questions: true }
    });
    
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz no encontrado' }, { status: 404 });
    }
    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error al obtener quiz:", error);
    return NextResponse.error();
  }
}


// PUT: Actualizar un quiz
export async function PUT(request: Request, 

  { params }: { params: Promise<{ id: string }> }
) {
    const data = await request.json();
    const { id } = await params;
try{
    
    const updatedQuiz = await db.exam.update({
      where: { id:id },
      data: {
        title: data.title,
        description: data.description,
        duration: data.duration,
        isPublished: data.isPublished,
        // Puedes agregar otros campos según tu modelo
      }
    });
    return NextResponse.json(updatedQuiz);
  } catch (error: any) {
    // Capturamos el error de Prisma para "Record not found" (P2025)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }
    console.error("Error al actualizar quiz:", error);
    return NextResponse.error();
  }
}

// DELETE: Eliminar un quiz
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; }> }
) {
  const { id } = await params;
  try {
    await db.exam.delete({
      where: { id:id }
    });
    return NextResponse.json({ message: "Quiz eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar quiz:", error);
    return NextResponse.error();
  }
}
