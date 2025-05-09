import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  try {
    // Autenticación del usuario
    const session = await getUserDataServerAuth();

    const user = session?.user;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validación del payload
    const { price } = await req.json();
    if (price == null || typeof price !== "number" || price < 0) {
      return new NextResponse(
        "Bad Request: price must be a non-negative number",
        {
          status: 400,
        }
      );
    }

    // Verificar que el curso existe y pertenece al usuario
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
    return new NextResponse("Internal Error", { status: 500 });
  }
}
