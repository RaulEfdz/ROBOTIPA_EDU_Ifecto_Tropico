// app/api/courses/[courseId]/chapters/[chapterId]/progress/route.ts
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { generateCertificate } from "@/lib/certificate-service";
import { sendCourseCompletionEmails } from "@/lib/email-service";

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
      // Buscar todos los capítulos publicados y no eliminados del curso
      const courseChapters = await db.chapter.findMany({
        where: { courseId: courseId, isPublished: true, delete: false },
        select: { id: true },
      });
      if (courseChapters.length > 0) {
        const completedChaptersCount = await db.userProgress.count({
          where: {
            userId: user.id,
            chapterId: { in: courseChapters.map((c) => c.id) },
            isCompleted: true,
          },
        });
        if (completedChaptersCount === courseChapters.length) {
          courseCompleted = true;
          // Centralizado: Llama a generateCertificate
          const cert = await generateCertificate(user.id, courseId);
          if (cert) {
            certificateGenerated = true;
            certificateId = cert.id;
            console.log(
              `CERT_GEN: Certificado generado/obtenido para usuario ${user.id} en curso ${courseId} con código ${cert.code}`
            );
          } else {
            console.log(
              `CERT_GEN: No se pudo generar/obtener certificado para usuario ${user.id} en curso ${courseId}.`
            );
          }

          // Enviar notificaciones por email cuando se completa el curso
          try {
            const course = await db.course.findUnique({
              where: { id: courseId },
              select: { id: true, title: true },
            });
            
            // Obtener usuario completo de la base de datos
            const dbUser = await db.user.findUnique({
              where: { id: user.id },
              select: { id: true, email: true, fullName: true, username: true },
            });
            
            if (course && dbUser) {
              await sendCourseCompletionEmails({
                user: {
                  id: dbUser.id,
                  email: dbUser.email || '',
                  fullName: dbUser.fullName || '',
                  username: dbUser.username || '',
                },
                course,
                certificateId: certificateId || undefined,
              });
              console.log(
                `EMAIL_NOTIFICATION: Notificación de finalización enviada para usuario ${user.id} en curso ${courseId}`
              );
            }
          } catch (emailError) {
            console.error(
              `EMAIL_NOTIFICATION: Error al enviar notificación de finalización:`,
              emailError
            );
            // No interrumpir el flujo principal si falla el email
          }
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
