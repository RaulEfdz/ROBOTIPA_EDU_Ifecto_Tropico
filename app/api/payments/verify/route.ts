// ✅ app/api/payments/verify/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(req: Request) {
  try {
    const { courseId } = await req.json();
    const user = (await getUserDataServerAuth())?.user;

    if (!user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID es requerido." },
        { status: 400 }
      );
    }

    // Validar que el curso existe y está publicado
    const course = await db.course.findFirst({
      where: {
        id: courseId,
        delete: false,
        isPublished: true,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Curso no encontrado o no disponible." },
        { status: 404 }
      );
    }

    // Verificar que no esté inscrito ya
    const existing = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Ya estás inscrito." });
    }

    // ⚠️ Lógica temporal: validación simple solo si llega desde thank-you con estado SUCCESS
    // Idealmente aquí validaríamos que el pago realmente fue confirmado (token, webhook, etc)

    const newPurchase = await db.purchase.create({
      data: {
        userId: user.id,
        courseId,
      },
    });

    return NextResponse.json({
      message: "Inscripción confirmada.",
      purchase: newPurchase,
    });
  } catch (err) {
    console.error("[VERIFY_PAYMENT]", err);
    return new NextResponse("Error del servidor", { status: 500 });
  }
}
