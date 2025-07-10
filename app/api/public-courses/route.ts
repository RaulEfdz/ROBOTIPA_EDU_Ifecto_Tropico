// File: app/api/public-courses/route.ts

import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Opcional: Leer parámetros de búsqueda/filtro de la URL si los implementas
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams?.get("categoryId");
    const title = searchParams?.get("title"); // Para búsqueda

    // Construir el filtro de Prisma
    const whereClause: any = {
      isPublished: true,
      delete: false,
    };

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (title) {
      whereClause.title = {
        contains: title,
        mode: "insensitive", // Búsqueda case-insensitive
      };
    }

    const courses = await db.course.findMany({
      where: whereClause,
      select: {
        // Seleccionar solo campos necesarios para la tarjeta de catálogo
        id: true,
        title: true,
        imageUrl: true,
        price: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        chapters: {
          where: {
            isPublished: true,
          },
          select: {
            id: true, // Solo para contar
          },
        },
      },
      orderBy: {
        // Ordenar como prefieras, ej: por fecha de creación
        createdAt: "desc",
      },
    });

    // Transformar datos si es necesario (ej: añadir chaptersLength)
    const coursesWithLength = courses.map((course) => ({
      ...course,
      chaptersLength: course.chapters.length,
    }));

    return NextResponse.json(coursesWithLength);
  } catch (error) {
    console.error("[API_PUBLIC_COURSES_LIST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
