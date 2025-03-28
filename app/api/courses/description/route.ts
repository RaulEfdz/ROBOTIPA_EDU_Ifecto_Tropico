import { NextResponse } from "next/server";

import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { description, courseId } = await req.json();
    
    // Validamos que los datos requeridos existan
    if (!description || !courseId) {
      return new NextResponse("Invalid input", { status: 400 });
    }

    // Actualizamos la descripción del curso
    const updatedCourse = await db.course.update({
      where: {
        id: courseId,
      },
      data: {
        description,
      },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error updating course description:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
