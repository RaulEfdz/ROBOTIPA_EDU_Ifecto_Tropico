import { remove } from "@/lib/firebase/handlerData";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { nameCollection, id } = await req.json(); // Parseo del body
    // Llamada al método `remove` que interactúa con Firebase
    const result = await remove(nameCollection, id);

    if (result.success) {
      // Respuesta exitosa con status 200
      return NextResponse.json({ message: result.message, status: 200 , confirm: true});
    } else {
      console.error("Error al eliminar el documento:", result.message);
      return NextResponse.json({ error: result.message, status: 400, confirm: false });
    }
  } catch (error: any) {
    console.error("Error al procesar la solicitud de eliminación:", error);

    // En caso de error, retornar un mensaje adecuado
    return NextResponse.json({ error: error.message || "Internal server error", status: 500 });
  }
}
