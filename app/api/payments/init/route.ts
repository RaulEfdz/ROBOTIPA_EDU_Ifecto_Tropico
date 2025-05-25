import { UserDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";
import { Course } from "@/prisma/types";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Utility functions
 */
function toHex(str: string): string {
  return Buffer.from(str, "utf8").toString("hex");
}

function percentEncodeUTF8(str: string): string {
  return encodeURIComponent(str);
}

/**
 * Configuration retrieval and validation
 */
function getConfig() {
  const apiUrlRaw =
    process.env.PAGUELOFACIL_API_URL ||
    "https://secure.paguelofacil.com/LinkDeamon.cfm";
  const apiUrl = apiUrlRaw.endsWith("/LinkDeamon.cfm")
    ? apiUrlRaw
    : apiUrlRaw.replace(/\/+$/, "") + "/LinkDeamon.cfm";

  const cclw = process.env.PAGUELOFACIL_CCLW;
  const apiKey = process.env.PAGUELOFACIL_API_KEY;
  const returnUrlRaw =
    process.env.NEXT_PUBLIC_RETURN_URL || "https://example.com/return";
  const cardTypes = process.env.PAGUELOFACIL_CARD_TYPES || "";
  const expiresIn = process.env.PAGUELOFACIL_EXPIRES_IN || "3600";

  if (!cclw || !apiKey) {
    throw new Error("Payment credentials (CCLW/API_KEY) not configured.");
  }

  return { apiUrl, cclw, apiKey, returnUrlRaw, cardTypes, expiresIn };
}

/**
 * Builds the dynamic payment description
 */
function buildDynamicDescription(
  user: UserDB,
  course: Partial<Course>
): string {
  const date = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // Ensure course.title is defined as string or fallback
  const courseTitle = course.title || "[NombreCurso]";
  const userFullName = user.fullName || "[NombreUsuario]";
  const formattedDate = date;

  return `${courseTitle}-${userFullName}-${formattedDate}`;
}

/**
 * Constructs the URLSearchParams payload
 */
function buildFormParams(
  config: ReturnType<typeof getConfig>,
  body: { amount: number; description: string; email: string; phone: string },
  user: UserDB,
  course: Partial<Course>
): URLSearchParams {
  const { cclw, returnUrlRaw, cardTypes, expiresIn } = config;
  const CCLW = cclw;
  const CMTN = body.amount.toFixed(2);
  const CDSC = percentEncodeUTF8(buildDynamicDescription(user, course));
  const RETURN_URL = toHex(returnUrlRaw);
  const PARM_1 = "";
  const CTAX = "";
  const PF_CF = toHex(JSON.stringify({ email: body.email, phone: body.phone }));
  const CARD_TYPE = cardTypes;
  const EXPIRES_IN = expiresIn;

  return new URLSearchParams({
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
}

/**
 * Handles interaction with PagueloFacil API
 */
async function callPaymentApi(
  apiUrl: string,
  apiKey: string,
  accessToken: string,
  formParams: URLSearchParams
) {
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "*/*",
      "X-API-Key": apiKey,
      Authorization: `Bearer ${accessToken}`,
    },
    body: formParams.toString(),
  });

  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(`PagueloFacil error: ${JSON.stringify(data)}`);
  }

  return data;
}

/**
 * Main handler for POST /api/payments/init
 */
export async function POST(req: NextRequest) {
  try {
    const { amount, description, email, phone, course } = await req.json();

    // Authenticate user
    const session = await getUserDataServerAuth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Usuario no autenticado." },
        { status: 401 }
      );
    }

    // Fetch full user data from DB
    const userRaw = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!userRaw) {
      return NextResponse.json(
        { error: "Usuario no encontrado en la base de datos." },
        { status: 401 }
      );
    }

    // Convert Date fields to string and ensure metadata is an object to match UserDB type
    const user: UserDB = {
      ...userRaw,
      lastSignInAt: userRaw.lastSignInAt
        ? userRaw.lastSignInAt.toISOString()
        : null,
      createdAt: userRaw.createdAt.toISOString(),
      updatedAt: userRaw.updatedAt.toISOString(),
      metadata:
        typeof userRaw.metadata === "object" && userRaw.metadata !== null
          ? userRaw.metadata
          : {},
    };

    // Validate inputs
    if (!amount || !description) {
      return NextResponse.json(
        { error: "Faltan parámetros de pago." },
        { status: 400 }
      );
    }

    // Load config
    const { apiUrl, apiKey, cclw, returnUrlRaw, cardTypes, expiresIn } =
      getConfig();

    // Ensure access token
    const accessToken = session.access_token;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Token de acceso no encontrado." },
        { status: 401 }
      );
    }

    // Build form payload
    const formParams = buildFormParams(
      { apiUrl, cclw, apiKey, returnUrlRaw, cardTypes, expiresIn },
      { amount, description, email, phone },
      user,
      course
    );

    // Call the external API
    const data = await callPaymentApi(apiUrl, apiKey, accessToken, formParams);

    // Log and respond
    console.log("Payment URL:", data.data.url);
    if (data.data.code) console.log("Payment Code:", data.data.code);

    return NextResponse.json(
      { paymentUrl: data.data.url, code: data.data.code },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("[/api/payments/init] Error:", err.message || err);
    const status = err.message.includes("HTTP")
      ? parseInt(err.message.split(" ")[1])
      : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
