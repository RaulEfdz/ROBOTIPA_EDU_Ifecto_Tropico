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
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    const course = await db.course.findUnique({
      where: {
        isPublished: true,
        id: courseId,
        delete: false,
      },
      select: {
        price: true,
        imageUrl: true,
      },
    });

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
      },
      include: {
        video: true, // ✅ Se incluye el video relacionado
      },
    });

    if (!chapter || !course || chapter.delete || !chapter.isPublished) {
      return NextResponse.json({ message: "Chapter or course not found" }, { status: 404 });
    }

    let attachments: Attachment[] = [];
    let nextChapter: Chapter | null = null;

    if (purchase) {
      attachments = await db.attachment.findMany({
        where: {
          courseId: courseId,
        },
      });
    }

    if (chapter.isFree || purchase) {
      nextChapter = await db.chapter.findFirst({
        where: {
          delete: false,
          courseId: courseId,
          isPublished: true,
          position: {
            gt: chapter.position,
          },
        },
        orderBy: {
          position: "asc",
        },
      });
    }

    const userProgress = await db.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
    });

    return NextResponse.json({
      chapter,
      course,
      video: chapter.video ?? null, // ✅ Enviamos el video directamente
      attachments,
      nextChapter,
      userProgress,
      purchase,
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
      },
      { status: 500 }
    );
  }
}
