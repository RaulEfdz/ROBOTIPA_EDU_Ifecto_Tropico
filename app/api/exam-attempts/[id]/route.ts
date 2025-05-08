// File: app/api/exam-attempts/[id]/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const attempt = await db.examAttempt.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      score: true,
      status: true,
      submittedAt: true,
      user: { select: { id: true, fullName: true, email: true } },
      answers: {
        select: {
          questionId: true,
          selectedOptionIds: true,
          textResponse: true,
        },
      },
    },
  });
  if (!attempt) {
    return NextResponse.json(
      { message: "Intento no encontrado" },
      { status: 404 }
    );
  }
  return NextResponse.json(attempt);
}
