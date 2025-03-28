import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.UPLOADTHING_SECRET; // Usamos UPLOADTHING_TOKEN

  if (!apiKey) {
    return NextResponse.json({ error: "Missing Uploadthing API token" }, { status: 500 });
  }

  try {
    const body = await req.json(); // Parsear el cuerpo de la solicitud
    const updates = body.updates; // Asegúrate de que el body tiene una propiedad `updates`

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: "Invalid updates format. Expected an array of updates." },
        { status: 400 }
      );
    }

    // Llamar a la función renameFiles
    const result = await renameFiles(apiKey, updates);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    // console.error("Error processing request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function renameFiles(
  apiKey: string,
  updates: { newName: string; fileKey: string }[]
): Promise<{ success: boolean; fileKey: string; error?: string }[]> {
  try {
    const response = await fetch("https://api.uploadthing.com/v6/renameFiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Uploadthing-Api-Key": apiKey,
      },
      body: JSON.stringify({ updates }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      // console.error("Error al renombrar archivos:", errorData);
      return updates.map(({ fileKey }) => ({
        success: false,
        fileKey,
        error: errorData.message || "Unknown error occurred",
      }));
    }

    return updates.map(({ fileKey }) => ({
      success: true,
      fileKey,
    }));
  } catch (error: any) {
    // console.error("Error al realizar la solicitud:", error.message);
    return updates.map(({ fileKey }) => ({
      success: false,
      fileKey,
      error: error.message,
    }));
  }
}
