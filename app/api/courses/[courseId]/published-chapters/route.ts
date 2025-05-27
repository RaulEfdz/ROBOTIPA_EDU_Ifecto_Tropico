import { NextResponse } from "next/server";
import { getCourseWithPublishedChapters } from "@/app/(course)/courses/[courseId]/getCourseData";
import { translateRole } from "@/utils/roles/translate";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { db } from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId } = await params;
  console.log("API published-chapters - courseId recibido:", courseId);
  try {
    const user = (await getUserDataServerAuth())?.user;
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log(
      "API published-chapters - Antes de llamar a getCourseWithPublishedChapters"
    );
    const course = await getCourseWithPublishedChapters(courseId);
    console.log(
      "API published-chapters - Resultado de getCourseWithPublishedChapters:",
      JSON.stringify(course, null, 2)
    );

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

    console.log(
      "API published-chapters - Respuesta final JSON:",
      JSON.stringify(course, null, 2)
    );
    return NextResponse.json(course);
  } catch (error) {
    console.error("[API_GET_COURSE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
