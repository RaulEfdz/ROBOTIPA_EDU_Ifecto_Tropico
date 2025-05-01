// app/api/payments/paguelo-facil/route.ts
import { NextResponse } from "next/server";
import {
  createPagueloFacilLink,
  CreatePaymentLinkParams,
} from "./paguelo-facil";

export async function POST(request: Request) {
  let params: CreatePaymentLinkParams;
  try {
    params = await request.json();
  } catch (e) {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const result = await createPagueloFacilLink(params);

  if (result.success) {
    return NextResponse.json({ url: result.url });
  } else {
    const status = result.error?.includes("Configuración") ? 500 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }
}
