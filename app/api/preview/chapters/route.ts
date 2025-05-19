// src/app/api/preview/chapters/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const courseId = searchParams.get("courseId");

  if (!courseId) {
    return NextResponse.json(
      { error: "Course ID is required" },
      { status: 400 }
    );
  }

  try {
    const chapters = await db.chapter.findMany({
      where: {
        courseId: courseId,
        delete: false, // Opcional: si quieres excluir capítulos eliminados
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        isPublished: true,
      },

      orderBy: {
        position: "asc", // Opcional: puedes ordenarlos por posición
      },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error("Error fetching chapter previews:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
