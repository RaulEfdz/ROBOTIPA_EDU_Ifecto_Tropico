import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId, chapterId } = await params;
  try {
    const { isPublished, ...values } = await req.json();
    const user = (await getUserDataServerAuth())?.user;

    if (!user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const ownCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId: user.id,
        delete: false,
      },
    });

    if (!ownCourse) return new NextResponse("Unauthorized", { status: 401 });

    const updated = await db.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      data: {
        ...values,
        isPublished,
      },
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[CHAPTER_EDIT]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}