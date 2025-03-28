import { getSingle } from "@/lib/firebase/handlerData"; // Importa la función correcta
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { nameCollection, id } = await req.json(); // Parseo del body

    // Obtener un solo documento por ID
    const result = await getSingle(nameCollection, id);

    if (!result) {
      return NextResponse.json(
        { message: "Documento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Documento obtenido exitosamente", result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al obtener documento:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
