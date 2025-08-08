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
    // https://secure.paguelofacil.com/LinkDeamon.cfm
    "";
  const apiUrl = apiUrlRaw.endsWith("/LinkDeamon.cfm")
    ? apiUrlRaw
    : apiUrlRaw.replace(/\/+$/, "") + "/LinkDeamon.cfm";

  const cclw = process.env.PAGUELOFACIL_CCLW;
  const apiKey = process.env.PAGUELOFACIL_API_KEY;
  const returnUrlRaw =
    process.env.NEXT_PUBLIC_RETURN_URL ||
    process.env.NEXT_PUBLIC_BASE_URL + "/return" ||
    "";
  // const cardTypes = process.env.PAGUELOFACIL_CARD_TYPES || "0";
  const expiresIn = process.env.PAGUELOFACIL_EXPIRES_IN || "3600";

  if (!cclw || !apiKey) {
    throw new Error("Payment credentials (CCLW/API_KEY) not configured.");
  }

  return { apiUrl, cclw, apiKey, returnUrlRaw, expiresIn };
}

/**
 * Builds the dynamic payment description including custom description, course title, user, and formatted date
 * Normalizes by removing diacritics, trimming, replacing spaces with hyphens, and stripping special characters
 */
function buildDynamicDescription(
  user: UserDB,
  course: Partial<Course>,
  customDesc: string
): string {
  const dateISO = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  // Normalize: remove diacritics, trim, replace spaces, remove non-alphanumeric except hyphens
  const normalize = (value: string) =>
    value
      .normalize("NFD") // decompose combined letters into letter + diacritic
      .replace(/[̀-ͯ]/g, "") // remove diacritic marks
      .trim()
      .replace(/\s+/g, "-") // replace spaces with hyphens
      .replace(/[^a-zA-Z0-9-]/g, ""); // remove all non-alphanumeric/hyphen characters

  const courseId = normalize(course.id || "[IdCurso]");
  const description = normalize(customDesc || "");
  const userFullName = normalize(user.fullName || "[Usuario]");
  const formattedDate = normalize(dateISO);

  const parts = [courseId, description, userFullName, formattedDate].filter(
    Boolean
  );
  return parts.join("_");
}

/**
 * Constructs the URLSearchParams payload
 */
function buildFormParams(
  config: ReturnType<typeof getConfig>,
  body: {
    amount: number;
    description: string;
    email: string;
    phone: string;
    returnUrl: string;
  },
  user: UserDB,
  course: Partial<Course>
): URLSearchParams {
  const { cclw, expiresIn } = config;
  const CCLW = cclw;
  const CMTN = body.amount.toFixed(2);
  // const CMTN = "1.0";
  const rawDesc = buildDynamicDescription(user, course, body.description);
  const CDSC = percentEncodeUTF8(rawDesc);
  const RETURN_URL = body.returnUrl
    ? toHex(body.returnUrl)
    : toHex(config.returnUrlRaw);
  const PARM_1 = "";
  const CTAX = "";
  const PF_CF = toHex(JSON.stringify({ email: body.email, phone: body.phone }));
  // const CARD_TYPE = cardTypes;
  const EXPIRES_IN = expiresIn;

  return new URLSearchParams({
    CCLW,
    CMTN,
    CDSC,
    RETURN_URL,
    PARM_1,
    CTAX,
    PF_CF,
    // CARD_TYPE,
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
  // Print the decoded RETURN_URL value for inspection
  const returnUrlEncoded = formParams.get("RETURN_URL") || "";
  const returnUrlDecoded = decodeURIComponent(returnUrlEncoded);
  console.log("Calling PagueloFacil API with params:", formParams.toString());
  console.log("Decoded RETURN_URL:", returnUrlDecoded.replace(/%/g, "\\x"));

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

interface PaymentInitPayload {
  amount: number;
  description: string;
  email: string;
  phone: string;
  course: Partial<Course>;
  returnUrl: string;
}

export async function POST(req: NextRequest) {
  try {
    // Extrae los datos según el payload real del frontend
    const { amount, description, customParam1, returnUrl, pfCf, metadata, cardTypes } = await req.json();

    // Extrae los datos relevantes desde pfCf y metadata
    const email = pfCf?.email;
    const phone = pfCf?.phone;
    const fullName = pfCf?.fullName;
    const courseId = pfCf?.courseId || metadata?.courseId;
    // Construye un objeto course mínimo si es necesario
    const course = { id: courseId, title: description?.replace('Curso: ', '') };

    

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

    // Adapt DB record to UserDB
    const user: UserDB = {
      ...userRaw,
      lastSignInAt: userRaw.lastSignInAt?.toISOString() || null,
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
    const config = getConfig();

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
      config,
      { amount, description, email, phone, returnUrl },
      user,
      course
    );

    

    // Call the external API
    const data = await callPaymentApi(
      config.apiUrl,
      config.apiKey,
      accessToken,
      formParams
    );

    // Log and respond
    
    

    return NextResponse.json(
      { url: data.data.url, code: data.data.code },
      { status: 200 }
    );
  } catch (err: any) {
    
    const status =
      typeof err.message === "string" && err.message.startsWith("HTTP")
        ? parseInt(err.message.split(" ")[1], 10)
        : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}
