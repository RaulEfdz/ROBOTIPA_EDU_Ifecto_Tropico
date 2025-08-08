//app/api/payments/paguelo-facil/webhook/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendEnrollmentConfirmationEmails } from "@/lib/email-service";
import { getStudentId, getVisitorId } from "@/utils/roles/translate";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();
  // Process webhook data

  const params = new URLSearchParams(body);
  const data = {
    status: params.get("Estado"), // Ej: "APROBADA", "RECHAZADA", "No aprobado"
    paymentId: params.get("Oper"),
    customParam1: params.get("PARM_1"), // Debería ser userId|courseId
    amount: params.get("Total"),
    razon: params.get("Razon"),
  };

  if (!data.paymentId || !data.customParam1) {
    return new NextResponse("Webhook Error: Faltan parámetros requeridos.", {
      status: 400,
    });
  }

  try {
    const [userId, courseId] = data.customParam1.split("|");
    if (!userId || !courseId) {
      throw new Error(`Formato de PARM_1 inválido: ${data.customParam1}`);
    }

    // Usamos una transacción de Prisma para asegurar que todas las operaciones se completen o ninguna lo haga.
    await db.$transaction(async (prisma) => {
      const existingPayment = await prisma.payment.findUnique({
        where: { id: data.paymentId! },
      });

      if (existingPayment) {
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

      // 3. Si el pago fue exitoso ("APROBADA"), concedemos el acceso.
      if (data.status === "APROBADA" || data.status === "APPROVED") {
        const purchase = await prisma.purchase.findUnique({
          where: { userId_courseId: { userId, courseId } },
        });

        if (!purchase) {
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
            await sendEnrollmentConfirmationEmails({
              user: userObj,
              course: courseObj,
              purchaseId: data.paymentId!,
              transactionDetails: `Transacción aprobada vía webhook`,
            });
          }
        }
      }
    });

    return NextResponse.json({ message: "Webhook procesado exitosamente" });
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 500 });
  }
}
