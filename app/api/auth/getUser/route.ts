import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// Handler para obtener el rol del usuario según el ID
export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "ID de usuario no proporcionado." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true, fullName: true }, // Solo trae el campo `role` para optimización.
    });

    if (!user) {
      return NextResponse.json(
        { error: `Usuario con ID ${userId} no encontrado.` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, role: user.role });
  } catch (error) {
    console.error("[ERROR IN GET USER ROLE]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
