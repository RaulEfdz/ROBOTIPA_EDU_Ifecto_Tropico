import { UserDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { NextRequest, NextResponse } from "next/server";

function toHex(str: string): string {
  return Buffer.from(str, "utf8").toString("hex");
}

function percentEncodeUTF8(str: string): string {
  return encodeURIComponent(str);
}

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
    const user = session ? (session as unknown as UserDB) : null;

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no autenticado." },
        { status: 401 }
      );
    }

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
    let apiUrl =
      process.env.PAGUELOFACIL_API_URL ||
      "https://secure.paguelofacil.com/LinkDeamon.cfm";

    // Ensure apiUrl ends with /LinkDeamon.cfm
    if (!apiUrl.endsWith("/LinkDeamon.cfm")) {
      apiUrl = apiUrl.replace(/\/+$/, "") + "/LinkDeamon.cfm";
    }

    if (!apiKey || !cclw) {
      console.error("[/api/payments/init] Payment credentials not configured.");
      return NextResponse.json(
        { error: "Credenciales de pago no configuradas." },
        { status: 500 }
      );
    }

    const accessToken = session?.access_token;

    if (!accessToken) {
      console.error("[/api/payments/init] Access token not found.");
      return NextResponse.json(
        { error: "Token de acceso no encontrado." },
        { status: 401 }
      );
    }

    // Prepare fields for form-urlencoded body
    const CCLW = cclw;
    const CMTN = amount.toFixed(2);
    // Build dynamic description string
    const dynamicDescription = `Pago curso: ${process.env.COURSE_NAME || "[NombreCurso]"}, Fecha: ${new Date().toISOString().split("T")[0]}, Usuario: ${user?.fullName || "[NombreCompleto]"}, Email: ${user?.email || "[Correo]"}, ID Usuario: ${user?.id || "[UserID]"}, Orden: ${process.env.ORDER_NUMBER || "[OrderNumber]"}`;

    const CDSC = percentEncodeUTF8(dynamicDescription);

    // Use NEXT_PUBLIC_RETURN_URL env var or fallback
    const returnUrlRaw =
      process.env.NEXT_PUBLIC_RETURN_URL || "https://example.com/return";
    const RETURN_URL = toHex(returnUrlRaw);

    const PARM_1 = ""; // No env var found, set empty or add if needed
    const CTAX = ""; // No env var found, set empty or add if needed

    const PF_CF = toHex(JSON.stringify({ email, phone }));

    const CARD_TYPE = process.env.PAGUELOFACIL_CARD_TYPES || "";
    const EXPIRES_IN = process.env.PAGUELOFACIL_EXPIRES_IN || "3600";

    const formBody = new URLSearchParams({
      CCLW,
      CMTN,
      CDSC,
      RETURN_URL,
      PARM_1,
      CTAX,
      PF_CF,
      CARD_TYPE,
      EXPIRES_IN,
    });

    const pfRes = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "*/*",
        "X-API-Key": apiKey,
        Authorization: `Bearer ${accessToken}`,
      },
      body: formBody.toString(),
    });

    if (pfRes.status !== 200) {
      console.error(
        `[/api/payments/init] HTTP error: ${pfRes.status} ${pfRes.statusText}`
      );
      return NextResponse.json(
        {
          error: "Error HTTP al crear la orden de pago.",
          status: pfRes.status,
        },
        { status: pfRes.status }
      );
    }

    const data = await pfRes.json();

    if (!data.success) {
      console.error("[/api/payments/init] PagueloFacil error:", data);
      return NextResponse.json(
        { error: "Error al crear la orden de pago.", details: data },
        { status: 500 }
      );
    }

    // Log the payment URL and code if available
    console.log("[/api/payments/init] Payment URL:", data.data.url);
    if (data.data.code) {
      console.log("[/api/payments/init] Payment Code:", data.data.code);
    }

    return NextResponse.json(
      { paymentUrl: data.data.url, code: data.data.code },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[/api/payments/init] Unexpected error:", err);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
