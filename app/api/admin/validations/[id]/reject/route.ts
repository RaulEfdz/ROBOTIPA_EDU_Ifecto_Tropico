import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import { isTeacher_server } from "@/app/(dashboard)/(routes)/admin/teacher_server";
import { db } from "@/lib/db";
import { sendDocumentRejectionEmails } from "@/lib/email-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUserFromDBServer();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verificar que el usuario sea admin/teacher
    const isAuthorized = await isTeacher_server(user.id);
    if (!isAuthorized) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const { id } = params;
    const body = await req.json();
    const { reason, note } = body;

    if (!reason) {
      return new NextResponse("Rejection reason is required", { status: 400 });
    }

    // Buscar la validación
    const existingValidation = await db.documentValidation.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          }
        }
      }
    });

    if (!existingValidation) {
      return new NextResponse("Validation not found", { status: 404 });
    }

    if (existingValidation.status !== "PENDING") {
      return new NextResponse("Validation is not pending", { status: 400 });
    }

    const now = new Date();

    // Crear entrada de historial
    const historyEntry = {
      status: "REJECTED",
      timestamp: now.toISOString(),
      previousStatus: existingValidation.status,
      action: "rejected_by_admin",
      note: note || `Document rejected: ${reason}`,
      rejectionReason: reason,
      reviewerName: user.fullName,
      reviewerId: user.id,
    };

    // Actualizar la validación
    const updatedValidation = await db.documentValidation.update({
      where: { id },
      data: {
        status: "REJECTED",
        reviewedBy: user.id,
        reviewedAt: now,
        rejectionReason: reason,
        history: {
          push: historyEntry
        },
        updatedAt: now,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          }
        },
        reviewer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    });

    // Enviar notificación por email al usuario
    try {
      await sendDocumentRejectionEmails({
        user: {
          id: existingValidation.user.id,
          email: existingValidation.user.email,
          fullName: existingValidation.user.fullName,
          username: existingValidation.user.fullName, // Usar fullName como fallback
        },
        fileName: existingValidation.fileName || undefined,
        reviewerName: user.fullName,
        rejectionReason: reason,
        validationId: updatedValidation.id,
      });
    } catch (emailError) {
      console.error("Error sending rejection notification email:", emailError);
      // No fallar el rechazo por problemas de email
    }

    return NextResponse.json({
      message: "Document validation rejected successfully",
      validation: updatedValidation,
    });

  } catch (error) {
    console.error("[ADMIN_REJECT_VALIDATION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}