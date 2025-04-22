import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const TEACHER_ID = process.env.TEACHER_ID;
const STUDENT_ID = process.env.STUDENT_ID;
const ADMIN_ID = process.env.ADMIN_ID;
const VISITOR_ID = process.env.VISITOR_ID;

// GET /api/admins - Devuelve todos los profesores
export async function GET(_req: NextRequest) {
  try {
    // Validación: Asegúrate de que esté configurado el ID del rol de profesor
    if (!STUDENT_ID || typeof STUDENT_ID !== "string") {
      console.error(
        "[API admins] Environment variable NEXT_PUBLIC_TEACHER_ID is missing or invalid."
      );
      return NextResponse.json(
        {
          error: "Server configuration error: Teacher Role ID is not defined.",
        },
        { status: 500 }
      );
    }

    // Consulta a la base de datos: Usuarios con ese rol
    const students = await db.user.findMany({
      where: { customRole: STUDENT_ID },
      orderBy: { fullName: "asc" },
    });

    console.log("----students: ");
    console.log(students);

    return NextResponse.json({ success: true, students });
  } catch (error) {
    console.error("[API admins GET]", error);
    return NextResponse.json(
      { error: "Internal server error while fetching admins." },
      { status: 500 }
    );
  }
}
