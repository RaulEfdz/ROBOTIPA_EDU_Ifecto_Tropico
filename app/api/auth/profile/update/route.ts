import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Handler to update or insert a user
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Desestructuración con valores predeterminados
    const {
      id = "",
      emailAddress = "",
      fullName = "",
      phoneNumber = "",
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
      role = "visitor",
      available = false,
      avatar = "",
      isEmailVerified: emailVerified = false, // Renombrar para consistencia
      isAdminVerified = false,
      deviceType = "",
      delete: isDeleted = false, // Campo adicional con valor por defecto
    } = body;

    // Validación de campos obligatorios
    const errors: string[] = [];
    if (!id) errors.push("El campo 'id' es obligatorio.");
    if (!emailAddress) errors.push("El campo 'emailAddress' es obligatorio.");
    if (emailVerified === undefined) errors.push("El campo 'emailVerified' no puede ser indefinido.");
    if (!deviceType) errors.push("El campo 'deviceType' es obligatorio.");

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios o datos no válidos", details: errors },
        { status: 400 }
      );
    }

 
    // Actualizar o insertar los datos del usuario en la base de datos
    const updatedUser = await db.user.upsert({
      where: { id },
      update: {
        emailAddress,
        fullName,
        phoneNumber,
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
        role,
        available,
        avatar,
        isEmailVerified: emailVerified,
        isAdminVerified,
        deviceType,
        delete: isDeleted,
      },
      create: {
        id,
        emailAddress,
        fullName,
        phoneNumber,
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
        role,
        available,
        avatar,
        isEmailVerified: emailVerified,
        isAdminVerified,
        deviceType,
        delete: isDeleted,
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
