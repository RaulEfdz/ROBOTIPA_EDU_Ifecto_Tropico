import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!,
);

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const user = (await getUserDataServerAuth())?.user;
    if (!user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const ownCourse = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: user.id,
        delete: false,
      },
    });

    if (!ownCourse) return new NextResponse("Unauthorized", { status: 401 });

    const chapter = await db.chapter.findUnique({
      where: {
        id: params.chapterId,
      },
      include: {
        video: true, // 👈 Incluimos el video relacionado
      },
    });

    if (!chapter) return new NextResponse("Not Found", { status: 404 });

    // ✅ Si el capítulo tiene video con asset en Mux, eliminarlo
    if (chapter.video?.assetId) {
      await Video.Assets.del(chapter.video.assetId);
    }

    // ✅ Eliminar el registro de Video en la base de datos (si existe)
    if (chapter.video) {
      await db.video.delete({
        where: { chapterId: chapter.id },
      });
    }

    // ✅ Eliminar el capítulo
    const deleted = await db.chapter.delete({
      where: { id: params.chapterId },
    });

    // ✅ Si no quedan capítulos publicados, despublicar el curso
    const publishedChapters = await db.chapter.findMany({
      where: { courseId: params.courseId, isPublished: true },
    });

    if (!publishedChapters.length) {
      await db.course.update({
        where: { id: params.courseId },
        data: { isPublished: false },
      });
    }

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("[CHAPTER_DELETE]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
