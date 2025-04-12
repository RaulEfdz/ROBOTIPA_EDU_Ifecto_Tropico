import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getUserDataServerAuth } from "@/app/auth/CurrentUser/userCurrentServerAuth";

export async function POST(req: Request) {
  try {
    // Se extrae el título del body y se valida
    const { title } = await req.json();
    if (!title || typeof title !== "string") {
      return new NextResponse("Bad Request: Missing or invalid title", { status: 400 });
    }
    
    // Se obtiene la información del usuario autenticado
    const userData = await getUserDataServerAuth();
    const user = userData?.user;
    if (!user || !user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Creación del curso asociado al usuario autenticado
    const course = await db.course.create({
      data: {
        userId: user.id,
        title,
      },
    });

    return NextResponse.json(course);
  } catch (error) {
    console.error("Error creating course:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
