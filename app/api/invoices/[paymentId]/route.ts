import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const paymentId = url.pathname.split("/")[3]; // Adjust index as needed based on URL structure

  try {
    const invoice = await db.invoice.findFirst({
      where: {
        data: {
          path: ["paymentId"],
          equals: paymentId,
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { found: false, message: "No se encontró comprobante para este pago" },
        { status: 404 }
      );
    }

    return NextResponse.json({ found: true, invoice });
  } catch (error) {
    console.error("Error al buscar la factura:", error);
    return NextResponse.json(
      { found: false, message: "Error interno al buscar la factura" },
      { status: 500 }
    );
  }
}
