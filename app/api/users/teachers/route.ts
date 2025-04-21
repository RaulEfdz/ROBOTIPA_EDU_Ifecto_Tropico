import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const TEACHER_ID = process.env.TEACHER_ID;
const STUDENT_ID = process.env.STUDENT_ID;
const ADMIN_ID = process.env.ADMIN_ID;
const VISITOR_ID = process.env.VISITOR_ID;

// GET /api/teachers - Devuelve todos los profesores
export async function GET(_req: NextRequest) {
  try {
    // Validación: Asegúrate de que esté configurado el ID del rol de profesor
    if (!TEACHER_ID || typeof TEACHER_ID !== "string") {
      console.error(
        "[API TEACHERS] Environment variable NEXT_PUBLIC_TEACHER_ID is missing or invalid."
      );
      return NextResponse.json(
        {
          error: "Server configuration error: Teacher Role ID is not defined.",
        },
        { status: 500 }
      );
    }

    // Consulta a la base de datos: Usuarios con ese rol
    const teachers = await db.user.findMany({
      where: { customRole: TEACHER_ID },
      orderBy: { fullName: "asc" },
    });

    console.log("----teachers: ");
    console.log(teachers);

    return NextResponse.json({ success: true, teachers });
  } catch (error) {
    console.error("[API TEACHERS GET]", error);
    return NextResponse.json(
      { error: "Internal server error while fetching teachers." },
      { status: 500 }
    );
  }
}
