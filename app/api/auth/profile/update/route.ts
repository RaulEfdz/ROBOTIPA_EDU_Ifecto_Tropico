import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

// Handler para actualizar o insertar un usuario
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Desestructuración con valores predeterminados, mapeando los campos al modelo
    const {
      id = "",
      email = "", // se esperaba "emailAddress", ahora se usa "email"
      fullName = "",
      username = "",
      phone = "", // se esperaba "phoneNumber", ahora se usa "phone"
      customRole = "visitor", // se esperaba "role", se renombra a "customRole"
      provider = "",
      // Los siguientes campos se almacenarán en metadata:
      countryOfResidence = "",
      age = 0,
      gender = "",
      university = "",
      educationLevel = "",
      major = "",
      otherMajor = "",
      specializationArea = "",
      learningObjectives = [],
      otherObjective = "",
      communicationPreferences = [],
      acceptsTerms = false,
      available = false,
      avatar = "",
      isEmailVerified = false,
      isAdminVerified = false,
      deviceType = "",
      isDeleted = false, // se renombra de "delete" a "isDeleted"
    } = body;

    // Validación de campos obligatorios
    const errors: string[] = [];
    if (!id) errors.push("El campo 'id' es obligatorio.");
    if (!email) errors.push("El campo 'email' es obligatorio.");
    if (!username) errors.push("El campo 'username' es obligatorio.");
    // Puedes incluir la validación de otros campos si fueran obligatorios

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios o datos no válidos", details: errors },
        { status: 400 }
      );
    }

    // Construir el objeto metadata con los campos adicionales
    const metadata = {
      countryOfResidence,
      age,
      gender,
      university,
      educationLevel,
      major,
      otherMajor,
      specializationArea,
      learningObjectives,
      otherObjective,
      communicationPreferences,
      acceptsTerms,
      available,
      avatar,
      isEmailVerified,
      isAdminVerified,
      deviceType,
    };

    // Actualizar o insertar los datos del usuario en la base de datos
    const updatedUser = await db.user.upsert({
      where: { id },
      update: {
        email,
        fullName,
        username,
        phone,
        customRole,
        provider,
        metadata,
        isDeleted,
      },
      create: {
        id,
        email,
        fullName,
        username,
        phone,
        customRole,
        provider,
        metadata,
        isDeleted,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("[ERROR IN USER UPSERT]", error);
    return NextResponse.json(
      { error: "Internal server error", details: JSON.stringify(error) },
      { status: 500 }
    );
  }
}
