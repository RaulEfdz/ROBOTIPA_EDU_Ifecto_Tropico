import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; attachmentId: string }> }
) {
  const { courseId, attachmentId } = await params;


  try {
    // Validar que los parámetros existen
    if (!courseId || !attachmentId) {
      return new NextResponse("Missing courseId or attachmentId", { status: 400 });
    }

    // Obtener el usuario autenticado
    const user = (await getUserDataServerAuth())?.user;
    if (!user?.id) {
      return new NextResponse("Unauthorized: User not authenticated", { status: 401 });
    }

    // Verificar que el curso pertenece al usuario
    const course = await db.course.findUnique({
      where: {
        id: courseId,
        userId: user?.id,
        delete: false,
      },
    });

    if (!course) {
      return new NextResponse("Unauthorized: Course not found or access denied", { status: 401 });
    }

    // Verificar que el adjunto existe y pertenece al curso
    const attachment = await db.attachment.findUnique({
      where: {
        id: attachmentId,
      },
    });

    if (!attachment) {
      return new NextResponse("Not Found: Attachment does not exist", { status: 404 });
    }

    if (attachment.courseId !== courseId) {
      return new NextResponse("Unauthorized: Attachment does not belong to the course", { status: 401 });
    }

    // Eliminar el adjunto
    const deleted = await db.attachment.delete({
      where: {
        id: attachmentId,
      },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("[ATTACHMENT_DELETE_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
