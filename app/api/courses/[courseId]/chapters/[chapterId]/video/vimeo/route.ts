import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId, chapterId } = await params;

  try {
    const { videoUrl } = await req.json();

    if (!videoUrl) {
      return new NextResponse("Video URL is missing", { status: 400 });
    }

    const user = (await getUserDataServerAuth())?.user;
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verifica si el curso pertenece al usuario
    const ownCourse = await db.course.findUnique({
      where: {
        id: courseId,
        userId: user.id,
        delete: false,
      },
    });

    if (!ownCourse) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verifica que el capítulo exista
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      include: { video: true },
    });

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    // Si ya hay un video, lo eliminamos antes de crear el nuevo
    if (chapter.video) {
      await db.video.delete({ where: { chapterId: chapter.id } });
    }

    // Se crea el nuevo video con tipo "external" (puedes usar "vimeo" si prefieres distinguirlo)
    const created = await db.video.create({
      data: {
        chapterId: chapter.id,
        url: videoUrl,
        type: "vimeo", // También puedes usar "vimeo" si quieres distinguir el origen
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("[VIDEO_CREATE_VIMEO]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
