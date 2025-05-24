import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { translateRole } from "@/utils/roles/translate";

export async function POST(req: NextRequest) {
  // Extract courseId from URL path
  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/");
  // Assuming the path is /api/courses/[courseId]/updates/price
  const courseIdIndex =
    pathSegments.findIndex((segment) => segment === "courses") + 1;
  const courseId = pathSegments[courseIdIndex];

  try {
    // Autenticación del usuario
    const session = await getUserDataServerAuth();
    // const user = session?.user;

    // Validación del payload
    const { price } = await req.json();
    if (price == null || typeof price !== "number" || price < 0) {
      return NextResponse.json(
        { error: "Bad Request: price must be a non-negative number" },
        {
          status: 400,
        }
      );
    }

    // Verificar que el curso existe
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        delete: false,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Not found or unauthorized" },
        { status: 404 }
      );
    }
    // Actualizar precio
    const updatedCourse = await db.course.update({
      where: { id: courseId },
      data: { price },
      select: {
        id: true,
        price: true,
        isPublished: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updatedCourse });
  } catch (error) {
    console.error("[COURSE_UPDATE_PRICE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
