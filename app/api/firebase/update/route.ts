import { add, update } from "@/lib/firebase/handlerData";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { nameCollection, data } = await req.json(); // Parseo del body

    if (!data.id) {
      throw new Error("Falta el ID del documento en los datos para actualizar");
    }

    // Llamada al método `update` que interactúa con Firebase
    const result = await update(nameCollection, data);


    // Respuesta exitosa con status 200
    return NextResponse.json({ message: "Documento actualizado exitosamente", result }, { status: 200 });
  } catch (error: any) {
    console.error("Error al actualizar documento en Firebase:", error);

    // En caso de error, retornar un mensaje adecuado
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
