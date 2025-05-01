// app/api/payments/init/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("[/api/payments/init] Incoming request");
    const body = await req.json();
    console.log("[/api/payments/init] Request body:", body);

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
    console.log("[/api/payments/init] Loaded env vars:", {
      apiKey: !!apiKey,
      cclw: !!cclw,
    });

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
    console.log("[/api/payments/init] Payload to PagueloFacil:", payload);

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

    console.log(
      "[/api/payments/init] PagueloFacil responded with status:",
      pfRes.status
    );
    const data = await pfRes.json();
    console.log("[/api/payments/init] PagueloFacil response body:", data);

    if (!data.success) {
      console.error("[/api/payments/init] PagueloFacil error:", data);
      return NextResponse.json(
        { error: "Error al crear la orden de pago." },
        { status: 500 }
      );
    }

    console.log("[/api/payments/init] Payment URL:", data.data.url);
    return NextResponse.json({ paymentUrl: data.data.url }, { status: 200 });
  } catch (err: any) {
    console.error("[/api/payments/init] Unexpected error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
