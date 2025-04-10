import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  try {
    const user = (await getUserDataServerAuth())?.user;

    if (!user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const course = await db.course.findUnique({
      where: { id: courseId, userId: user.id, delete: false },
    });

    if (!course) return new NextResponse("Unauthorized", { status: 401 });

    const { title } = await req.json();
    if (!title) return new NextResponse("El título es obligatorio", { status: 400 });

    const chapterCount = await db.chapter.count({ where: { courseId } });

    const newChapter = await db.chapter.create({
      data: {
        title,
        courseId,
        position: chapterCount,
        isPublished: false,
        isFree: false,
        delete: false,
      },
    });

    return NextResponse.json(newChapter, { status: 201 });
  } catch (error) {
    console.error("[CHAPTER_CREATE]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
