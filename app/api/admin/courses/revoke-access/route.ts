import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";

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
    const sessionUser = await getCurrentUserFromDBServer();
    if (!sessionUser) {
      return NextResponse.json(
        {
          error: "No autorizado.",
          details: "El usuario autenticado no se encontró en la base de datos.",
        },
        { status: 403 }
      );
    }
    const user: any = {
      id: sessionUser.id,
      customRole: sessionUser.customRole,
    };
    if (!(await checkAdminOrTeacherPermission(user))) {
      return NextResponse.json(
        {
          error: "No autorizado.",
          details:
            "El usuario autenticado no tiene permisos de administrador o docente para realizar esta acción.",
        },
        { status: 403 }
      );
    }

    const { courseId, userId } = await req.json();
    if (!courseId || !userId) {
      return NextResponse.json(
        {
          error: "Faltan datos obligatorios en la solicitud.",
          details: "Se requieren courseId y userId.",
        },
        { status: 400 }
      );
    }

    // Buscar compra existente
    const purchase = await db.purchase.findFirst({
      where: { courseId, userId },
    });

    if (!purchase) {
      return NextResponse.json(
        {
          error:
            "No se encontró una compra para el usuario y curso especificados.",
          details: "No hay acceso registrado para eliminar.",
        },
        { status: 404 }
      );
    }

    // Eliminar la compra completamente (sin importar si fue manual o por pago)
    await db.purchase.delete({
      where: { id: purchase.id },
    });

    return NextResponse.json({
      message: "Acceso eliminado correctamente.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Error interno del servidor.",
        details:
          error.message ||
          "Ocurrió un error inesperado en el servidor. Por favor, contacte al administrador si el problema persiste.",
      },
      { status: 500 }
    );
  }
}