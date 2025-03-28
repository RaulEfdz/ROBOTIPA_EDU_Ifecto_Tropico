import { add } from "@/lib/firebase/handlerData";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { nameCollection, data } = await req.json(); // Parseo del body

    // Llamada al método `add` que interactúa con Firebase
    const result = await add(nameCollection, data);

    // Respuesta exitosa con status 200
    return NextResponse.json({ message: "Documento agregado exitosamente", result }, { status: 200 });
  } catch (error: any) {
    console.error("Error al agregar documento en Firebase:", error);

    // En caso de error, retornar un mensaje adecuado
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
