import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.UPLOADTHING_SECRET; // Usamos UPLOADTHING_TOKEN

  if (!apiKey) {
    return NextResponse.json({ error: "Missing Uploadthing API token" }, { status: 500 });
  }

  try {
    const body = await req.json(); // Parsear el cuerpo de la solicitud
    const { files, fileKeys, customIds } = body; // Asegúrate de que el body tiene las propiedades necesarias

    if (!files && !fileKeys && !customIds) {
      return NextResponse.json(
        { error: "Invalid request. Provide at least one of 'files', 'fileKeys', or 'customIds'." },
        { status: 400 }
      );
    }

    // Llamar a la función deleteFiles
    const result = await deleteFiles(apiKey, { files, fileKeys, customIds });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function deleteFiles(
  apiKey: string,
  { files = [], fileKeys = [], customIds = [] }: { files: string[]; fileKeys: string[]; customIds: string[] }
): Promise<{ success: boolean; error?: string }[]> {
  try {
    const response = await fetch("https://api.uploadthing.com/v6/deleteFiles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Uploadthing-Api-Key": apiKey,
      },
      body: JSON.stringify({ files, fileKeys, customIds }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return [
        {
          success: false,
          error: errorData.message || "Unknown error occurred",
        },
      ];
    }

    return [
      {
        success: true,
      },
    ];
  } catch (error: any) {
    return [
      {
        success: false,
        error: error.message,
      },
    ];
  }
}
