// app/api/courses/[courseId]/chapters/[chapterId]/description/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { translateRole } from "@/utils/roles/translate";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

// GET → Obtener descripción
export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId, chapterId } = await params;

  if (!courseId || !chapterId) {
    return NextResponse.json({ message: "Missing params" }, { status: 400 });
  }

  try {
    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId,
        delete: false, // si usas borrado lógico
      },
      select: { description: true },
    });

    if (!chapter) {
      return NextResponse.json(
        { message: "Chapter not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ description: chapter.description ?? "" });
  } catch (error) {
    console.error("[GET_CHAPTER_DESCRIPTION_ERROR]", error);
    return NextResponse.json(
      { message: "Error fetching chapter description" },
      { status: 500 }
    );
  }
}

// PATCH → Editar descripción
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId, chapterId } = await params;

  if (!courseId || !chapterId) {
    return NextResponse.json({ message: "Missing params" }, { status: 400 });
  }

  try {
    const { description } = await req.json();

    if (typeof description !== "string") {
      return NextResponse.json(
        { message: "Missing or invalid 'description'" },
        { status: 400 }
      );
    }

    // Obtener usuario autenticado
    const user = (await getUserDataServerAuth())?.user;
    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Permitir solo si es admin (por ID) o dueño del curso
    const chapter = await db.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter) {
      return new NextResponse("Chapter not found", { status: 404 });
    }
    const course = await db.course.findUnique({
      where: { id: chapter.courseId },
    });
    const isAdmin = translateRole(user.role) === "admin";
    const isOwner = course?.userId === user.id;
    if (!isAdmin && !isOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedChapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: { description },
      select: { description: true },
    });

    return NextResponse.json({
      message: "Description updated successfully",
      description: updatedChapter.description,
    });
  } catch (error) {
    console.error("[PATCH_CHAPTER_DESCRIPTION_ERROR]", error);
    return NextResponse.json(
      { message: "Error updating chapter description" },
      { status: 500 }
    );
  }
}

// DELETE → Resetear descripción
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId, chapterId } = await params;

  if (!courseId || !chapterId) {
    return NextResponse.json({ message: "Missing params" }, { status: 400 });
  }

  try {
    const chapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: { description: null }, // o "" si prefieres
      select: { description: true },
    });

    return NextResponse.json({
      message: "Description reset successfully",
      description: chapter.description,
    });
  } catch (error) {
    console.error("[DELETE_CHAPTER_DESCRIPTION_ERROR]", error);
    return NextResponse.json(
      { message: "Error resetting chapter description" },
      { status: 500 }
    );
  }
}
