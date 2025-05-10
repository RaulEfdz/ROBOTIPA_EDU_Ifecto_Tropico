// File: app/api/exam-attempts/[id]/getanswers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attemptId = params.id;
    if (!attemptId) {
      return NextResponse.json(
        { error: "Falta el parámetro id" },
        { status: 400 }
      );
    }

    // 1) Traer las respuestas crudas de la tabla Answer
    const rawAnswers = await db.answer.findMany({
      where: { attemptId },
      select: {
        questionId: true,
        selectedOptionIds: true,
        textResponse: true,
      },
    });

    console.log(`[getanswers-raw] attemptId=${attemptId}`, rawAnswers);

    if (rawAnswers.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // 2) Para cada respuesta, cargar la pregunta + opciones con isCorrect
    const detailed = await Promise.all(
      rawAnswers.map(async (ans) => {
        console.log(`[getanswers-answer]`, ans);

        const question = await db.question.findUnique({
          where: { id: ans.questionId },
          select: {
            text: true,
            options: {
              select: {
                id: true,
                text: true,
                isCorrect: true, // <— traemos la marca de correcta
              },
            },
          },
        });

        console.log(
          `[getanswers-question] questionId=${ans.questionId}`,
          question
        );

        if (!question) {
          return {
            questionText: "Pregunta no encontrada",
            correctOptions: [],
            selectedOptions: [],
            textResponse: ans.textResponse || null,
          };
        }

        // 3a) Opciones correctas: donde isCorrect === true
        const correctOptions = question.options
          .filter((o) => o.isCorrect)
          .map((o) => ({ id: o.id, text: o.text }));

        // 3b) Opciones seleccionadas por el usuario
        const selectedOptions = question.options
          .filter((o) => ans.selectedOptionIds.includes(o.id))
          .map((o) => ({ id: o.id, text: o.text }));

        return {
          questionText: question.text,
          correctOptions,
          selectedOptions,
          textResponse: ans.textResponse || null,
        };
      })
    );

    console.log(`[getanswers-final] attemptId=${attemptId}`, detailed);

    return NextResponse.json(detailed);
  } catch (error) {
    console.error(
      "GET /api/exam-attempts/[id]/getanswers error:",
      (error as Error).message
    );
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
