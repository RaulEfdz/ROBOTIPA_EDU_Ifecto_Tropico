import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ courseId: string; chapterId: string }> }
) {
  const { courseId } = await params;
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

    // 🟢 Curso gratuito: inscribir directo
    if (!course.price || course.price === 0) {
      const purchase = await db.purchase.create({
        data: {
          userId: user.id,
          courseId: course.id,
        },
      });

      return NextResponse.json({ message: "Enrolled", purchase });
    }

    // 💳 Curso de pago: generar link de pago (placeholder)
    // Aquí deberías generar link real de pago (Stripe, Yappy, etc)
    const fakeCheckoutUrl = `https://payment-provider.com/pay?courseId=${course.id}&userId=${user.id}`;

    return NextResponse.json({ url: fakeCheckoutUrl });
  } catch (error) {
    console.error("[ENROLL_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
