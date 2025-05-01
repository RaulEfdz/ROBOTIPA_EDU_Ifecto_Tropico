// Archivo: app/api/exams/gets/route.ts

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/exams/gets
 * Devuelve sólo los exámenes (id y title) ordenados alfabéticamente
 */
export async function GET() {
  try {
    const exams = await db.exam.findMany({
      select: { id: true, title: true },
      orderBy: { title: "asc" },
    });
    return NextResponse.json({ exams });
  } catch (error) {
    console.error("[EXAMS_GETS] Error al obtener exámenes:", error);
    return NextResponse.json(
      { message: "Error al obtener los exámenes" },
      { status: 500 }
    );
  }
}
