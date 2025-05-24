// app/api/courses/[courseId]/chapters/[chapterId]/unpublish/route.ts
import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { translateRole } from "@/utils/roles/translate";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId, chapterId } = await params;
  try {
    const user = (await getUserDataServerAuth())?.user;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Permitir solo si es admin (por ID) o dueño del curso
    const chapter = await db.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }
    const course = await db.course.findUnique({
      where: { id: chapter.courseId },
    });
    const isAdmin = translateRole(user.role) === "admin";
    const isOwner = course?.userId === user.id;
    if (!isAdmin && !isOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const unpublishedChapter = await db.chapter.update({
      where: {
        delete: false,
        id: chapterId,
        courseId: courseId,
      },
      data: {
        isPublished: false,
      },
    });

    const publishedChaptersInCourse = await db.chapter.findMany({
      where: {
        courseId: courseId,
        isPublished: true,
      },
    });

    if (!publishedChaptersInCourse.length) {
      await db.course.update({
        where: {
          id: courseId,
          delete: false,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return NextResponse.json(unpublishedChapter);
  } catch (error) {
    console.error("[CHAPTER_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
