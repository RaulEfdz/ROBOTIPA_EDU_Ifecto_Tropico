// app/api/payments/stations/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const cclw = process.env.PAGUELOFACIL_CCLW!;
  const apiKey = process.env.PAGUELOFACIL_API_KEY!;

  const pfRes = await fetch(
    `https://api.pfserver.net/webservices/rest/getStations?cclw=${cclw}`,
    { headers: { "X-API-Key": apiKey } }
  );
  const stations = await pfRes.json();
  return NextResponse.json(stations);
}
