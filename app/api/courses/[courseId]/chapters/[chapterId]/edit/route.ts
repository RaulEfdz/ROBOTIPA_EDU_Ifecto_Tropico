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
    const { title, description, videoUrl, isPublished } = await req.json();
    const user = (await getUserDataServerAuth())?.user;

    if (!user?.id) return new NextResponse("Unauthorized", { status: 401 });

    // Verificar que el capítulo pertenece al curso y que el usuario tiene permisos
    const chapter = await db.chapter.findUnique({ 
      where: { 
        id: chapterId,
        courseId: courseId, // Asegurar que el capítulo pertenece al curso
      } 
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

    const dataToUpdate: any = {};
    if (title) dataToUpdate.title = title;
    if (description) dataToUpdate.description = description;
    if (videoUrl) dataToUpdate.videoUrl = videoUrl;
    if (isPublished !== undefined) dataToUpdate.isPublished = isPublished;

    const updated = await db.chapter.update({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      data: dataToUpdate,
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[CHAPTER_EDIT]", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
