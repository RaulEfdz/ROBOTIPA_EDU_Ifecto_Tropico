import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromDBServer } from "@/app/auth/CurrentUser/getCurrentUserFromDBServer";
import { isTeacher_server } from "@/app/(dashboard)/(routes)/admin/teacher_server";
import { db } from "@/lib/db";
import { sendDocumentApprovalEmails } from "@/lib/email-service";

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
    const { note } = body;

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
      status: "APPROVED",
      timestamp: now.toISOString(),
      previousStatus: existingValidation.status,
      action: "approved_by_admin",
      note: note || "Document approved by administrator",
      reviewerName: user.fullName,
      reviewerId: user.id,
    };

    // Actualizar la validación
    const updatedValidation = await db.documentValidation.update({
      where: { id },
      data: {
        status: "APPROVED",
        reviewedBy: user.id,
        reviewedAt: now,
        rejectionReason: null,
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
      await sendDocumentApprovalEmails({
        user: {
          id: existingValidation.user.id,
          email: existingValidation.user.email,
          fullName: existingValidation.user.fullName,
          username: existingValidation.user.fullName, // Usar fullName como fallback
        },
        fileName: existingValidation.fileName || undefined,
        reviewerName: user.fullName,
        validationId: updatedValidation.id,
      });
    } catch (emailError) {
      console.error("Error sending approval notification email:", emailError);
      // No fallar la aprobación por problemas de email
    }

    return NextResponse.json({
      message: "Document validation approved successfully",
      validation: updatedValidation,
    });

  } catch (error) {
    console.error("[ADMIN_APPROVE_VALIDATION]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}