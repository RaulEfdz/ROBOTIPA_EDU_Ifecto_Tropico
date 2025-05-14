// app/api/payments/status/[txId]/route.ts
import { NextRequest, NextResponse } from "next/server";

// 🔄 Refactorizado a nueva sintaxis de params (Promise<T>)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ txId: string }> }
) {
  const { txId } = await params;
  const cclw = process.env.PAGUELOFACIL_CCLW!;
  const apiKey = process.env.PAGUELOFACIL_API_KEY!;

  const pfRes = await fetch(
    `https://api.pfserver.net/webservices/rest/getTx?cclw=${cclw}&idTransaccion=${txId}`,
    { headers: { "X-API-Key": apiKey } }
  );
  const data = await pfRes.json();
  return NextResponse.json(data);
}
