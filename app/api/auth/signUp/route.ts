import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // Parsear el cuerpo de la solicitud
    const { emailAddress, emailVerified, id, deviceType } = await req.json();

    // Validación de campos requeridos
    if (!id || !emailAddress || emailVerified === undefined || !deviceType) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios o datos no válidos" },
        { status: 400 }
      );
    }

    // Construcción del objeto de datos del usuario
    const userData: Prisma.UserCreateInput = {
      id,
      emailAddress,
      fullName: "",
      phoneNumber: "",
      countryOfResidence: "",
      age: 0, // Se ajusta para que sea opcional
      gender: "",
      university: "",
      educationLevel: "",
      major: "",
      otherMajor: "",
      specializationArea: "",
      learningObjectives: [],
      otherObjective: "",
      communicationPreferences: [],
      acceptsTerms: true,
      role: "visitor",
      available: false,
      avatar: "",
      isEmailVerified: emailVerified,
      isAdminVerified: false,
      deviceType,
    };

    // Creación del usuario en la base de datos
    const createdUser = await db.user.create({ data: userData });

    return NextResponse.json({ success: true, user: createdUser });
  } catch (error) {
    console.error("[ERROR EN REGISTRO DE USUARIO]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
