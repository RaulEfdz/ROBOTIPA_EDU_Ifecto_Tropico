import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Asegúrate de importar tu cliente de base de datos correctamente

export async function POST(req: Request) {
  try {
    // Obtener datos del cuerpo de la solicitud
    const { courseId, chapterId, description } = await req.json();

    if (!courseId || !chapterId || !description) {
      console.error("Error: Faltan campos 'courseId', 'chapterId' o 'description'");
      return new NextResponse("Bad Request: Missing required fields", { status: 400 });
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
