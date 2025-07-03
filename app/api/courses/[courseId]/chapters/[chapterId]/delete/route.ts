import Mux from "@mux/mux-node";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { translateRole } from "@/utils/roles/translate";

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
);

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId, chapterId } = await params;
  try {
    const user = (await getUserDataServerAuth())?.user;
    if (!user?.id) return new NextResponse("Unauthorized", { status: 401 });

    // Verificar que el capítulo pertenece al curso y que el usuario tiene permisos
    const chapter = await db.chapter.findUnique({
      where: { 
        id: chapterId,
        courseId: courseId, // Asegurar que el capítulo pertenece al curso
      },
      include: { video: true },
    });
    
    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }
    
    const course = await db.course.findUnique({
      where: { id: courseId },
    });
    
    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }
    
    const isAdmin = translateRole(user.role) === "admin";
    const isOwner = course.userId === user.id;
    
    if (!isAdmin && !isOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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
      where: { id: chapterId },
    });

    // ✅ Si no quedan capítulos publicados, despublicar el curso
    const publishedChapters = await db.chapter.findMany({
      where: { courseId: courseId, isPublished: true },
    });

    if (!publishedChapters.length) {
      await db.course.update({
        where: { id: courseId },
        data: { isPublished: false },
      });
    }

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("[CHAPTER_DELETE]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
