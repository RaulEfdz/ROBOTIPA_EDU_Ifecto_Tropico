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
    // Permitir solo si es admin (por ID) o dueño del curso
    const chapter = await db.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter) {
      return NextResponse.json(
        { message: "Chapter not found" },
        { status: 404 }
      );
    }
    const course = await db.course.findUnique({
      where: { id: chapter.courseId },
    });
    // Aquí deberías obtener el usuario autenticado, por ejemplo:
    // const user = ...
    // if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // const isAdmin = translateRole(user.customRole) === "admin";
    // const isOwner = course?.userId === user.id;
    // if (!isAdmin && !isOwner) {
    //   return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    // }

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
