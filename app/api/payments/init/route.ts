// app/api/payments/init/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { amount, description, email, phone } = body;
    if (!amount || !description || !email || !phone) {
      console.error("[/api/payments/init] Missing parameters:", {
        amount,
        description,
        email,
        phone,
      });
      return NextResponse.json(
        { error: "Faltan parámetros de pago." },
        { status: 400 }
      );
    }

    const apiKey = process.env.PAGUELOFACIL_API_KEY;
    const cclw = process.env.PAGUELOFACIL_CCLW;

    if (!apiKey || !cclw) {
      console.error("[/api/payments/init] Payment credentials not configured.");
      return NextResponse.json(
        { error: "Credenciales de pago no configuradas." },
        { status: 500 }
      );
    }

    const payload = {
      amount,
      email,
      phone,
      concept: description,
      description,
      cclw,
      customFieldValues: [
        { id: "orderId", nameOrLabel: "ID de Orden", value: "12345" },
      ],
    };

    const pfRes = await fetch(
      "https://api.pfserver.net/webservices/rest/regCashTx",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await pfRes.json();

    if (!data.success) {
      console.error("[/api/payments/init] PagueloFacil error:", data);
      return NextResponse.json(
        { error: "Error al crear la orden de pago." },
        { status: 500 }
      );
    }

    return NextResponse.json({ paymentUrl: data.data.url }, { status: 200 });
  } catch (err: any) {
    console.error("[/api/payments/init] Unexpected error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
