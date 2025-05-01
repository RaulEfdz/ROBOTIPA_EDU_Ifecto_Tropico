// File: app/api/courses/[courseId]/updates/exams/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/courses/[courseId]/updates/exams
 * Sincroniza la selección de exámenes de un curso
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  // 1) Obtener y validar courseId
  const { courseId } = await params;
  if (!courseId) {
    console.error("[COURSE_EXAMS_UPDATE] falta courseId");
    return NextResponse.json(
      { message: "Bad Request: courseId is required" },
      { status: 400 }
    );
  }

  // 2) Parsear body JSON
  let body: { examIds?: string[] };
  try {
    body = await request.json();
    console.log("[COURSE_EXAMS_UPDATE] payload recibido:", body);
  } catch (err) {
    console.error("[COURSE_EXAMS_UPDATE] JSON inválido:", err);
    return NextResponse.json(
      { message: "Bad Request: invalid JSON" },
      { status: 400 }
    );
  }
  const examIds = Array.isArray(body.examIds) ? body.examIds : [];

  try {
    // 3) Verificar existencia del curso
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      console.error(`[COURSE_EXAMS_UPDATE] curso no existe: ${courseId}`);
      return NextResponse.json(
        { message: "Not Found: course does not exist" },
        { status: 404 }
      );
    }

    // 4) Borrar relaciones previas en la tabla implícita
    const deletedCount = await db.$executeRaw`
      DELETE FROM "_CourseExams" WHERE "A" = ${courseId}
    `;
    console.log(`[COURSE_EXAMS_UPDATE] filas borradas:`, deletedCount);

    // 5) Insertar nuevos enlaces
    for (const examId of examIds) {
      await db.$executeRaw`
        INSERT INTO "_CourseExams" ("A","B") VALUES (${courseId}, ${examId})
      `;
    }
    console.log(`[COURSE_EXAMS_UPDATE] filas insertadas:`, examIds.length);

    // 6) Responder éxito
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[COURSE_EXAMS_UPDATE] Error al actualizar:", err);
    return NextResponse.json(
      { message: err.message || "Server error updating exams" },
      { status: 500 }
    );
  }
}
