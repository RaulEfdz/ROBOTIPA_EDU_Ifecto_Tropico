//app/api/payments/paguelo-facil/webhook/route.ts
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const status = body?.status;
    const userId = body?.parm_1;
    const courseId = body?.pfCf?.courseId;

    if (status !== "APPROVED" || !userId || !courseId) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    // Verificar si ya está inscrito
    const existing = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ message: "Ya inscrito" });
    }

    // Inscribir al usuario
    await db.purchase.create({
      data: {
        userId,
        courseId,
      },
    });

    return NextResponse.json({ message: "Usuario inscrito vía webhook" });
  } catch (error) {
    console.error("Error en webhook:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
