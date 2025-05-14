import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseISO } from "date-fns";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import { sendEnrollmentConfirmationEmails } from "@/lib/email-service";

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

    const { courseId, userId, date, processedByUserId, processedByUserEmail } =
      await req.json();
    if (
      !courseId ||
      !userId ||
      !date ||
      !processedByUserId ||
      !processedByUserEmail
    ) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios en la solicitud." },
        { status: 400 }
      );
    }

    // Validar curso y usuario
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

    // Convertir fecha
    let activationDate: Date;
    try {
      activationDate = parseISO(date);
      if (isNaN(activationDate.getTime())) throw new Error();
    } catch {
      return NextResponse.json(
        { error: "Fecha de activación inválida." },
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
            { error: "Ya existe una compra para este usuario y curso." },
            { status: 409 }
          );
        }
        throw err;
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
      { error: error.message || "Error interno del servidor." },
      { status: 500 }
    );
  }
}
