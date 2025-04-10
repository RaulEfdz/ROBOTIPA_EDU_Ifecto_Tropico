import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

// Handler para actualizar un usuario existente
export async function POST(req: NextRequest) {
  try {
    // Parsear el body de la petición y asignar valores por defecto
    const {
      id = "",
      email = "",
      fullName = "",
      username = "",
      phone = "",
      customRole = "visitor",
      provider = "",
      metadata = {},
      isActive = true,
      isBanned = false,
      isDeleted = false,
      additionalStatus = "active",
    } = await req.json();

    // Validación de campos obligatorios
    if (!id || !email || !username) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios: id, email o username" },
        { status: 400 }
      );
    }

    // Actualizar los datos del usuario en la base de datos
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        email,
        fullName,
        username,
        phone,
        customRole,
        provider,
        metadata,
        isActive,
        isBanned,
        isDeleted,
        additionalStatus,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("[ERROR IN USER UPDATE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
