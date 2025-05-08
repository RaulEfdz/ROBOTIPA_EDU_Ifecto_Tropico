// File: app/api/exam-attempts/score/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export interface ScoreRequest {
  attemptId: string;
  score: number;
}

export async function POST(req: NextRequest) {
  let body: ScoreRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "JSON inválido" }, { status: 400 });
  }
  const { attemptId, score } = body;
  if (!attemptId) {
    return NextResponse.json(
      { message: "attemptId requerido" },
      { status: 400 }
    );
  }
  if (typeof score !== "number" || score < 0 || score > 100) {
    return NextResponse.json(
      { message: "Score debe ser entre 0 y 100" },
      { status: 422 }
    );
  }
  const existing = await db.examAttempt.findUnique({
    where: { id: attemptId },
  });
  if (!existing) {
    return NextResponse.json(
      { message: "Intento no encontrado" },
      { status: 404 }
    );
  }
  const updated = await db.examAttempt.update({
    where: { id: attemptId },
    data: { score },
  });
  return NextResponse.json(updated);
}
