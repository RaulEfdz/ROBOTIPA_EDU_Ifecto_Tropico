// app/api/courses/[courseId]/chapters/[chapterId]/progress/route.ts
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { generateCertificate } from "@/lib/certificate-service";

import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { courseId, chapterId } = await params;
    const { isCompleted } = await req.json();
    const user = (await getUserDataServerAuth())?.user;
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const userProgress = await db.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId: user?.id,
          chapterId: chapterId,
        },
      },
      update: {
        isCompleted,
      },
      create: {
        userId: user?.id,
        chapterId: chapterId,
        isCompleted,
      },
    });

    let courseCompleted = false;
    let certificateGenerated = false;
    let certificateId: string | null = null;
    // --- Lógica de generación de certificado ---
    if (isCompleted) {
      // Buscar todos los capítulos publicados y no eliminados del curso, ordenados por posición
      const courseChapters = await db.chapter.findMany({
        where: { courseId: courseId, isPublished: true, delete: false },
        select: { id: true },
        orderBy: { position: "asc" },
      });

      if (courseChapters.length > 0) {
        // Verificar si el capítulo actual es el último capítulo
        const lastChapter = courseChapters[courseChapters.length - 1];
        if (lastChapter.id === chapterId) {
          // Marcar todos los capítulos como completados para el usuario
          for (const chapter of courseChapters) {
            await db.userProgress.upsert({
              where: {
                userId_chapterId: {
                  userId: user.id,
                  chapterId: chapter.id,
                },
              },
              update: { isCompleted: true },
              create: {
                userId: user.id,
                chapterId: chapter.id,
                isCompleted: true,
              },
            });
          }
          courseCompleted = true;
          // No generar certificado aquí, solo indicar que se enviará por correo
          certificateGenerated = false;
          certificateId = null;
        } else {
          // Solo marcar el capítulo actual como completado
          courseCompleted = false;
          certificateGenerated = false;
          certificateId = null;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Progreso actualizado",
      userProgress,
      courseCompleted,
      certificateGenerated,
      certificateId,
    });
  } catch (error) {
    console.error("[CHAPTER_ID_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
