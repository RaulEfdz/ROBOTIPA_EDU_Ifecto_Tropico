import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const { MUX_TOKEN_ID, MUX_TOKEN_SECRET } = process.env;

if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
  console.error("❌ Missing Mux API credentials in environment variables");
}

const mux = new Mux(MUX_TOKEN_ID!, MUX_TOKEN_SECRET!);
const { Video } = mux;

// POST: Crea una URL de subida (sin autenticación)
export async function POST(request: NextRequest) {
  try {
    let customParams = {};
    try {
      const body = await request.json();
      if (body.filename) {
        customParams = { ...customParams, filename: body.filename };
      }
    } catch {
      // continuar sin filename
    }

    const origin = request.headers.get("origin") || "*";

    const upload = await Video.Uploads.create({
      new_asset_settings: {
        playback_policy: ["public"], // solo esto es necesario
      },
      cors_origin: origin,
      ...customParams,
    });
    
    return NextResponse.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
      timeout: 3600,
      status: "success",
    });
  } catch (error: any) {
    console.error("❌ Mux upload URL generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate upload URL",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// GET: Consulta el estado de subida (sin autenticación)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const uploadId = searchParams.get("uploadId");

    if (!uploadId) {
      return NextResponse.json(
        { error: "Missing uploadId parameter" },
        { status: 400 }
      );
    }

    const upload = await Video.Uploads.get(uploadId);

    return NextResponse.json({
      status: "success",
      upload: {
        id: upload.id,
        status: upload.status,
        asset_id: upload.asset_id,
        created_at: (upload as any).created_at ?? null,
      },
    });
  } catch (error: any) {
    console.error("❌ Mux upload status check error:", error);
    return NextResponse.json(
      {
        error: "Failed to check upload status",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
