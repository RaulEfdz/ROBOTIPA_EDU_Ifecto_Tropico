// app/api/payments/post-payment-validation/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEnrollmentConfirmationEmails } from "@/lib/email-service";
import { getStudentId, getVisitorId } from "@/utils/roles/translate";

export async function POST(req: Request) {
  try {
    const { paymentId, userId, courseId, amount, status, razon } = await req.json();

    console.log("[POST_PAYMENT_VALIDATION] Iniciando validación:", {
      paymentId,
      userId,
      courseId,
      status,
      razon
    });

    if (!paymentId || !userId || !courseId) {
      console.error("[POST_PAYMENT_VALIDATION] Faltan parámetros requeridos:", {
        paymentId,
        userId,
        courseId
      });
      return NextResponse.json(
        { error: "Faltan parámetros requeridos: paymentId, userId, courseId" },
        { status: 400 }
      );
    }

    // Verificar si el pago ya fue procesado
    const existingPayment = await db.payment.findUnique({
      where: { id: paymentId },
    });

    if (existingPayment) {
      console.log("[POST_PAYMENT_VALIDATION] Pago ya procesado:", paymentId);
      
      // Verificar si ya existe la compra
      const existingPurchase = await db.purchase.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });

      if (existingPurchase) {
        return NextResponse.json({ 
          message: "Pago ya procesado y curso ya asignado",
          alreadyProcessed: true 
        });
      }
    }

    // Verificar que el estado sea exitoso
    if (status !== "APROBADA" && status !== "APPROVED") {
      console.log("[POST_PAYMENT_VALIDATION] Estado de pago no exitoso:", status);
      return NextResponse.json(
        { error: `Estado de pago no exitoso: ${status}` },
        { status: 400 }
      );
    }

    // Usar transacción para asegurar consistencia
    const result = await db.$transaction(async (prisma) => {
      // 1. Registrar o actualizar el pago si no existe
      let payment = existingPayment;
      if (!payment) {
        console.log("[POST_PAYMENT_VALIDATION] Creando registro de pago:", paymentId);
        payment = await prisma.payment.create({
          data: {
            id: paymentId,
            userId,
            amount: parseFloat(amount || "0"),
            currency: "USD",
            status: status || "UNKNOWN",
            description: `Pago curso ${courseId} - Validación post-pago`,
            metadata: { 
              razon,
              validationType: "post-payment",
              timestamp: new Date().toISOString()
            },
          },
        });
      }

      // 2. Verificar si ya existe la compra
      const existingPurchase = await prisma.purchase.findUnique({
        where: { userId_courseId: { userId, courseId } },
      });

      if (existingPurchase) {
        console.log("[POST_PAYMENT_VALIDATION] Compra ya existe:", existingPurchase.id);
        return { purchase: existingPurchase, created: false };
      }

      // 3. Crear la compra
      console.log("[POST_PAYMENT_VALIDATION] Creando registro de compra");
      const purchase = await prisma.purchase.create({
        data: { 
          userId, 
          courseId, 
          paymentId: payment.id 
        },
      });

      // 4. Actualizar rol de usuario a "estudiante" si es un "visitante"
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && (user.customRole === getVisitorId() || !user.customRole)) {
        console.log("[POST_PAYMENT_VALIDATION] Actualizando rol de usuario a estudiante");
        await prisma.user.update({
          where: { id: userId },
          data: { customRole: getStudentId() },
        });
      }

      return { purchase, created: true };
    });

    // 5. Enviar correos de confirmación si es una nueva compra
    if (result.created) {
      try {
        console.log("[POST_PAYMENT_VALIDATION] Enviando correos de confirmación");
        const userObj = await db.user.findUnique({
          where: { id: userId },
          select: { id: true, email: true, fullName: true, username: true },
        });
        const courseObj = await db.course.findUnique({
          where: { id: courseId },
          select: { id: true, title: true, price: true },
        });

        if (userObj && courseObj) {
          await sendEnrollmentConfirmationEmails({
            user: userObj,
            course: courseObj,
            purchaseId: paymentId,
            transactionDetails: `Transacción validada post-pago - ${razon || 'Sin razón'}`,
          });
        }
      } catch (emailError) {
        console.error("[POST_PAYMENT_VALIDATION] Error enviando emails:", emailError);
        // No fallar la operación por errores de email
      }
    }

    console.log("[POST_PAYMENT_VALIDATION] Validación completada exitosamente");
    return NextResponse.json({ 
      message: "Validación completada exitosamente",
      purchaseId: result.purchase.id,
      created: result.created
    });

  } catch (error: any) {
    console.error("[POST_PAYMENT_VALIDATION] Error:", error);
    return NextResponse.json(
      { error: `Error en validación post-pago: ${error.message}` },
      { status: 500 }
    );
  }
}