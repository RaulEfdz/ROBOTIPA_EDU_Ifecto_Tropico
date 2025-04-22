import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const TEACHER_ID = process.env.TEACHER_ID;
const STUDENT_ID = process.env.STUDENT_ID;
const ADMIN_ID = process.env.ADMIN_ID;
const VISITOR_ID = process.env.VISITOR_ID;

// GET /api/visitor - Devuelve todos los profesores
export async function GET(_req: NextRequest) {
  try {
    // Validación: Asegúrate de que esté configurado el ID del rol de profesor
    if (!VISITOR_ID || typeof VISITOR_ID !== "string") {
      console.error(
        "[API visitor] Environment variable NEXT_PUBLIC_VISITOR_ID is missing or invalid."
      );
      return NextResponse.json(
        {
          error: "Server configuration error: Teacher Role ID is not defined.",
        },
        { status: 500 }
      );
    }

    // Consulta a la base de datos: Usuarios con ese rol
    const visitor = await db.user.findMany({
      where: { customRole: VISITOR_ID },
      orderBy: { fullName: "asc" },
    });

    console.log("----visitor: ");
    console.log(visitor);

    return NextResponse.json({ success: true, visitor });
  } catch (error) {
    console.error("[API visitor GET]", error);
    return NextResponse.json(
      { error: "Internal server error while fetching visitor." },
      { status: 500 }
    );
  }
}
