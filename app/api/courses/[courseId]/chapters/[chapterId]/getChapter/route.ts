import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Attachment, Chapter, Video } from "@prisma/client";

interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, courseId, chapterId }: GetChapterProps = body;

    if (!userId || !courseId || !chapterId) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // 📌 Compra del curso (para desbloqueo por pago)
    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    // 📌 Curso (validación y carga mínima)
    const course = await db.course.findUnique({
      where: {
        isPublished: true,
        id: courseId,
        delete: false,
      },
      select: {
        price: true,
        imageUrl: true,
        chapters: {
          select: {
            id: true,
            position: true,
          },
        },
      },
    });

    // 📌 Capítulo actual
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
      },
      include: {
        video: true,
      },
    });

    if (!chapter || !course || chapter.delete || !chapter.isPublished) {
      return NextResponse.json(
        { message: "Chapter or course not found" },
        { status: 404 }
      );
    }

    // 📌 Adjuntos solo si está comprado
    let attachments: Attachment[] = [];
    if (purchase) {
      attachments = await db.attachment.findMany({
        where: { courseId },
      });
    }

    // 📌 Capítulo siguiente (si tiene acceso)
    let nextChapter: Chapter | null = null;
    if (chapter.isFree || purchase) {
      nextChapter = await db.chapter.findFirst({
        where: {
          delete: false,
          courseId,
          isPublished: true,
          position: {
            gt: chapter.position,
          },
        },
        orderBy: { position: "asc" },
      });
    }

    // 📌 Progreso del usuario en este capítulo
    const userProgress = await db.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });

    // 📌 Determinar si es el primer capítulo y si el anterior está completado
    let isFirstChapter = false;
    let isPreviousChapterCompleted = true;
    let previousChapterId: string | null = null;

    const previousChapter = await db.chapter.findFirst({
      where: {
        courseId,
        isPublished: true,
        delete: false,
        position: {
          lt: chapter.position,
        },
      },
      orderBy: {
        position: "desc",
      },
    });

    if (previousChapter) {
      previousChapterId = previousChapter.id;
      const previousProgress = await db.userProgress.findUnique({
        where: {
          userId_chapterId: {
            userId,
            chapterId: previousChapter.id,
          },
        },
      });
      isPreviousChapterCompleted = !!previousProgress?.isCompleted;
    } else {
      isFirstChapter = true;
      isPreviousChapterCompleted = true;
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
      previousChapterId, // útil para debug
    });
  } catch (error) {
    console.error("[GET_CHAPTER_ERROR]", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
        chapter: null,
        course: null,
        video: null,
        attachments: [],
        nextChapter: null,
        userProgress: null,
        purchase: null,
        isFirstChapter: false,
        isPreviousChapterCompleted: false,
      },
      { status: 500 }
    );
  }
}
