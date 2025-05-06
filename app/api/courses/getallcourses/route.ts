import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function GET() {
  try {
    // Verificamos que el usuario esté autenticado
    const userData = await getUserDataServerAuth();
    const user = userData?.user;

    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Traemos todos los cursos, puedes filtrar por userId si quieres solo los del usuario
    const courses = await db.course.findMany({
      where: {
        delete: false, // opcional: si manejas lógica de borrado lógico
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
