// app/api/mux/generate-upload-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// Initialize Mux client with environment variables
const { MUX_TOKEN_ID, MUX_TOKEN_SECRET } = process.env;

// Validate environment variables
if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
  console.error("Missing Mux API credentials in environment variables");
}

const mux = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
);

const { Video } = mux;

export async function POST(request: NextRequest) {
  try {
    // Check authentication (optional but recommended)
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get optional parameters from request body if needed
    let customParams = {};
    try {
      const body = await request.json();
      if (body.filename) {
        customParams = {
          ...customParams,
          filename: body.filename
        };
      }
    } catch (e) {
      // No body or invalid JSON - continue with default params
    }

    const origin = request.headers.get("origin") || "*";

    // Create upload
    const upload = await Video.Uploads.create({
      new_asset_settings: {
        playback_policy: ["public"],
        mp4_support: "standard",
      },
      cors_origin: origin,
      ...customParams
    });

    // Return the upload URL and ID
    return NextResponse.json({
      uploadUrl: upload.url,
      uploadId: upload.id,
      // Include timeout info for client reference
      timeout: 3600, // 1 hour in seconds
      status: "success"
    });
  } catch (error) {
    console.error("Mux upload URL generation error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate upload URL",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Optionally add a GET method to check upload status
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
    
    // Check authentication (optional but recommended)
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Get upload status
    const upload = await Video.Uploads.get(uploadId);
    
    return NextResponse.json({
      status: "success",
      upload: {
        id: upload.id,
        status: upload.status,
        asset_id: upload.asset_id,
        created_at: upload.created_at
      }
    });
  } catch (error) {
    console.error("Mux upload status check error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to check upload status",
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      },
      { status: 500 }
    );
  }
}