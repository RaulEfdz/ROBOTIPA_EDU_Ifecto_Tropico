// File: app/api/courses/[courseId]/chapters/[chapterId]/exam/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/courses/[courseId]/chapters/[chapterId]/exam
 * Asigna o actualiza el examId en el objeto JSON 'data' de un capítulo
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  const { courseId, chapterId } = params;

  // Validar params
  if (!courseId) {
    console.error("[ASSIGN_CHAPTER_EXAM] falta courseId");
    return NextResponse.json(
      { message: "Bad Request: courseId is required" },
      { status: 400 }
    );
  }
  if (!chapterId) {
    console.error("[ASSIGN_CHAPTER_EXAM] falta chapterId");
    return NextResponse.json(
      { message: "Bad Request: chapterId is required" },
      { status: 400 }
    );
  }

  // Parsear body
  let body: { examId?: string };
  try {
    body = await request.json();
  } catch (err) {
    console.error("[ASSIGN_CHAPTER_EXAM] JSON inválido:", err);
    return NextResponse.json(
      { message: "Bad Request: invalid JSON" },
      { status: 400 }
    );
  }

  const { examId } = body;
  if (!examId || typeof examId !== "string") {
    return NextResponse.json(
      { message: "Bad Request: examId is required and must be a string" },
      { status: 400 }
    );
  }

  try {
    // Verificar existencia del curso
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      console.error(`[ASSIGN_CHAPTER_EXAM] curso no existe: ${courseId}`);
      return NextResponse.json(
        { message: "Not Found: course does not exist" },
        { status: 404 }
      );
    }

    // Verificar existencia del capítulo
    const chapter = await db.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter) {
      console.error(`[ASSIGN_CHAPTER_EXAM] capítulo no existe: ${chapterId}`);
      return NextResponse.json(
        { message: "Not Found: chapter does not exist" },
        { status: 404 }
      );
    }

    // Fusionar o establecer examId en el campo JSON 'data'
    const existingData =
      typeof chapter.data === "object" && chapter.data !== null
        ? chapter.data
        : {};
    const updatedData = { ...existingData, examId };

    await db.chapter.update({
      where: { id: chapterId },
      data: { data: updatedData },
    });

    return NextResponse.json(
      { message: "Examen asignado correctamente al capítulo" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[ASSIGN_CHAPTER_EXAM] Error interno:", err);
    return NextResponse.json(
      { message: err.message || "Server error assigning chapter exam" },
      { status: 500 }
    );
  }
}
