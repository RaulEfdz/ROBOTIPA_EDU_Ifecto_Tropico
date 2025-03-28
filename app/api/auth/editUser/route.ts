import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Handler to update an existing user
export async function POST(req: Request) {
  try {
    // Parse request body y asignar valores por defecto
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
      isEmailVerified: emailVerified = false, // Mapeo de nombre
      isAdminVerified = false,
      deviceType = "",
    } = await req.json();

    // Validación de campos obligatorios
    if (!id || !emailAddress || emailVerified === undefined || !deviceType) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios o datos no válidos" },
        { status: 400 }
      );
    }

  
    // Actualizar los datos del usuario en la base de datos
    const updatedUser = await db.user.update({
      where: { id },
      data: {
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
        isEmailVerified: emailVerified, // Almacenar con el nombre correcto
        isAdminVerified,
        deviceType,
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
