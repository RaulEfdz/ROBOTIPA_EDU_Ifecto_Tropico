//app/api/payments/paguelo-facil/webhook/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendEnrollmentConfirmationEmails } from "@/lib/email-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const status = body?.status;
    const userId = body?.parm_1;
    const courseId = body?.pfCf?.courseId;

    if (status !== "APPROVED" || !userId || !courseId) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    // Verificar si ya está inscrito
    const existing = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Ya inscrito" });
    }

    // Inscribir al usuario
    const purchase = await db.purchase.create({
      data: {
        userId,
        courseId,
      },
    });

    // Obtener datos del usuario y del curso para el email
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, fullName: true, username: true },
    });

    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true, price: true },
    });

    if (user && course) {
      // Envía los correos de confirmación
      await sendEnrollmentConfirmationEmails({
        user,
        course,
        purchaseId: purchase.id,
        transactionDetails: `Transacción aprobada vía webhook`,
      });
    } else {
      console.error(
        `Webhook: Usuario (ID: ${userId}) o Curso (ID: ${courseId}) no encontrado para enviar email. Compra ID: ${purchase.id}`
      );
    }

    return NextResponse.json({ message: "Usuario inscrito vía webhook" });
  } catch (error) {
    console.error("Error en webhook:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
