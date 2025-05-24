import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Asegúrate de importar tu cliente de base de datos correctamente
import { translateRole } from "@/utils/roles/translate";

export async function POST(req: Request) {
  try {
    // Obtener datos del cuerpo de la solicitud
    const { courseId, chapterId, description } = await req.json();

    if (!courseId || !chapterId || !description) {
      console.error(
        "Error: Faltan campos 'courseId', 'chapterId' o 'description'"
      );
      return new NextResponse("Bad Request: Missing required fields", {
        status: 400,
      });
    }

    // Verificar si el capítulo existe
    const chapterExists = await db.chapter.findFirst({
      where: {
        id: chapterId,
        courseId: courseId,
      },
    });

    if (!chapterExists) {
      console.error("Error: No se encontró el capítulo con el ID:", chapterId);
      return new NextResponse("Not Found: Chapter not found", { status: 404 });
    }

    // Permitir solo si es admin (por ID) o dueño del curso
    const chapterData = await db.chapter.findUnique({
      where: { id: chapterId },
    });
    if (!chapterData) {
      return new NextResponse("Chapter not found", { status: 404 });
    }
    const course = await db.course.findUnique({
      where: { id: chapterData.courseId },
    });

    // Obtener el usuario autenticado (ajusta esto según tu sistema de autenticación)
    // Por ejemplo, si usas NextAuth:
    // import { getServerSession } from "next-auth";
    // const session = await getServerSession(authOptions);
    // const user = session?.user;
    const user = null; // TODO: Reemplaza esto con la obtención real del usuario

    if (!user) {
      return new NextResponse("Unauthorized: User not authenticated", {
        status: 401,
      });
    }

    const isAdmin = translateRole(user.role) === "admin";
    const isOwner = course?.userId === user.id;
    if (!isAdmin && !isOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Actualizar la descripción del capítulo
    const updatedChapter = await db.chapter.update({
      where: {
        delete: false,
        id: chapterId,
      },
      data: {
        description: description,
      },
    });

    console.error("Chapter actualizado:", updatedChapter);

    return NextResponse.json(updatedChapter);
  } catch (error) {
    console.error("[COURSES_CHAPTER_POST] Error en la actualización:", error);

    if (error instanceof TypeError) {
      console.error("Error de tipo:", error.message);
    }

    return new NextResponse("Internal Error", { status: 500 });
  }
}
