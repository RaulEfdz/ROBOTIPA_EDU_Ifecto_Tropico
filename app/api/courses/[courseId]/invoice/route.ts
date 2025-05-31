import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const courseId = url.pathname.split("/")[3]; // Adjust index as needed based on URL structure

  try {
    const session = await getUserDataServerAuth();
    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, message: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    const user = session.user;

    const body = await req.json();

    const { paymentId, concept, amount, currency, paymentMethod } = body;

    if (!paymentId || !concept || !amount || !currency || !paymentMethod) {
      return NextResponse.json(
        {
          success: false,
          message: "Faltan datos obligatorios para crear la factura",
        },
        { status: 400 }
      );
    }

    // Verificar si ya existe una factura para este paymentId
    const existingInvoice = await db.invoice.findFirst({
      where: {
        data: {
          path: ["paymentId"],
          equals: paymentId,
        },
      },
    });

    if (existingInvoice) {
      return NextResponse.json({ success: true, invoice: existingInvoice });
    }

    // Verificar si ya existe un pago con el referenceCode (paymentId)
    let payment = await db.payment.findFirst({
      where: {
        referenceCode: paymentId,
      },
    });

    // Si no existe el pago, crearlo
    if (!payment) {
      payment = await db.payment.create({
        data: {
          userId: user.id,
          amount,
          currency,
          status: "completed",
          referenceCode: paymentId,
          description: concept,
          createdAt: new Date(),
          updatedAt: new Date(),
          metadata: {
            courseId: courseId,
            paymentId: paymentId,
            paymentMethod,
          }, // Puedes agregar más datos si es necesario
        },
      });
    }

    // Crear la factura en la base de datos con userId del usuario autenticado
    const invoice = await db.invoice.create({
      data: {
        userId: user.id,
        concept,
        amount,
        currency,
        status: "issued",
        paymentMethod,
        issuedAt: new Date(),
        paidAt: new Date(),
        data: {
          courseId,
          paymentId: paymentId,
          paymentMethod,
        },
      },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    console.error("Error al crear la factura:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Error interno al crear la factura",
      },
      { status: 500 }
    );
  }
}
