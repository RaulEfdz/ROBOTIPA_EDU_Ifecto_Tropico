import { UserDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      amount,
      description,
      email,
      phone,
    }: {
      amount: number;
      description: string;
      email: string;
      phone: string;
    } = await req.json();

    const session = await getUserDataServerAuth();
    // Verificación de que la sesión no sea nula y sea convertida de `SupabaseSession` a `UserDB`
    const user = session ? (session as unknown as UserDB) : null;

    // Validar si el usuario está presente
    if (!user) {
      return NextResponse.json(
        { error: "Usuario no autenticado." },
        { status: 401 }
      );
    }

    // Validación de parámetros de pago
    if (!amount || !description) {
      console.error("[/api/payments/init] Missing parameters:", {
        amount,
        description,
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
        { id: "orderId", nameOrLabel: "ID de Orden", value: "12345" }, // Este ID debe ser dinámico
      ],
    };

    const pfRes = await fetch("https://api.pfserver.net/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(payload),
    });

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
