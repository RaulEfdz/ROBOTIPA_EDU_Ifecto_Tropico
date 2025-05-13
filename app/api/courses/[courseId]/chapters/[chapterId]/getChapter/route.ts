// app/api/courses/[courseId]/chapters/[chapterId]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Attachment, Chapter } from "@prisma/client";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  try {
    const { courseId, chapterId } = await params;
    const user = (await getUserDataServerAuth())?.user;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 📌 Verificar compra para desbloqueo por pago
    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    // 📌 Datos mínimos del curso
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        isPublished: true,
        delete: false,
      },
      select: {
        price: true,
        imageUrl: true,
        chapters: {
          select: { id: true, position: true },
        },
      },
    });

    // 📌 Capítulo actual (incluye video)
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      include: { video: true },
    });

    if (!chapter || !course || chapter.delete || !chapter.isPublished) {
      return new NextResponse("Chapter or course not found", { status: 404 });
    }

    // 📌 Cargar adjuntos solo si hay compra
    const attachments: Attachment[] = purchase
      ? await db.attachment.findMany({ where: { courseId } })
      : [];

    // 📌 Siguiente capítulo (si es gratis o hay compra)
    const nextChapter: Chapter | null =
      chapter.isFree || purchase
        ? await db.chapter.findFirst({
            where: {
              courseId,
              delete: false,
              isPublished: true,
              position: { gt: chapter.position },
            },
            orderBy: { position: "asc" },
          })
        : null;

    // 📌 Progreso del usuario en este capítulo
    const userProgress = await db.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId: user.id,
          chapterId,
        },
      },
    });

    // 📌 Ver si es primer capítulo y si el anterior está completado
    let isFirstChapter = false;
    let isPreviousChapterCompleted = true;
    let previousChapterId: string | null = null;

    const previousChapter = await db.chapter.findFirst({
      where: {
        courseId,
        isPublished: true,
        delete: false,
        position: { lt: chapter.position },
      },
      orderBy: { position: "desc" },
    });

    if (previousChapter) {
      previousChapterId = previousChapter.id;
      const prevProg = await db.userProgress.findUnique({
        where: {
          userId_chapterId: {
            userId: user.id,
            chapterId: previousChapter.id,
          },
        },
      });
      isPreviousChapterCompleted = Boolean(prevProg?.isCompleted);
    } else {
      isFirstChapter = true;
    }

    return NextResponse.json({
      chapter,
      course,
      video: chapter.video ?? null,
      attachments,
      nextChapter,
      userProgress,
      purchase,
      isFirstChapter,
      isPreviousChapterCompleted,
      previousChapterId,
    });
  } catch (error) {
    console.error("[POST_CHAPTER_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
