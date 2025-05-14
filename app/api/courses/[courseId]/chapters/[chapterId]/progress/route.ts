// app/api/courses/[courseId]/chapters/[chapterId]/progress/route.ts
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { generateUniqueCertificateCode } from "@/lib/certificate-service";

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
          // Verificar si ya existe certificado
          const existingCertificate = await db.certificate.findFirst({
            where: { userId: user.id, courseId: courseId },
          });
          if (!existingCertificate) {
            const courseData = await db.course.findUnique({
              where: { id: courseId },
            });
            if (user && courseData) {
              const certificateUniqueCode = await generateUniqueCertificateCode(
                courseId,
                user.id
              );
              const defaultTemplateVersion =
                process.env.DEFAULT_CERTIFICATE_TEMPLATE_VERSION || "v1.0";
              const institutionName =
                process.env.NEXT_PUBLIC_NAME_APP || "Tu Plataforma Educativa";
              await db.certificate.create({
                data: {
                  userId: user.id,
                  courseId: courseId,
                  title: courseData.title,
                  institution: institutionName,
                  issuedAt: new Date(),
                  code: certificateUniqueCode,
                  data: {
                    templateVersion: defaultTemplateVersion,
                  },
                },
              });
              console.log(
                `CERT_GEN: Certificado generado para usuario ${user.id} en curso ${courseId} con código ${certificateUniqueCode}`
              );
            }
          } else {
            console.log(
              `CERT_GEN: Certificado ya existe para usuario ${user.id} en curso ${courseId}. No se regenera automáticamente.`
            );
          }
        }
      }
    }
    // --- Fin lógica de generación de certificado ---

    return NextResponse.json(userProgress);
  } catch (error) {
    console.error("[CHAPTER_ID_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
