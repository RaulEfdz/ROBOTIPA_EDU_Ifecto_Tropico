import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { translateRole } from "@/utils/roles/translate";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId, chapterId } = await params;
  try {
    const { isPublished, ...values } = await req.json();
    const user = (await getUserDataServerAuth())?.user;

    if (!user?.id) return new NextResponse("Unauthorized", { status: 401 });

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
