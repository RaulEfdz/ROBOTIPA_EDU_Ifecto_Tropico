import { NextRequest, NextResponse } from "next/server";

// --- Configuración ---
const UPLOADTHING_API_ENDPOINT = "https://api.uploadthing.com/v6/listFiles";
const UPLOADTHING_API_KEY = process.env.UPLOADTHING_SECRET;

export async function POST(req: NextRequest) {
  // 1. Parámetros por defecto
  const DEFAULT_LIMIT = 10;
  const DEFAULT_OFFSET = 0;

  // 2. Obtener parámetros del cuerpo
  let paginationParams = {
    limit: DEFAULT_LIMIT,
    offset: DEFAULT_OFFSET,
  };

  try {
    const body = await req.json();
    paginationParams = {
      limit: typeof body.limit === "number" ? body.limit : DEFAULT_LIMIT,
      offset: typeof body.offset === "number" ? body.offset : DEFAULT_OFFSET,
    };
  } catch (error) {
    console.warn(
      "No se recibieron parámetros de paginación válidos. Se usarán valores por defecto."
    );
  }

  // 3. Validar API Key
  if (!UPLOADTHING_API_KEY) {
    console.error("Falta la Uploadthing API Key (UPLOADTHING_SECRET).");
    return NextResponse.json(
      {
        error: "Error de configuración: Falta la API key de Uploadthing",
      },
      { status: 500 }
    );
  }

  try {
    console.log(
      `Obteniendo lista de archivos desde ${UPLOADTHING_API_ENDPOINT} con paginación:`,
      paginationParams
    );

    // 4. Solicitud a Uploadthing API
    const response = await fetch(UPLOADTHING_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Uploadthing-Api-Key": UPLOADTHING_API_KEY,
      },
      body: JSON.stringify(paginationParams),
    });

    // 5. Validar respuesta
    if (!response.ok) {
      let errorData = { message: "Error al obtener archivos desde Uploadthing" };
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData.message = await response.text() || errorData.message;
        console.error("Error al interpretar respuesta:", parseError);
      }

      console.error(
        `Error Uploadthing API (${response.status}):`,
        errorData
      );

      return NextResponse.json(
        { error: errorData.message || "Error al obtener archivos" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const files = Array.isArray(data.files) ? data.files : [];

    // 6. Calcular tamaño total
    let totalSizeBytes = 0;
    files.forEach((file: any) => {
      if (file && typeof file.size === "number") {
        totalSizeBytes += file.size;
      } else {
        console.warn(
          "Archivo inválido o sin propiedad 'size':",
          file
        );
      }
    });

    const totalSizeMB = parseFloat(
      (totalSizeBytes / (1024 * 1024)).toFixed(2)
    );

    const totalCount = data.count ?? files.length;
    const totalPages = Math.ceil(totalCount / paginationParams.limit);

    // 7. Respuesta final
    return NextResponse.json(
      {
        files,
        count: totalCount,
        totalSizeBytes,
        totalSizeMB,
        pagination: {
          ...paginationParams,
          currentPage: Math.floor(paginationParams.offset / paginationParams.limit),
          totalPages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error interno al obtener archivos:", error);
    return NextResponse.json(
      { error: "Se produjo un error interno al obtener los archivos" },
      { status: 500 }
    );
  }
}
