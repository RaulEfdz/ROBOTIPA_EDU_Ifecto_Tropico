// File: app/api/courses/[courseId]/chapters/[chapterId]/exam/current/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/courses/[courseId]/chapters/[chapterId]/exam/current
 * Devuelve el examen actualmente asignado al capítulo (id y title), o null si no hay ninguno
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId, chapterId } = await params;

  // Validación de parámetros
  if (!courseId || !chapterId) {
    console.error("[GET_CURRENT_CHAPTER_EXAM] falta courseId o chapterId");
    return NextResponse.json(
      { message: "Bad Request: courseId and chapterId are required" },
      { status: 400 }
    );
  }

  try {
    // Verificar que el capítulo exista y pertenezca al curso
    const chapter = await db.chapter.findFirst({
      where: { id: chapterId, courseId: courseId },
      select: { data: true },
    });
    if (!chapter) {
      console.error(
        `[GET_CURRENT_CHAPTER_EXAM] capítulo no encontrado o no pertenece al curso: ${chapterId}`
      );
      return NextResponse.json(
        { message: "Not Found: chapter not found for this course" },
        { status: 404 }
      );
    }

    // Extraer examId del JSON 'data'
    const data =
      typeof chapter.data === "object" && chapter.data !== null
        ? chapter.data
        : {};
    const examId =
      typeof (data as { examId?: string }).examId === "string"
        ? (data as { examId?: string }).examId
        : null;

    if (!examId) {
      // No hay examen asignado
      return NextResponse.json({ exam: null }, { status: 200 });
    }

    // Recuperar información del examen
    const exam = await db.exam.findUnique({
      where: { id: examId },
      select: { id: true, title: true },
    });

    if (!exam) {
      console.error(
        `[GET_CURRENT_CHAPTER_EXAM] examen referenciado no encontrado: ${examId}`
      );
      // Return information about the deleted exam
      return NextResponse.json({ 
        exam: null, 
        deletedExamId: examId,
        message: "El examen asignado ya no existe y debe ser reasignado"
      }, { status: 200 });
    }

    return NextResponse.json({ exam }, { status: 200 });
  } catch (err: any) {
    console.error("[GET_CURRENT_CHAPTER_EXAM] Error interno:", err);
    return NextResponse.json(
      { message: err.message || "Server error fetching current chapter exam" },
      { status: 500 }
    );
  }
}
