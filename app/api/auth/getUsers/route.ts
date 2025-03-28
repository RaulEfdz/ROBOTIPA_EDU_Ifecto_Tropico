import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Handler para obtener los datos de varios usuarios según sus IDs
export async function POST(req: Request) {
  try {
    const { userIds } = await req.json();

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: "Lista de IDs de usuarios no proporcionada o inválida." },
        { status: 400 }
      );
    }

    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, role: true, fullName: true, emailAddress: true }, // Trae los campos necesarios para cada usuario
    });

    if (users.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron usuarios con los IDs proporcionados." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error("[ERROR IN GET USERS DATA]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
