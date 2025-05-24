import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseISO } from "date-fns";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import { sendEnrollmentConfirmationEmails } from "@/lib/email-service";
import { UserDB } from "@/app/auth/CurrentUser/getCurrentUserFromDB";

async function checkAdminOrTeacherPermission(user: UserDB) {
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
    const user: UserDB = {
      id: sessionUser.id,
      email: sessionUser.email,
      fullName: sessionUser.fullName,
      username: sessionUser.username,
      phone: sessionUser.phone,
      customRole: sessionUser.customRole,
      provider: sessionUser.provider,
      lastSignInAt: sessionUser.lastSignInAt
        ? sessionUser.lastSignInAt.toISOString()
        : null,
      metadata: (sessionUser.metadata ?? {}) as Record<string, any>,
      isActive: sessionUser.isActive,
      isBanned: sessionUser.isBanned,
      isDeleted: sessionUser.isDeleted,
      createdAt: sessionUser.createdAt.toISOString(),
      updatedAt: sessionUser.updatedAt.toISOString(),
      additionalStatus: sessionUser.additionalStatus,
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

    const { courseId, userId, date, processedByUserId, processedByUserEmail } =
      await req.json();
    const missingFields = [];
    if (!courseId) missingFields.push("courseId");
    if (!userId) missingFields.push("userId");
    if (!date) missingFields.push("date");
    if (!processedByUserId) missingFields.push("processedByUserId");
    if (!processedByUserEmail) missingFields.push("processedByUserEmail");
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Faltan datos obligatorios en la solicitud.",
          details: `Campos faltantes: ${missingFields.join(", ")}. Todos los campos son requeridos.`,
        },
        { status: 400 }
      );
    }

    // Validar curso y usuario
    const course = await db.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json(
        {
          error: "No se encontró el curso especificado.",
          details: `No existe un curso con el id proporcionado: ${courseId}.`,
        },
        { status: 404 }
      );
    }
    const userDb = await db.user.findUnique({ where: { id: userId } });
    if (!userDb) {
      return NextResponse.json(
        {
          error: "No se encontró el usuario especificado.",
          details: `No existe un usuario con el id proporcionado: ${userId}.`,
        },
        { status: 404 }
      );
    }

    // Convertir fecha
    let activationDate: Date;
    try {
      activationDate = parseISO(date);
      if (isNaN(activationDate.getTime())) throw new Error();
    } catch {
      return NextResponse.json(
        {
          error: "Fecha de activación inválida.",
          details:
            "El campo 'date' debe estar en formato ISO (YYYY-MM-DD) y ser una fecha válida.",
        },
        { status: 400 }
      );
    }

    // Metadata de registro manual anidada
    const manualAccessDetails = {
      isManual: true,
      manualEffectiveDate: activationDate.toISOString(),
      processedBy: {
        id: processedByUserId,
        email: processedByUserEmail,
        timestamp: new Date().toISOString(),
      },
    };

    // Buscar Purchase existente
    let purchase = await db.purchase.findFirst({
      where: { userId, courseId },
    });

    if (purchase) {
      // Actualizar metadata anidando manualAccessInfo
      const existingMetadata =
        typeof purchase.metadata === "object" && purchase.metadata !== null
          ? purchase.metadata
          : {};
      const newMetadata = {
        ...existingMetadata,
        manualAccessInfo: manualAccessDetails,
      };
      purchase = await db.purchase.update({
        where: { id: purchase.id },
        data: {
          metadata: newMetadata,
          // No modificar createdAt
        },
      });
    } else {
      // Crear nueva Purchase con metadata anidada
      try {
        purchase = await db.purchase.create({
          data: {
            userId,
            courseId,
            // No modificar createdAt
            metadata: { manualAccessInfo: manualAccessDetails },
          },
        });
      } catch (err: any) {
        if (err.code === "P2002") {
          return NextResponse.json(
            {
              error: "Ya existe una compra para este usuario y curso.",
              details:
                "No se puede crear una nueva compra porque ya existe una compra previa para este usuario y curso. Intente actualizar la compra existente.",
            },
            { status: 409 }
          );
        }
        return NextResponse.json(
          {
            error: "Error al crear la compra.",
            details: err.message || "Error desconocido al crear la compra.",
          },
          { status: 500 }
        );
      }
    }

    // Enviar email de confirmación con la firma original
    await sendEnrollmentConfirmationEmails({
      user: userDb,
      course,
      purchaseId: purchase.id,
      transactionDetails: `Acceso otorgado manualmente el ${activationDate.toLocaleDateString()} por ${processedByUserEmail}.`,
    });

    return NextResponse.json({
      message: "Registro manual completado y notificación enviada.",
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
