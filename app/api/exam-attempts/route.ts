// File: app/api/exam-attempts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // Prisma client
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";

export async function POST(req: NextRequest) {
  // Autenticación del usuario
  const user = await getCurrentUserFromDBServer();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parseo del cuerpo de la petición
  const body = await req.json();
  const { examId, score, answers, timestamp } = body;

  // Validación del payload
  if (
    typeof examId !== "string" ||
    typeof score !== "number" ||
    !Array.isArray(answers) ||
    typeof timestamp !== "string"
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    // Crear el registro de intento de examen
    const attempt = await db.examAttempt.create({
      data: {
        userId: user.id,
        examId,
        score,
        status: "submitted",
        submittedAt: new Date(timestamp),
        // startedAt usará el valor por defecto (now())
      },
    });

    // Guardar cada respuesta
    for (const answer of answers) {
      const { questionId, selectedOptionIds = [], textResponse = "" } = answer;

      await db.answer.create({
        data: {
          attemptId: attempt.id,
          questionId,
          selectedOptionIds,
          textResponse,
          isCorrect: null, // Calcular más adelante si es necesario
        },
      });
    }

    return NextResponse.json(
      { success: true, attemptId: attempt.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /exam-attempts] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
