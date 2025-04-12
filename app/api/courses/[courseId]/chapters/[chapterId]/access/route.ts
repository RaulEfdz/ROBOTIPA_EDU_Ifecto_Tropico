import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

// Definimos un esquema para validar que recibimos los campos necesarios
const requestSchema = z.object({
  userId: z.string(),
  courseId: z.string(),
  chapterId: z.string(),
});

export async function POST(
    request: Request,
    { params }: { params: { courseId: string; chapterId: string } }
  ) {
    const { courseId, chapterId } = params;
  
    // Se parsea el body y se validan los datos recibidos

try {
    // Consultamos la base de datos para obtener solo el estado de acceso (isFree)
    const chapter = await db.chapter.findUnique({
      where: { id: chapterId },
      select: { id: true, isFree: true },
    });

    if (!chapter) {
      return NextResponse.json(
        { message: "Chapter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ chapter });
  } catch (error) {
    console.error("[GET_CHAPTER_ACCESS_ERROR]", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
        chapter: null,
      },
      { status: 500 }
    );
  }
}
