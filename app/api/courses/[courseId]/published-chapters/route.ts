import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { translateRole } from "@/utils/roles/translate";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId } = await params;
  try {
    const user = (await getUserDataServerAuth())?.user;
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        delete: false,
        isPublished: true,
      },
      include: {
        chapters: {
          where: {
            isPublished: true,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Permitir solo si es admin (por ID), dueño del curso o usuario inscrito
    const isAdmin = translateRole(user.role) === "admin";
    const isOwner = course.userId === user.id;

    // Verificar si el usuario está inscrito
    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
    });

    const isEnrolled = !!purchase;

    if (!isAdmin && !isOwner && !isEnrolled) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error("[API_GET_COURSE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
