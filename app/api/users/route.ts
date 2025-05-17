import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/users - Devuelve todos los usuarios
export async function GET(_req: NextRequest) {
  try {
    // Consulta a la base de datos: Todos los usuarios
    const users = await db.user.findMany({
      // Se ha eliminado el filtro 'where: { customRole: teacherRoleId }'
      orderBy: { fullName: "asc" }, // Mantiene el ordenamiento por nombre
    });

    // Renombrar la clave de respuesta de 'teachers' a 'users'
    return NextResponse.json({ success: true, users });
  } catch (error) {
    // Ajustar el mensaje de error para que sea genérico de usuario
    console.error("[API USERS GET]", error);
    return NextResponse.json(
      { error: "Internal server error while fetching users." },
      { status: 500 }
    );
  }
}
