import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.UPLOADTHING_SECRET; // Usamos UPLOADTHING_TOKEN

  if (!apiKey) {
    return NextResponse.json({ error: "Missing Uploadthing API token" }, { status: 500 });
  }

  try {
    // Llamada a la API de UploadThing
  
    const response = await fetch("https://api.uploadthing.com/v6/listFiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Uploadthing-Api-Key":
          "sk_live_8dd4d6f1795f6c1e24043ce187502c94b8b1290b5fa8e6f6087e676deba3efe9",
      },
      body: JSON.stringify({}), // Cuerpo vacío según la documentación
    });
  

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to fetch files" },
        { status: response.status }
      );
    }

    const files = await response.json();
    return NextResponse.json(files, { status: 200 });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
