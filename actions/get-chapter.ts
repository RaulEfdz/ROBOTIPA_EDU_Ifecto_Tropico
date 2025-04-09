import { db } from "@/lib/db";
import { Attachment, Chapter, Course, UserProgress, Purchase, Video } from "@prisma/client";

interface GetChapterProps {
  userId: string;
  courseId: string;
  chapterId: string;
}

interface GetChapterResult {
  chapter: (Chapter & { video: Video | null }) | null;
  course: Pick<Course, "price"> | null;
  attachments: Attachment[];
  nextChapter: Chapter | null;
  userProgress: UserProgress | null;
  purchase: Purchase | null;
}

export const getChapter = async ({
  userId,
  courseId,
  chapterId,
}: GetChapterProps): Promise<GetChapterResult> => {
  try {
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
        id: courseId,
      },
      select: {
        price: true,
      },
    });

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
      },
      include: {
        video: true, // ✅ Incluimos el video relacionado directamente
      },
    });

    if (!chapter || !course || chapter.delete || !chapter.isPublished || course.price == null) {
      throw new Error("Chapter or course not found or not accessible");
    }

    let attachments: Attachment[] = [];
    let nextChapter: Chapter | null = null;

    if (purchase) {
      attachments = await db.attachment.findMany({
        where: {
          courseId,
        },
      });
    }

    if (chapter.isFree || purchase) {
      nextChapter = await db.chapter.findFirst({
        where: {
          courseId,
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

    return {
      chapter,
      course,
      attachments,
      nextChapter,
      userProgress,
      purchase,
    };
  } catch (error) {
    console.error("[GET_CHAPTER]", error);
    return {
      chapter: null,
      course: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      purchase: null,
    };
  }
};
