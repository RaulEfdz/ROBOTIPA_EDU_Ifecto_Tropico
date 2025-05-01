// app/api/courses/[courseId]/enroll/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  const { courseId } = params;

  try {
    const user = (await getUserDataServerAuth())?.user;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        delete: false,
        isPublished: true,
      },
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const existingPurchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });

    if (existingPurchase) {
      return NextResponse.json({ message: "Already enrolled" });
    }

    // ✅ Registrar la compra sin importar si es gratis o pagado (ya pagó por PagueloFacil)
    const purchase = await db.purchase.create({
      data: {
        userId: user.id,
        courseId: course.id,
      },
    });

    return NextResponse.json({ message: "Enrolled", purchase });
  } catch (error) {
    console.error("[ENROLL_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
