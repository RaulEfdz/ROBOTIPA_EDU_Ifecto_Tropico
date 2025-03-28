import { getAll } from "@/lib/firebase/handlerData";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
    try {
      const { nameCollection } = await req.json(); // Parseo del body// Nombre de la colección en Firestore
    const result = await getAll(nameCollection);

    return NextResponse.json(
      { message: "Documentos obtenidos exitosamente", result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error al obtener documentos:", error);

    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
