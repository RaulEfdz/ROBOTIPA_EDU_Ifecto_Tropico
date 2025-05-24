import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { translateRole } from "@/utils/roles/translate";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

interface Params {
  courseId: string;
  chapterId: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { courseId, chapterId } = await params;

    if (!courseId || !chapterId) {
      return NextResponse.json(
        { error: "Missing courseId or chapterId" },
        { status: 400 }
      );
    }

    const session = await getUserDataServerAuth();
    const user = session?.user;
    // Permitir solo si es admin (por ID) o dueño del curso
    const chapter = await db.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }
    const course = await db.course.findUnique({
      where: { id: chapter.courseId },
    });

    const isAdmin = user && translateRole(user.role) === "admin";
    const isOwner = user && course?.userId === user.id;
    if (!isAdmin && !isOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
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
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
