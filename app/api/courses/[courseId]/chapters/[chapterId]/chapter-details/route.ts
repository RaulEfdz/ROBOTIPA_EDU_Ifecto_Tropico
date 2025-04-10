import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Params {
    courseId: string;
    chapterId: string;

}

export async function POST(
  req: NextRequest,
  { params }: {params : Promise<Params>}) {
  try {
    const { courseId, chapterId } = await params;

    if (!courseId || !chapterId) {
      return NextResponse.json({ error: "Missing courseId or chapterId" }, { status: 400 });
    }

    const chapter = await db.chapter.findFirst({
      where: {
        id: chapterId,
        courseId,
        delete: false,
      },
      include: {
        video: true,
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    const courseAttachments = await db.course.findUnique({
      where: {
        id: courseId,
        delete: false,
      },
      select: {
        attachments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return NextResponse.json({
      chapter,
      attachments: courseAttachments?.attachments ?? [],
    });
  } catch (error) {
    console.error("[CHAPTER_DETAILS_API]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
