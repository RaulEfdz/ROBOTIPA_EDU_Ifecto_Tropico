import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getUserDataServerAuth();
    const user = session?.user.id;

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { courseId } = await params;

    if (!courseId) {
      return new NextResponse("Bad Request: courseId is required", {
        status: 400,
      });
    }

    const body = await req.json();
    const { learningObjectives } = body;

    if (!Array.isArray(learningObjectives)) {
      return new NextResponse(
        "Bad Request: learningObjectives must be an array",
        { status: 400 }
      );
    }

    // Verificar que el curso existe y pertenece al usuario
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        // isPublished: false,
      },
    });

    if (!course) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Asegurarnos que data es un objeto antes de hacer spread
    const currentData =
      typeof course.data === "object" &&
      !Array.isArray(course.data) &&
      course.data !== null
        ? course.data
        : {};

    const updatedCourse = await db.course.update({
      where: {
        id: courseId,
      },
      data: {
        data: {
          ...currentData,
          learningObjectives,
        },
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("[COURSE_LEARNING_OBJECTIVES_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
