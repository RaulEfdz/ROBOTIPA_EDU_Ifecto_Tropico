// app/api/exam-attempts/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db"; // Prisma client
import { getCurrentUserFromDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";

export async function POST(req: NextRequest) {
  const user = await getCurrentUserFromDBServer();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { examId, answers } = body;

  if (!examId || !Array.isArray(answers)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    // Crear un nuevo intento
    const attempt = await db.examAttempt.create({
      data: {
        userId: user.id,
        examId,
        status: "submitted",
        startedAt: new Date(),
        submittedAt: new Date(),
      },
    });

    // Guardar respuestas
    for (const answer of answers) {
      const { questionId, selectedOptionIds = [], textResponse = "" } = answer;

      await db.answer.create({
        data: {
          attemptId: attempt.id,
          questionId,
          selectedOptionIds,
          textResponse,
          isCorrect: null, // puedes calcularlo después
        },
      });
    }

    return NextResponse.json(
      { success: true, attemptId: attempt.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST_EXAM_ATTEMPT]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
