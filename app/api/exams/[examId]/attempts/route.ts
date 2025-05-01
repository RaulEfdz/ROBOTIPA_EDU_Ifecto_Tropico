// app/api/exams/[examId]/attempts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { examId: string } }
) {
  const { examId } = params;

  if (!examId) {
    return NextResponse.json({ error: "Exam ID is required" }, { status: 400 });
  }

  try {
    const attempts = await db.examAttempt.findMany({
      where: { examId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc", // ✅ usamos submittedAt como fecha
      },
    });

    return NextResponse.json({ attempts });
  } catch (error) {
    console.error("❌ Error fetching attempts:", error);
    return NextResponse.json(
      { error: "Error al obtener intentos del examen" },
      { status: 500 }
    );
  }
}
