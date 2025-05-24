import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { translateRole } from "@/utils/roles/translate";

export async function POST(
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

    const { description } = await req.json();

    if (!description || description.trim() === "") {
      return new NextResponse("Bad Request: description is required", {
        status: 400,
      });
    }

    const course = await db.course.findFirst({
      where: {
        id: courseId,
        // userId: user.id,
        delete: false,
      },
    });

    if (!course) {
      return new NextResponse("Not found or unauthorized", { status: 404 });
    }

    // Permitir solo si es admin (por ID) o dueño del curso
    const isAdmin = user && translateRole(user.role) === "admin";
    const isOwner = user && course.userId === user.id;
    if (!isAdmin && !isOwner) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedCourse = await db.course.update({
      where: {
        id: courseId,
      },
      data: {
        description: description.trim(),
      },
      select: {
        id: true,
        description: true,
        isPublished: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCourse,
    });
  } catch (error) {
    console.error("[COURSE_UPDATE_DESCRIPTION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
