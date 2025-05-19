// File: app/api/courses/[courseId]/exams/currents/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/courses/[courseId]/exams/currents
 * Devuelve los exámenes (id y title) ya asignados al curso
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  // 1) Resolución de params dinámicos
  const { courseId } = await params;
  if (!courseId) {
    console.error("[COURSE_EXAMS_CURRENTS] falta courseId");
    return NextResponse.json(
      { message: "Bad Request: courseId is required" },
      { status: 400 }
    );
  }

  try {
    // 2) Consulta de los exámenes asignados al curso
    const course = await db.course.findUnique({
      where: { id: courseId },
      include: { exams: true }, // Ensure exams relationship is included
    });

    if (!course) {
      console.error(`[COURSE_EXAMS_CURRENTS] curso no existe: ${courseId}`);
      return NextResponse.json(
        { message: "Not Found: course does not exist" },
        { status: 404 }
      );
    }

    // 3) Respuesta con el array de exámenes
    return NextResponse.json({ exams: course.exams });
  } catch (err: any) {
    console.error(
      "[COURSE_EXAMS_CURRENTS] Error al obtener exámenes del curso:",
      err
    );
    return NextResponse.json(
      { message: "Server error fetching selected exams" },
      { status: 500 }
    );
  }
}
