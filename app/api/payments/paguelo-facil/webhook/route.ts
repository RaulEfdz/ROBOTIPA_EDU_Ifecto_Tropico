//app/api/payments/paguelo-facil/webhook/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendEnrollmentConfirmationEmails } from "@/lib/email-service";
import { getStudentId, getVisitorId } from "@/utils/roles/translate";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();
  
  console.log("[WEBHOOK] Recibido webhook de PagueLo Facil:", body);

  const params = new URLSearchParams(body);
  const data = {
    status: params.get("Estado"), // Ej: "APROBADA", "RECHAZADA", "No aprobado"
    paymentId: params.get("Oper"),
    customParam1: params.get("PARM_1"), // Debería ser userId|courseId
    amount: params.get("Total"),
    razon: params.get("Razon"),
  };

  console.log("[WEBHOOK] Datos extraídos:", data);

  if (!data.paymentId || !data.customParam1) {
    console.error("[WEBHOOK] Error: Faltan parámetros requeridos:", {
      paymentId: data.paymentId,
      customParam1: data.customParam1
    });
    return new NextResponse("Webhook Error: Faltan parámetros requeridos.", {
      status: 400,
    });
  }

  try {
    const [userId, courseId] = data.customParam1.split("|");
    if (!userId || !courseId) {
      console.error("[WEBHOOK] Error: Formato de PARM_1 inválido:", data.customParam1);
      throw new Error(`Formato de PARM_1 inválido: ${data.customParam1}`);
    }

    console.log("[WEBHOOK] Procesando pago para:", { userId, courseId, paymentId: data.paymentId });

    // Usamos una transacción de Prisma para asegurar que todas las operaciones se completen o ninguna lo haga.
    await db.$transaction(async (prisma) => {
      const existingPayment = await prisma.payment.findUnique({
        where: { id: data.paymentId! },
      });

      if (existingPayment) {
        console.log("[WEBHOOK] Pago ya procesado:", data.paymentId);
        return; // Payment already processed
      }

      // 2. Registrar el intento de pago en nuestra base de datos, sin importar el resultado.
      await prisma.payment.create({
        data: {
          id: data.paymentId!,
          userId,
          amount: parseFloat(data.amount || "0"),
          currency: "USD", // O ajusta según tu integración
          status: data.status || "UNKNOWN",
          description: `Pago curso ${courseId}`,
          metadata: Object.fromEntries(params),
        },
      });

      console.log("[WEBHOOK] Pago registrado en DB:", data.paymentId);

      // 3. Si el pago fue exitoso ("APROBADA"), concedemos el acceso.
      if (data.status === "APROBADA" || data.status === "APPROVED") {
        console.log("[WEBHOOK] Pago exitoso, procesando acceso al curso");
        
        const purchase = await prisma.purchase.findUnique({
          where: { userId_courseId: { userId, courseId } },
        });

        if (!purchase) {
          console.log("[WEBHOOK] Creando nuevo registro de compra");
          // Crear el registro de compra
          await prisma.purchase.create({
            data: { userId, courseId, paymentId: data.paymentId! },
          });

          // Actualizar rol de usuario a "estudiante" si es un "visitante"
          const user = await prisma.user.findUnique({ where: { id: userId } });
          if (
            user &&
            (user.customRole === getVisitorId() || !user.customRole)
          ) {
            console.log("[WEBHOOK] Actualizando rol de usuario a estudiante");
            await prisma.user.update({
              where: { id: userId },
              data: { customRole: getStudentId() },
            });
          }

          // Enviar correos de confirmación
          // Buscar datos completos de usuario y curso para el email
          const userObj = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, fullName: true, username: true },
          });
          const courseObj = await prisma.course.findUnique({
            where: { id: courseId },
            select: { id: true, title: true, price: true },
          });
          if (userObj && courseObj) {
            console.log("[WEBHOOK] Enviando correos de confirmación");
            await sendEnrollmentConfirmationEmails({
              user: userObj,
              course: courseObj,
              purchaseId: data.paymentId!,
              transactionDetails: `Transacción aprobada vía webhook`,
            });
          }
        } else {
          console.log("[WEBHOOK] Usuario ya tiene acceso al curso");
        }
      } else {
        console.log("[WEBHOOK] Pago no exitoso, estado:", data.status);
      }
    });

    console.log("[WEBHOOK] Procesamiento completado exitosamente");
    return NextResponse.json({ message: "Webhook procesado exitosamente" });
  } catch (error: any) {
    console.error("[WEBHOOK] Error procesando webhook:", error);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
  }
}
