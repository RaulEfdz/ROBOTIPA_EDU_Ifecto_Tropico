import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { translateRole } from "@/utils/roles/translate";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  try {
    const session = await getUserDataServerAuth();
    const user = session?.user;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        // userId: user.id,
        delete: false,
      },
    });

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Permitir solo si es admin (por ID) o dueño del curso
    const isAdmin = user && translateRole(user.role) === "admin";
    const isOwner = user && course.userId === user.id;
    if (!isAdmin && !isOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const unpublishedCourse = await db.course.update({
      where: {
        id: courseId,
        userId: user.id,
      },
      data: {
        isPublished: false,
      },
    });

    return NextResponse.json(unpublishedCourse);
  } catch (error) {
    console.error("[COURSE_ID_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
