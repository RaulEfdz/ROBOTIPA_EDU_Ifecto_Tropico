import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Función POST para crear un nuevo examen
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, duration } = body as {
      title?: unknown;
      description?: unknown;
      duration?: unknown;
    };

    // Validación básica de los campos
    if (typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { message: "El título es requerido" },
        { status: 400 }
      );
    }
    if (typeof duration !== "number" || duration <= 0) {
      return NextResponse.json(
        { message: "La duración debe ser un número mayor a 0" },
        { status: 400 }
      );
    }

    // Creación del examen en la base de datos
    const exam = await db.exam.create({
      data: {
        title: title.trim(),
        description:
          typeof description === "string" ? description.trim() : null,
        duration,
        isPublished: false,
      },
    });

    // Responder con el examen creado
    return NextResponse.json(exam, { status: 201 });
  } catch (error: any) {
    console.error("Error creando examen:", error);
    return NextResponse.json(
      { message: error.message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}
