import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isValid, parse, isFuture } from "date-fns";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDB";

const MANUAL_ACCESS_ID_SEPARATOR =
  process.env.NEXT_PUBLIC_MANUAL_ACCESS_ID_SEPARATOR || "|";

async function checkAdminOrTeacherPermission(user: any) {
  const adminRoleId = process.env.NEXT_PUBLIC_ADMIN_ID;
  const teacherRoleId = process.env.NEXT_PUBLIC_TEACHER_ID;
  return (
    user &&
    (user.customRole === adminRoleId || user.customRole === teacherRoleId)
  );
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUserFromDBServer();
    if (!user || !(await checkAdminOrTeacherPermission(user))) {
      return NextResponse.json({ error: "No autorizado." }, { status: 403 });
    }

    const { code } = await req.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "El parámetro 'code' es requerido." },
        { status: 400 }
      );
    }

    const parts = code.split(MANUAL_ACCESS_ID_SEPARATOR);
    if (parts.length !== 3) {
      return NextResponse.json(
        {
          error:
            "Formato de ID inválido. Debe contener cursoId, userId y fecha.",
        },
        { status: 400 }
      );
    }
    const [courseId, userId, dateStr] = parts;
    if (!courseId || !userId || !dateStr) {
      return NextResponse.json(
        { error: "Faltan datos en el ID de solicitud." },
        { status: 400 }
      );
    }

    // Validar fecha (YYYYMMDD)
    const parsedDate = parse(dateStr, "yyyyMMdd", new Date());
    if (!isValid(parsedDate)) {
      return NextResponse.json(
        { error: "La fecha del ID no es válida. Usa formato YYYYMMDD." },
        { status: 400 }
      );
    }
    if (isFuture(parsedDate)) {
      return NextResponse.json(
        { error: "La fecha de activación no puede ser futura." },
        { status: 400 }
      );
    }

    // Buscar curso y usuario
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json(
        { error: "No se encontró el curso especificado." },
        { status: 404 }
      );
    }
    const userDb = await db.user.findUnique({ where: { id: userId } });
    if (!userDb) {
      return NextResponse.json(
        { error: "No se encontró el usuario especificado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      courseId,
      userId,
      date: parsedDate.toISOString().slice(0, 10),
      courseTitle: course.title,
      userName: userDb.name,
      userEmail: userDb.email,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error interno del servidor." },
      { status: 500 }
    );
  }
}
