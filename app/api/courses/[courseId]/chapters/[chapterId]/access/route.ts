// app/api/courses/[courseId]/chapters/[chapterId]/access/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";


export async function POST(
  req: Request,
  { params }: { params: Promise<{ chapterId: string }> }
) {
  const { chapterId } = await params;

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
