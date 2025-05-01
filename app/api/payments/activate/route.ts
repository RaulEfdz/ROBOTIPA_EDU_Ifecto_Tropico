// app/api/payments/activate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";

export async function POST(req: NextRequest) {
  const user = await getCurrentUserFromDBServer();
  if (!user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await req.json();
  if (!courseId)
    return NextResponse.json({ error: "Course ID requerido" }, { status: 400 });

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course || course.delete || !course.isPublished) {
    return NextResponse.json({ error: "Curso no disponible" }, { status: 400 });
  }

  const exists = await db.purchase.findFirst({
    where: { userId: user.id, courseId },
  });
  if (exists) {
    return NextResponse.json({ error: "Ya inscrito" }, { status: 400 });
  }

  await db.purchase.create({ data: { userId: user.id, courseId } });
  return NextResponse.json(
    { message: "Inscripción exitosa." },
    { status: 200 }
  );
}
