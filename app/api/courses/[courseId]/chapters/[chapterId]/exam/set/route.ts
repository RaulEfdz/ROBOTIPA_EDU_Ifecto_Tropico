// File: app/api/courses/[courseId]/chapters/[chapterId]/exam/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { translateRole } from "@/utils/roles/translate";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

/**
 * POST /api/courses/[courseId]/chapters/[chapterId]/exam
 * Asigna o actualiza el examId en el objeto JSON 'data' de un capítulo
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId, chapterId } = await params;

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
  // Allow null examId for unassigning exams, but validate if provided
  if (examId !== null && examId !== undefined && typeof examId !== "string") {
    return NextResponse.json(
      { message: "Bad Request: examId must be a string or null" },
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

    // Permitir solo si es admin (por ID) o dueño del curso
    const user = (await getUserDataServerAuth())?.user;
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const chapter = await db.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }
    const isAdmin = translateRole(user.role) === "admin";
    const isOwner = course?.userId === user.id;
    if (!isAdmin && !isOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fusionar o establecer examId en el campo JSON 'data'
    const existingData =
      typeof chapter.data === "object" && chapter.data !== null
        ? chapter.data
        : {};
    
    let updatedData;
    let message;
    
    if (examId === null || examId === undefined) {
      // Remove examId from data to unassign
      const { examId: _, ...dataWithoutExamId } = existingData as any;
      updatedData = dataWithoutExamId;
      message = "Examen desasignado correctamente del capítulo";
    } else {
      // Verify exam exists before assigning
      const examExists = await db.exam.findUnique({
        where: { id: examId },
        select: { id: true }
      });
      
      if (!examExists) {
        return NextResponse.json(
          { message: "Bad Request: exam not found" },
          { status: 400 }
        );
      }
      
      updatedData = { ...existingData, examId };
      message = "Examen asignado correctamente al capítulo";
    }

    await db.chapter.update({
      where: { id: chapterId },
      data: { data: updatedData },
    });

    return NextResponse.json({ message }, { status: 200 });
  } catch (err: any) {
    console.error("[ASSIGN_CHAPTER_EXAM] Error interno:", err);
    return NextResponse.json(
      { message: err.message || "Server error assigning chapter exam" },
      { status: 500 }
    );
  }
}
