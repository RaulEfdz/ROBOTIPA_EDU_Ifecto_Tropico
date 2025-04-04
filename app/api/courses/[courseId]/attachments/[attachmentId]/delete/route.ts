import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; attachmentId: string } }
) {
  try {
    const user = (await getCurrentUserFromDBServer());

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verifica que el curso le pertenece al usuario
    const course = await db.course.findUnique({
      where: {
        id: params.courseId,
        userId: user.id,
        delete: false,
      },
    });

    if (!course) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verifica que el archivo exista
    const attachment = await db.attachment.findUnique({
      where: {
        id: params.attachmentId,
      },
    });

    if (!attachment) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Elimina el archivo
    const deleted = await db.attachment.delete({
      where: {
        id: params.attachmentId,
      },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("[ATTACHMENT_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
