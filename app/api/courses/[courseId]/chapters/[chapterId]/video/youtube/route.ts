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
    
    // Verificar si el curso pertenece al usuario
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

    // Verificar que el capítulo exista
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      include: { video: true },
    });

    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }

    // Si existe un video anterior, se elimina o se actualiza la entrada
    if (chapter.video) {
      await db.video.delete({ where: { chapterId: chapter.id } });
    }

    // Se crea la entrada del video con tipo "youtube"
    const created = await db.video.create({
      data: {
        chapterId: chapter.id,
        url: videoUrl,
        type: "external",
        // Aquí podrías agregar otras propiedades específicas para videos de YouTube si las requieres
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error("[VIDEO_CREATE_YOUTUBE]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
